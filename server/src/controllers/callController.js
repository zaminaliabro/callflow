import { z } from 'zod'
import { prisma } from '../prisma.js'
import { parseBody, notFound, forbidden } from '../utils/http.js'

const CALL_STATUS = ['INTERESTED', 'NOT_INTERESTED', 'CALLBACK', 'NO_ANSWER', 'SALE']

const logSchema = z
  .object({
    customerId: z.string().min(1),
    status: z.enum(CALL_STATUS),
    notes: z.string().trim().optional().or(z.literal('')),
    saleAmount: z.coerce.number().min(0).optional(),
    followUpAt: z.coerce.date().optional().nullable(),
  })
  .refine((d) => d.status !== 'SALE' || (d.saleAmount ?? 0) > 0, {
    message: 'Sale amount is required when the outcome is a Sale',
    path: ['saleAmount'],
  })

// POST /api/calls  — log a call outcome; also advances the customer record
export async function logCall(req, res) {
  const data = parseBody(logSchema, req.body)

  const customer = await prisma.customer.findUnique({ where: { id: data.customerId } })
  if (!customer) throw notFound('Customer not found')
  if (req.user.role === 'AGENT' && customer.assignedAgentId !== req.user.id) {
    throw forbidden('This customer is not assigned to you')
  }

  const agentId =
    req.user.role === 'AGENT' ? req.user.id : customer.assignedAgentId || req.user.id

  const saleAmount = data.status === 'SALE' ? data.saleAmount || 0 : 0

  const [call] = await prisma.$transaction([
    prisma.call.create({
      data: {
        customerId: customer.id,
        agentId,
        status: data.status,
        notes: data.notes || null,
        saleAmount,
        followUpAt: data.followUpAt || null,
      },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        agent: { select: { id: true, name: true } },
      },
    }),
    prisma.customer.update({
      where: { id: customer.id },
      data: {
        status: data.status,
        lastCallAt: new Date(),
        nextFollowUpAt:
          data.followUpAt !== undefined ? data.followUpAt : customer.nextFollowUpAt,
      },
    }),
  ])

  res.status(201).json(call)
}

// GET /api/calls?agent=&status=&customer=&page=&pageSize=
export async function listCalls(req, res) {
  const { agent, status, customer, page = '1', pageSize = '20' } = req.query
  const take = Math.min(Number(pageSize) || 20, 100)
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take

  const where = {}
  if (req.user.role === 'AGENT') where.agentId = req.user.id
  else if (agent) where.agentId = agent
  if (status && CALL_STATUS.includes(status)) where.status = status
  if (customer) where.customerId = customer

  const [total, rows] = await Promise.all([
    prisma.call.count({ where }),
    prisma.call.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        agent: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
  ])

  res.json({ total, page: Number(page), pageSize: take, rows })
}
