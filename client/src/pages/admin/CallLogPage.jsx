import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useFetch } from '../../lib/useFetch.js'
import { money, dateTime } from '../../lib/format.js'
import { CALL_STATUSES } from '../../lib/constants.js'
import Spinner from '../../components/Spinner.jsx'
import Pagination from '../../components/Pagination.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import PageHeader from '../PageHeader.jsx'

export default function CallLogPage() {
  const [filters, setFilters] = useState({ status: '', agent: '', page: 1 })
  const { data: agents } = useFetch('/agents')
  const { data, loading, error } = useFetch('/calls', {
    params: {
      status: filters.status || undefined,
      agent: filters.agent || undefined,
      page: filters.page,
      pageSize: 20,
    },
  })

  const setFilter = (patch) => setFilters((f) => ({ ...f, ...patch, page: patch.page ?? 1 }))

  return (
    <>
      <PageHeader title="Call Log" subtitle={data ? `${data.total} calls` : ''} />

      <div className="card mb-4 flex flex-wrap gap-3 p-4">
        <select
          className="input max-w-[12rem]"
          value={filters.agent}
          onChange={(e) => setFilter({ agent: e.target.value })}
        >
          <option value="">All agents</option>
          {(agents || []).map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <select
          className="input max-w-[12rem]"
          value={filters.status}
          onChange={(e) => setFilter({ status: e.target.value })}
        >
          <option value="">All outcomes</option>
          {CALL_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-sm text-rose-600">{error}</p>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="th">Customer</th>
                  <th className="th">Agent</th>
                  <th className="th">Outcome</th>
                  <th className="th">Amount</th>
                  <th className="th">Notes</th>
                  <th className="th">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.rows.map((c) => (
                  <tr key={c.id}>
                    <td className="td">
                      <Link
                        to={`/admin/customers/${c.customer.id}`}
                        className="font-medium hover:text-brand-600"
                      >
                        {c.customer.name}
                      </Link>
                      <div className="text-xs text-slate-400">{c.customer.phone}</div>
                    </td>
                    <td className="td">{c.agent?.name || '—'}</td>
                    <td className="td">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="td">{c.saleAmount ? money(c.saleAmount) : '—'}</td>
                    <td className="td max-w-xs truncate text-slate-500">{c.notes || '—'}</td>
                    <td className="td text-slate-500">{dateTime(c.createdAt)}</td>
                  </tr>
                ))}
                {data.rows.length === 0 && (
                  <tr>
                    <td className="td text-slate-500" colSpan={6}>
                      No calls match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            page={data.page}
            pageSize={data.pageSize}
            total={data.total}
            onPage={(p) => setFilter({ page: p })}
          />
        </div>
      )}
    </>
  )
}
