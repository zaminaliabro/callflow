import { prisma } from '../prisma.js'
import {
  callTotals,
  dailySeries,
  topAgents,
  startOfMonth,
  startOfToday,
  daysAgo,
} from '../utils/stats.js'

// GET /api/dashboard/admin
export async function adminDashboard(_req, res) {
  const monthStart = startOfMonth()
  const todayStart = startOfToday()
  const weekStart = daysAgo(6)

  const [allTime, month, today, week, totalAgents, totalCustomers, recentCalls, agents, series, leaders] =
    await Promise.all([
      callTotals({}),
      callTotals({ since: monthStart }),
      callTotals({ since: todayStart }),
      callTotals({ since: weekStart }),
      prisma.user.count({ where: { role: 'AGENT', isActive: true } }),
      prisma.customer.count(),
      prisma.call.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          agent: { select: { id: true, name: true } },
        },
      }),
      prisma.user.aggregate({ where: { role: 'AGENT', isActive: true }, _sum: { monthlyTarget: true } }),
      dailySeries({ days: 30 }),
      topAgents(5),
    ])

  const statusBreakdown = await prisma.customer.groupBy({
    by: ['status'],
    _count: { _all: true },
  })

  res.json({
    totals: {
      totalCalls: allTime.calls,
      totalSales: allTime.salesAmount,
      totalSalesCount: allTime.salesCount,
      totalAgents,
      totalCustomers,
      teamMonthlyTarget: agents._sum.monthlyTarget || 0,
    },
    periods: {
      today: { calls: today.calls, sales: today.salesAmount },
      week: { calls: week.calls, sales: week.salesAmount },
      month: { calls: month.calls, sales: month.salesAmount },
    },
    monthTargetPct:
      (agents._sum.monthlyTarget || 0) > 0
        ? Math.round((month.salesAmount / agents._sum.monthlyTarget) * 100)
        : null,
    series,
    recentCalls,
    topAgents: leaders,
    statusBreakdown: statusBreakdown.map((s) => ({ status: s.status, count: s._count._all })),
  })
}

// GET /api/dashboard/agent
export async function agentDashboard(req, res) {
  const agentId = req.user.id
  const monthStart = startOfMonth()
  const todayStart = startOfToday()

  const [allTime, month, today, series, recentCalls, myCustomers, followUps] = await Promise.all([
    callTotals({ agentId }),
    callTotals({ agentId, since: monthStart }),
    callTotals({ agentId, since: todayStart }),
    dailySeries({ agentId, days: 30 }),
    prisma.call.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { customer: { select: { id: true, name: true, phone: true } } },
    }),
    prisma.customer.count({ where: { assignedAgentId: agentId } }),
    prisma.customer.findMany({
      where: {
        assignedAgentId: agentId,
        nextFollowUpAt: { not: null, lte: new Date(Date.now() + 3 * 864e5) },
      },
      orderBy: { nextFollowUpAt: 'asc' },
      take: 10,
      include: { assignedAgent: { select: { id: true, name: true } } },
    }),
  ])

  const target = req.user.monthlyTarget || 0
  res.json({
    stats: {
      myCustomers,
      allTimeCalls: allTime.calls,
      allTimeSales: allTime.salesAmount,
      todayCalls: today.calls,
      monthCalls: month.calls,
      monthSales: month.salesAmount,
      monthSalesCount: month.salesCount,
      target,
      targetPct: target > 0 ? Math.round((month.salesAmount / target) * 100) : null,
    },
    series,
    recentCalls,
    followUps,
  })
}
