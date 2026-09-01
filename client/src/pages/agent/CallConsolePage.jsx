import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api, { apiError } from '../../api/client.js'
import { useFetch } from '../../lib/useFetch.js'
import { money, dateTime, dateOnly } from '../../lib/format.js'
import { CALL_STATUSES } from '../../lib/constants.js'
import Spinner from '../../components/Spinner.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { Field, TextArea, TextInput } from '../../components/Field.jsx'
import PageHeader from '../PageHeader.jsx'

const EMPTY = { status: 'INTERESTED', notes: '', saleAmount: '', followUpAt: '' }

export default function CallConsolePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedId = searchParams.get('customer') || ''
  const [search, setSearch] = useState('')

  const { data: list, loading: listLoading } = useFetch('/customers', {
    params: { search: search || undefined, pageSize: 50 },
  })
  const {
    data: customer,
    loading: custLoading,
    reload: reloadCustomer,
  } = useFetch(selectedId ? `/customers/${selectedId}` : null, { enabled: !!selectedId })

  const [form, setForm] = useState(EMPTY)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [flash, setFlash] = useState(null)

  // Reset the form when the selected customer changes (state-during-render pattern).
  const [prevId, setPrevId] = useState(selectedId)
  if (prevId !== selectedId) {
    setPrevId(selectedId)
    setForm(EMPTY)
    setError(null)
  }

  const rows = list?.rows || []
  const isSale = form.status === 'SALE'

  const select = (id) => setSearchParams(id ? { customer: id } : {})

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await api.post('/calls', {
        customerId: selectedId,
        status: form.status,
        notes: form.notes,
        saleAmount: isSale ? Number(form.saleAmount || 0) : undefined,
        followUpAt: form.followUpAt || null,
      })
      setForm(EMPTY)
      setFlash('Call logged ✓')
      setTimeout(() => setFlash(null), 2500)
      reloadCustomer()
    } catch (err) {
      setError(apiError(err))
    } finally {
      setBusy(false)
    }
  }

  const telHref = useMemo(
    () => (customer?.phone ? `tel:${customer.phone.replace(/[^+\d]/g, '')}` : null),
    [customer],
  )

  return (
    <>
      <PageHeader title="Call Console" subtitle="Pick a customer, make the call, log the outcome" />

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Customer picker */}
        <div className="card flex max-h-[70vh] flex-col overflow-hidden">
          <div className="border-b border-slate-200 p-3">
            <input
              className="input"
              placeholder="Search customers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {listLoading ? (
              <Spinner label="Loading…" />
            ) : (
              rows.map((c) => (
                <button
                  key={c.id}
                  onClick={() => select(c.id)}
                  className={`flex w-full items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50 ${
                    c.id === selectedId ? 'bg-brand-50' : ''
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.phone}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </button>
              ))
            )}
            {!listLoading && rows.length === 0 && (
              <p className="p-4 text-sm text-slate-500">No customers found.</p>
            )}
          </div>
        </div>

        {/* Call panel */}
        {!selectedId ? (
          <div className="card grid place-items-center p-10 text-center text-slate-500">
            <p>Select a customer from the list to start.</p>
          </div>
        ) : custLoading ? (
          <div className="card">
            <Spinner />
          </div>
        ) : !customer ? (
          <div className="card p-6 text-sm text-rose-600">Could not load this customer.</div>
        ) : (
          <div className="space-y-4">
            <div className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{customer.name}</h2>
                  <p className="text-sm text-slate-500">
                    {customer.phone}
                    {customer.city ? ` · ${customer.city}` : ''}
                    {customer.email ? ` · ${customer.email}` : ''}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                    <StatusBadge status={customer.status} />
                    <span>Last call: {customer.lastCallAt ? dateTime(customer.lastCallAt) : '—'}</span>
                    <span>Follow-up: {dateOnly(customer.nextFollowUpAt)}</span>
                  </div>
                </div>
                {telHref && (
                  <a href={telHref} className="btn-primary">
                    📞 Call {customer.phone}
                  </a>
                )}
              </div>
              {customer.notes && (
                <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                  {customer.notes}
                </p>
              )}
            </div>

            <form onSubmit={submit} className="card space-y-4 p-5">
              <h3 className="font-semibold text-slate-900">Log call outcome</h3>
              {error && (
                <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
              )}
              {flash && (
                <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {flash}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {CALL_STATUSES.map((s) => (
                  <label
                    key={s.value}
                    className={`cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium ${
                      form.status === s.value
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      className="sr-only"
                      value={s.value}
                      checked={form.status === s.value}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    />
                    {s.label}
                  </label>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {isSale && (
                  <Field label="Sale amount (Rs)">
                    <TextInput
                      type="number"
                      min="1"
                      value={form.saleAmount}
                      onChange={(e) => setForm({ ...form, saleAmount: e.target.value })}
                      required
                    />
                  </Field>
                )}
                <Field label="Next follow-up (optional)">
                  <TextInput
                    type="date"
                    value={form.followUpAt}
                    onChange={(e) => setForm({ ...form, followUpAt: e.target.value })}
                  />
                </Field>
              </div>

              <Field label="Notes">
                <TextArea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="What was discussed?"
                />
              </Field>

              <button className="btn-primary" disabled={busy}>
                {busy ? 'Saving…' : 'Save call'}
              </button>
            </form>

            <div className="card">
              <div className="border-b border-slate-200 px-5 py-3">
                <h3 className="font-semibold text-slate-900">Call history</h3>
              </div>
              <ul className="divide-y divide-slate-100">
                {customer.calls.map((c) => (
                  <li key={c.id} className="flex items-start justify-between gap-3 px-5 py-3">
                    <div>
                      <StatusBadge status={c.status} />
                      {c.notes && <p className="mt-1 text-sm text-slate-600">{c.notes}</p>}
                      <p className="mt-0.5 text-xs text-slate-400">
                        {c.agent?.name} · {dateTime(c.createdAt)}
                      </p>
                    </div>
                    {c.saleAmount > 0 && (
                      <span className="whitespace-nowrap text-sm font-semibold text-emerald-600">
                        {money(c.saleAmount)}
                      </span>
                    )}
                  </li>
                ))}
                {customer.calls.length === 0 && (
                  <li className="px-5 py-4 text-sm text-slate-500">No calls logged yet.</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
