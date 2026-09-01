import { Link, useParams } from 'react-router-dom'
import { useFetch } from '../../lib/useFetch.js'
import { money, number, dateTime } from '../../lib/format.js'
import Spinner from '../../components/Spinner.jsx'
import StatCard from '../../components/StatCard.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import SalesChart from '../../components/SalesChart.jsx'
import PageHeader from '../PageHeader.jsx'

export default function AgentDetailPage() {
  const { id } = useParams()
  const { data, loading, error } = useFetch(`/agents/${id}`)

  if (loading) return <Spinner />
  if (error) return <p className="text-sm text-rose-600">{error}</p>

  const { agent, stats, series, recentCalls } = data

  return (
    <>
      <PageHeader
        title={agent.name}
        subtitle={`${agent.email}${agent.phone ? ' · ' + agent.phone : ''}`}
        actions={
          <Link to="/admin/agents" className="btn-ghost">
            ← Back to agents
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Assigned Customers" value={number(stats.customers)} icon="📋" accent="slate" />
        <StatCard label="Calls (this month)" value={number(stats.monthCalls)} icon="📞" accent="brand" />
        <StatCard
          label="Sales (this month)"
          value={money(stats.monthSales)}
          sub={`${number(stats.monthSalesCount)} deals`}
          icon="💰"
          accent="emerald"
        />
        <StatCard
          label="Target"
          value={stats.targetPct != null ? `${stats.targetPct}%` : '—'}
          sub={money(agent.monthlyTarget)}
          icon="🎯"
          accent="amber"
        />
      </div>

      <div className="mt-4 card p-5">
        <h2 className="mb-3 font-semibold text-slate-900">Sales — last 30 days</h2>
        <SalesChart data={series} metric="sales" />
      </div>

      <div className="mt-4 card">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Call History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="th">Customer</th>
                <th className="th">Outcome</th>
                <th className="th">Amount</th>
                <th className="th">Notes</th>
                <th className="th">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentCalls.map((c) => (
                <tr key={c.id}>
                  <td className="td font-medium">{c.customer?.name || '—'}</td>
                  <td className="td"><StatusBadge status={c.status} /></td>
                  <td className="td">{c.saleAmount ? money(c.saleAmount) : '—'}</td>
                  <td className="td max-w-xs truncate text-slate-500">{c.notes || '—'}</td>
                  <td className="td text-slate-500">{dateTime(c.createdAt)}</td>
                </tr>
              ))}
              {recentCalls.length === 0 && (
                <tr>
                  <td className="td text-slate-500" colSpan={5}>
                    No calls logged.
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
