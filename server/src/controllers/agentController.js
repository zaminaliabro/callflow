import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../prisma.js'
import { parseBody, notFound, badRequest } from '../utils/http.js'
import { callTotals, dailySeries, startOfMonth } from '../utils/stats.js'

const publicSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  phone: true,
  isActive: true,
  monthlyTarget: true,
  createdAt: true,
}

const createSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(6),
  phone: z.string().trim().optional().or(z.literal('')),
  monthlyTarget: z.coerce.number().min(0).default(0),
})

const updateSchema = z.object({
  name: z.string().trim().min(2).optional(),
  email: z.string().trim().email().optional(),
  password: z.string().min(6).optional(),
  phone: z.string().trim().optional().or(z.literal('')),
  monthlyTarget: z.coerce.number().min(0).optional(),
  isActive: z.boolean().optional(),
})

// GET /api/agents  — list every agent with this-month totals + assigned-customer count
export async function listAgents(_req, res) {
  const agents = await prisma.user.findMany({
    where: { role: 'AGENT' },
    select: { ...publicSelect, _count: { select: { assignedCustomers: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const since = startOfMonth()
  const withStats = await Promise.all(
    agents.map(async (a) => {
      const totals = await callTotals({ agentId: a.id, since })
      return {
        ...a,
        customers: a._count.assignedCustomers,
        _count: undefined,
        monthCalls: totals.calls,
        monthSales: totals.salesAmount,
        monthSalesCount: totals.salesCount,
        targetPct: a.monthlyTarget > 0 ? Math.round((totals.salesAmount / a.monthlyTarget) * 100) : null,
      }
    }),
  )
  res.json(withStats)
}

// GET /api/agents/:id — profile + performance + recent call history
export async function getAgent(req, res) {
  const agent = await prisma.user.findFirst({
    where: { id: req.params.id, role: 'AGENT' },
    select: publicSelect,
  })
  if (!agent) throw notFound('Agent not found')

  const since = startOfMonth()
  const [allTime, thisMonth, series, recentCalls, customers] = await Promise.all([
    callTotals({ agentId: agent.id }),
    callTotals({ agentId: agent.id, since }),
    dailySeries({ agentId: agent.id, days: 30 }),
    prisma.call.findMany({
      where: { agentId: agent.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { customer: { select: { id: true, name: true, phone: true } } },
    }),
    prisma.customer.count({ where: { assignedAgentId: agent.id } }),
  ])

  res.json({
    agent,
    stats: {
      customers,
      allTimeCalls: allTime.calls,
      allTimeSales: allTime.salesAmount,
      monthCalls: thisMonth.calls,
      monthSales: thisMonth.salesAmount,
      monthSalesCount: thisMonth.salesCount,
      targetPct:
        agent.monthlyTarget > 0
          ? Math.round((thisMonth.salesAmount / agent.monthlyTarget) * 100)
          : null,
    },
    series,
    recentCalls,
  })
}

// POST /api/agents
export async function createAgent(req, res) {
  const data = parseBody(createSchema, req.body)
  const agent = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone || null,
      monthlyTarget: data.monthlyTarget,
      role: 'AGENT',
      passwordHash: await bcrypt.hash(data.password, 10),
    },
    select: publicSelect,
  })
  res.status(201).json(agent)
}

// PUT /api/agents/:id
export async function updateAgent(req, res) {
  const data = parseBody(updateSchema, req.body)
  const existing = await prisma.user.findFirst({ where: { id: req.params.id, role: 'AGENT' } })
  if (!existing) throw notFound('Agent not found')

  const patch = {}
  if (data.name !== undefined) patch.name = data.name
  if (data.email !== undefined) patch.email = data.email.toLowerCase()
  if (data.phone !== undefined) patch.phone = data.phone || null
  if (data.monthlyTarget !== undefined) patch.monthlyTarget = data.monthlyTarget
  if (data.isActive !== undefined) patch.isActive = data.isActive
  if (data.password) patch.passwordHash = await bcrypt.hash(data.password, 10)

  const agent = await prisma.user.update({
    where: { id: req.params.id },
    data: patch,
    select: publicSelect,
  })
  res.json(agent)
}

// DELETE /api/agents/:id — customers are unassigned (schema onDelete: SetNull)
export async function deleteAgent(req, res) {
  const existing = await prisma.user.findFirst({ where: { id: req.params.id, role: 'AGENT' } })
  if (!existing) throw notFound('Agent not found')
  if (req.user.id === existing.id) throw badRequest('You cannot delete your own account')

  await prisma.user.delete({ where: { id: req.params.id } })
  res.json({ ok: true })
}
