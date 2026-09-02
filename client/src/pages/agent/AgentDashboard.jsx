import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useFetch } from '../../lib/useFetch.js'
import { money, number, dateTime, dateOnly } from '../../lib/format.js'
import Spinner from '../../components/Spinner.jsx'
import StatCard from '../../components/StatCard.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import SalesChart from '../../components/SalesChart.jsx'
import PageHeader from '../PageHeader.jsx'

export default function AgentDashboard() {
  const { user } = useAuth()
  const { data, loading, error } = useFetch('/dashboard/agent')

  if (loading) return <Spinner />
  if (error) return <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>

  const { stats, series, recentCalls, followUps } = data

  return (
    <>
      <PageHeader
        title={`Hi, ${user.name.split(' ')[0]}`}
        subtitle="Your calls, targets and follow-ups"
        actions={
          <Link to="/agent/call" className="btn-primary">
            📞 Start calling
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="My Customers" value={number(stats.myCustomers)} icon="📋" accent="slate" />
        <StatCard
          label="Calls Today"
          value={number(stats.todayCalls)}
          sub={`${number(stats.monthCalls)} this month`}
          icon="📞"
          accent="brand"
        />
        <StatCard
          label="Sales This Month"
          value={money(stats.monthSales)}
          sub={`${number(stats.monthSalesCount)} deals`}
          icon="💰"
          accent="emerald"
        />
        <StatCard
          label="Target"
          value={stats.targetPct != null ? `${stats.targetPct}%` : '—'}
          sub={money(stats.target)}
          icon="🎯"
          accent="amber"
        />
      </div>

      {stats.target > 0 && (
        <div className="mt-4 card p-5">
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              Monthly target progress
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              {money(stats.monthSales)} / {money(stats.target)}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-brand-500"
              style={{ width: `${Math.min(stats.targetPct || 0, 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">
            My sales — last 30 days
          </h2>
          <SalesChart data={series} metric="sales" />
        </div>

        <div className="card p-5">
          <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">
            🔔 Upcoming follow-ups
          </h2>
          <ul className="space-y-3">
            {followUps.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    to={`/agent/customers/${c.id}`}
                    className="block truncate text-sm font-medium text-slate-800 hover:text-brand-600 dark:text-slate-200 dark:hover:text-brand-400"
                  >
                    {c.name}
                  </Link>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{c.phone}</p>
                </div>
                <span className="whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                  {dateOnly(c.nextFollowUpAt)}
                </span>
              </li>
            ))}
            {followUps.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Nothing due in the next few days.
              </p>
            )}
          </ul>
        </div>
      </div>

      <div className="mt-4 card">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">My recent calls</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="thead">
              <tr>
                <th className="th">Customer</th>
                <th className="th">Outcome</th>
                <th className="th">Amount</th>
                <th className="th">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentCalls.map((c) => (
                <tr key={c.id}>
                  <td className="td font-medium">{c.customer?.name || '—'}</td>
                  <td className="td">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="td">{c.saleAmount ? money(c.saleAmount) : '—'}</td>
                  <td className="td text-slate-500 dark:text-slate-400">{dateTime(c.createdAt)}</td>
                </tr>
              ))}
              {recentCalls.length === 0 && (
                <tr>
                  <td className="td text-slate-500 dark:text-slate-400" colSpan={4}>
                    No calls yet — head to the Call Console.
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
