import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useFetch } from '../lib/useFetch.js'
import { money, dateTime, dateOnly } from '../lib/format.js'
import Spinner from '../components/Spinner.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import PageHeader from './PageHeader.jsx'

export default function CustomerDetailPage() {
  const { id } = useParams()
  const { isAdmin } = useAuth()
  const { data: customer, loading, error } = useFetch(`/customers/${id}`)

  if (loading) return <Spinner />
  if (error) return <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>

  const backTo = isAdmin ? '/admin/customers' : '/agent/customers'

  return (
    <>
      <PageHeader
        title={customer.name}
        subtitle={customer.phone}
        actions={
          <>
            <Link to={backTo} className="btn-ghost">
              ← Back
            </Link>
            {!isAdmin && (
              <Link to={`/agent/call?customer=${customer.id}`} className="btn-primary">
                📞 Call
              </Link>
            )}
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card space-y-3 p-5">
          <Row label="Status" value={<StatusBadge status={customer.status} />} />
          <Row label="Email" value={customer.email || '—'} />
          <Row label="City" value={customer.city || '—'} />
          <Row label="Assigned agent" value={customer.assignedAgent?.name || 'Unassigned'} />
          <Row label="Last call" value={customer.lastCallAt ? dateTime(customer.lastCallAt) : '—'} />
          <Row label="Next follow-up" value={dateOnly(customer.nextFollowUpAt)} />
          <Row label="Added by" value={customer.createdBy?.name || '—'} />
          {customer.notes && (
            <div>
              <p className="label">Notes</p>
              <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
                {customer.notes}
              </p>
            </div>
          )}
        </div>

        <div className="card lg:col-span-2">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">
              Call History · {customer.calls.length}
            </h2>
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {customer.calls.map((c) => (
              <li key={c.id} className="flex items-start justify-between gap-3 px-5 py-4">
                <div>
                  <StatusBadge status={c.status} />
                  {c.notes && (
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{c.notes}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    {c.agent?.name} · {dateTime(c.createdAt)}
                    {c.followUpAt ? ` · follow-up ${dateOnly(c.followUpAt)}` : ''}
                  </p>
                </div>
                {c.saleAmount > 0 && (
                  <span className="whitespace-nowrap text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {money(c.saleAmount)}
                  </span>
                )}
              </li>
            ))}
            {customer.calls.length === 0 && (
              <li className="px-5 py-6 text-sm text-slate-500 dark:text-slate-400">
                No calls logged yet.
              </li>
            )}
          </ul>
        </div>
      </div>
    </>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <span className="text-sm text-slate-700 dark:text-slate-200">{value}</span>
    </div>
  )
}
