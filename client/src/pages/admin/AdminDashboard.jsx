import { Link } from 'react-router-dom'
import { useFetch } from '../../lib/useFetch.js'
import { money, number, dateTime } from '../../lib/format.js'
import Spinner from '../../components/Spinner.jsx'
import StatCard from '../../components/StatCard.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import SalesChart from '../../components/SalesChart.jsx'
import PageHeader from '../PageHeader.jsx'

export default function AdminDashboard() {
  const { data, loading, error } = useFetch('/dashboard/admin')

  if (loading) return <Spinner />
  if (error) return <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>

  const { totals, periods, monthTargetPct, series, recentCalls, topAgents } = data

  return (
    <>
      <PageHeader title="Admin Dashboard" subtitle="Team-wide sales and call activity" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Calls" value={number(totals.totalCalls)} icon="📞" accent="brand" />
        <StatCard
          label="Total Sales"
          value={money(totals.totalSales)}
          sub={`${number(totals.totalSalesCount)} closed deals`}
          icon="💰"
          accent="emerald"
        />
        <StatCard label="Active Agents" value={number(totals.totalAgents)} icon="👥" accent="slate" />
        <StatCard
          label="Monthly Target"
          value={monthTargetPct != null ? `${monthTargetPct}%` : '—'}
          sub={`${money(periods.month.sales)} of ${money(totals.teamMonthlyTarget)}`}
          icon="🎯"
          accent="amber"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Sales — last 30 days</h2>
            <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span>Today: {money(periods.today.sales)}</span>
              <span>Week: {money(periods.week.sales)}</span>
              <span>Month: {money(periods.month.sales)}</span>
            </div>
          </div>
          <SalesChart data={series} metric="sales" />
        </div>

        <div className="card p-5">
          <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">
            🏆 Top Agents (this month)
          </h2>
          <ul className="space-y-3">
            {topAgents.map((a, i) => (
              <li key={a.id} className="flex items-center gap-3">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/admin/agents/${a.id}`}
                    className="block truncate text-sm font-medium text-slate-800 hover:text-brand-600 dark:text-slate-200 dark:hover:text-brand-400"
                  >
                    {a.name}
                  </Link>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {number(a.calls)} calls · {number(a.salesCount)} sales
                  </p>
                </div>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {money(a.sales)}
                </span>
              </li>
            ))}
            {topAgents.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">No data yet.</p>
            )}
          </ul>
        </div>
      </div>

      <div className="mt-4 card">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">📋 Recent Calls</h2>
          <Link
            to="/admin/calls"
            className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="thead">
              <tr>
                <th className="th">Customer</th>
                <th className="th">Agent</th>
                <th className="th">Outcome</th>
                <th className="th">Amount</th>
                <th className="th">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentCalls.map((c) => (
                <tr key={c.id}>
                  <td className="td">
                    <Link
                      to={`/admin/customers/${c.customer.id}`}
                      className="font-medium hover:text-brand-600 dark:hover:text-brand-400"
                    >
                      {c.customer.name}
                    </Link>
                    <div className="text-xs text-slate-400 dark:text-slate-500">{c.customer.phone}</div>
                  </td>
                  <td className="td">{c.agent?.name || '—'}</td>
                  <td className="td">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="td">{c.saleAmount ? money(c.saleAmount) : '—'}</td>
                  <td className="td text-slate-500 dark:text-slate-400">{dateTime(c.createdAt)}</td>
                </tr>
              ))}
              {recentCalls.length === 0 && (
                <tr>
                  <td className="td text-slate-500 dark:text-slate-400" colSpan={5}>
                    No calls logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
