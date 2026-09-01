import { z } from 'zod'
import { prisma } from '../prisma.js'
import { parseBody, notFound, forbidden } from '../utils/http.js'

const CUSTOMER_STATUS = ['NEW', 'INTERESTED', 'NOT_INTERESTED', 'CALLBACK', 'NO_ANSWER', 'SALE']

const agentSelect = { select: { id: true, name: true, email: true } }

const baseSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(3),
  email: z.string().email().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  assignedAgentId: z.string().optional().nullable(),
  nextFollowUpAt: z.coerce.date().optional().nullable(),
})

const updateSchema = baseSchema.partial().extend({
  status: z.enum(CUSTOMER_STATUS).optional(),
})

// GET /api/customers?search=&status=&agent=&page=&pageSize=
export async function listCustomers(req, res) {
  const { search, status, agent, page = '1', pageSize = '20' } = req.query
  const take = Math.min(Number(pageSize) || 20, 100)
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take

  const where = {}
  if (req.user.role === 'AGENT') {
    where.assignedAgentId = req.user.id
  } else if (agent) {
    where.assignedAgentId = agent
  }
  if (status && CUSTOMER_STATUS.includes(status)) where.status = status
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { city: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [total, rows] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      include: { assignedAgent: agentSelect, _count: { select: { calls: true } } },
      orderBy: [{ nextFollowUpAt: { sort: 'asc', nulls: 'last' } }, { createdAt: 'desc' }],
      skip,
      take,
    }),
  ])

  res.json({ total, page: Number(page), pageSize: take, rows })
}

// GET /api/customers/:id  (+ call history)
export async function getCustomer(req, res) {
  const customer = await prisma.customer.findUnique({
    where: { id: req.params.id },
    include: {
      assignedAgent: agentSelect,
      createdBy: agentSelect,
      calls: {
        orderBy: { createdAt: 'desc' },
        include: { agent: { select: { id: true, name: true } } },
      },
    },
  })
  if (!customer) throw notFound('Customer not found')
  if (req.user.role === 'AGENT' && customer.assignedAgentId !== req.user.id) {
    throw forbidden('This customer is not assigned to you')
  }
  res.json(customer)
}

// POST /api/customers
export async function createCustomer(req, res) {
  const data = parseBody(baseSchema, req.body)

  // Agents may only create customers assigned to themselves.
  const assignedAgentId =
    req.user.role === 'AGENT' ? req.user.id : data.assignedAgentId || null

  const customer = await prisma.customer.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      city: data.city || null,
      notes: data.notes || null,
      nextFollowUpAt: data.nextFollowUpAt || null,
      assignedAgentId,
      createdById: req.user.id,
    },
    include: { assignedAgent: agentSelect },
  })
  res.status(201).json(customer)
}

// PUT /api/customers/:id
export async function updateCustomer(req, res) {
  const data = parseBody(updateSchema, req.body)
  const existing = await prisma.customer.findUnique({ where: { id: req.params.id } })
  if (!existing) throw notFound('Customer not found')

  const isAgent = req.user.role === 'AGENT'
  if (isAgent && existing.assignedAgentId !== req.user.id) {
    throw forbidden('This customer is not assigned to you')
  }

  const patch = {}
  for (const f of ['name', 'phone', 'city', 'notes']) {
    if (data[f] !== undefined) patch[f] = data[f] || null
  }
  if (data.email !== undefined) patch.email = data.email || null
  if (data.nextFollowUpAt !== undefined) patch.nextFollowUpAt = data.nextFollowUpAt || null
  if (data.status !== undefined) patch.status = data.status
  // Only admins can reassign.
  if (!isAgent && data.assignedAgentId !== undefined) {
    patch.assignedAgentId = data.assignedAgentId || null
  }

  const customer = await prisma.customer.update({
    where: { id: req.params.id },
    data: patch,
    include: { assignedAgent: agentSelect },
  })
  res.json(customer)
}

// PUT /api/customers/:id/assign  { agentId }  (admin)
export async function assignCustomer(req, res) {
  const { agentId } = parseBody(z.object({ agentId: z.string().nullable() }), req.body)
  if (agentId) {
    const agent = await prisma.user.findFirst({ where: { id: agentId, role: 'AGENT' } })
    if (!agent) throw notFound('Agent not found')
  }
  const customer = await prisma.customer.update({
    where: { id: req.params.id },
    data: { assignedAgentId: agentId },
    include: { assignedAgent: agentSelect },
  })
  res.json(customer)
}

// DELETE /api/customers/:id  (admin)
export async function deleteCustomer(req, res) {
  await prisma.customer.delete({ where: { id: req.params.id } })
  res.json({ ok: true })
}
