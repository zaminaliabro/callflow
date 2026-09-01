import { Prisma } from '@prisma/client'
import { prisma } from '../prisma.js'

export function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}
export function startOfToday(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}
export function daysAgo(n) {
  const d = startOfToday()
  d.setDate(d.getDate() - n)
  return d
}

// Aggregate call counts + sale totals for an optional agent, since a date.
export async function callTotals({ agentId = null, since = null } = {}) {
  const where = {}
  if (agentId) where.agentId = agentId
  if (since) where.createdAt = { gte: since }

  const [calls, saleAgg] = await Promise.all([
    prisma.call.count({ where }),
    prisma.call.aggregate({
      where: { ...where, status: 'SALE' },
      _sum: { saleAmount: true },
      _count: true,
    }),
  ])

  return {
    calls,
    salesCount: saleAgg._count,
    salesAmount: saleAgg._sum.saleAmount || 0,
  }
}

// Daily time-series of calls + sale amount for the last `days` days.
export async function dailySeries({ agentId = null, days = 30 } = {}) {
  const since = daysAgo(days - 1)
  const agentFilter = agentId ? Prisma.sql`AND "agentId" = ${agentId}` : Prisma.empty

  const rows = await prisma.$queryRaw`
    SELECT to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') AS date,
           COUNT(*)::int AS calls,
           COALESCE(SUM(CASE WHEN status = 'SALE' THEN "saleAmount" ELSE 0 END), 0)::float AS sales
    FROM "Call"
    WHERE "createdAt" >= ${since} ${agentFilter}
    GROUP BY 1
    ORDER BY 1
  `

  // Fill gaps so the chart has one point per day.
  const map = new Map(rows.map((r) => [r.date, r]))
  const out = []
  for (let i = 0; i < days; i++) {
    const d = daysAgo(days - 1 - i)
    const key = d.toISOString().slice(0, 10)
    out.push(map.get(key) || { date: key, calls: 0, sales: 0 })
  }
  return out
}

// Top agents by sale amount this month.
export async function topAgents(limit = 5) {
  const since = startOfMonth()
  const rows = await prisma.$queryRaw`
    SELECT u.id, u.name, u.email,
           COUNT(c.id)::int AS calls,
           COALESCE(SUM(CASE WHEN c.status = 'SALE' THEN c."saleAmount" ELSE 0 END), 0)::float AS sales,
           COUNT(c.id) FILTER (WHERE c.status = 'SALE')::int AS "salesCount",
           u."monthlyTarget"
    FROM "User" u
    LEFT JOIN "Call" c ON c."agentId" = u.id AND c."createdAt" >= ${since}
    WHERE u.role = 'AGENT' AND u."isActive" = true
    GROUP BY u.id, u.name, u.email, u."monthlyTarget"
    ORDER BY sales DESC, calls DESC
    LIMIT ${limit}
  `
  return rows
}
