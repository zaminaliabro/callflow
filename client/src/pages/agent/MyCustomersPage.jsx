import { useState } from 'react'
import { Link } from 'react-router-dom'
import api, { apiError } from '../../api/client.js'
import { useFetch } from '../../lib/useFetch.js'
import { dateOnly, fromNow } from '../../lib/format.js'
import { CUSTOMER_STATUSES } from '../../lib/constants.js'
import Spinner from '../../components/Spinner.jsx'
import Modal from '../../components/Modal.jsx'
import Pagination from '../../components/Pagination.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { Field, TextInput, TextArea } from '../../components/Field.jsx'
import PageHeader from '../PageHeader.jsx'

const EMPTY = { name: '', phone: '', email: '', city: '', notes: '', nextFollowUpAt: '' }

export default function MyCustomersPage() {
  const [filters, setFilters] = useState({ search: '', status: '', page: 1 })
  const { data, loading, error, reload } = useFetch('/customers', {
    params: {
      search: filters.search || undefined,
      status: filters.status || undefined,
      page: filters.page,
      pageSize: 15,
    },
  })
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [formError, setFormError] = useState(null)
  const [busy, setBusy] = useState(false)

  const setFilter = (patch) => setFilters((f) => ({ ...f, ...patch, page: patch.page ?? 1 }))

  async function save(e) {
    e.preventDefault()
    setBusy(true)
    setFormError(null)
    try {
      await api.post('/customers', {
        ...form,
        nextFollowUpAt: form.nextFollowUpAt || null,
      })
      setOpen(false)
      setForm(EMPTY)
      reload()
    } catch (err) {
      setFormError(apiError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader
        title="My Customers"
        subtitle={data ? `${data.total} assigned to you` : ''}
        actions={
          <button className="btn-primary" onClick={() => setOpen(true)}>
            + Add Customer
          </button>
        }
      />

      <div className="card mb-4 flex flex-wrap gap-3 p-4">
        <input
          className="input max-w-xs"
          placeholder="Search…"
          value={filters.search}
          onChange={(e) => setFilter({ search: e.target.value })}
        />
        <select
          className="input max-w-[10rem]"
          value={filters.status}
          onChange={(e) => setFilter({ status: e.target.value })}
        >
          <option value="">All statuses</option>
          {CUSTOMER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="thead">
                <tr>
                  <th className="th">Customer</th>
                  <th className="th">City</th>
                  <th className="th">Status</th>
                  <th className="th">Last Call</th>
                  <th className="th">Follow-up</th>
                  <th className="th text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.rows.map((c) => (
                  <tr key={c.id} className="row-hover">
                    <td className="td">
                      <Link
                        to={`/agent/customers/${c.id}`}
                        className="font-medium hover:text-brand-600 dark:hover:text-brand-400"
                      >
                        {c.name}
                      </Link>
                      <div className="text-xs text-slate-400 dark:text-slate-500">{c.phone}</div>
                    </td>
                    <td className="td">{c.city || '—'}</td>
                    <td className="td">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="td text-slate-500 dark:text-slate-400">
                      {c.lastCallAt ? fromNow(c.lastCallAt) : '—'}
                    </td>
                    <td className="td text-slate-500 dark:text-slate-400">
                      {dateOnly(c.nextFollowUpAt)}
                    </td>
                    <td className="td text-right">
                      <Link to={`/agent/call?customer=${c.id}`} className="btn-primary btn-sm">
                        Call
                      </Link>
                    </td>
                  </tr>
                ))}
                {data.rows.length === 0 && (
                  <tr>
                    <td className="td text-slate-500 dark:text-slate-400" colSpan={6}>
                      No customers yet.
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

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add Customer"
        footer={
          <>
            <button className="btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button className="btn-primary" form="my-customer-form" disabled={busy}>
              {busy ? 'Saving…' : 'Save'}
            </button>
          </>
        }
      >
        <form id="my-customer-form" onSubmit={save} className="space-y-3">
          {formError && <div className="alert-error">{formError}</div>}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name">
              <TextInput
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </Field>
            <Field label="Phone">
              <TextInput
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </Field>
            <Field label="Email">
              <TextInput
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>
            <Field label="City">
              <TextInput
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </Field>
            <Field label="Next follow-up" className="col-span-2">
              <TextInput
                type="date"
                value={form.nextFollowUpAt}
                onChange={(e) => setForm({ ...form, nextFollowUpAt: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Notes">
            <TextArea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </Field>
        </form>
      </Modal>
    </>
  )
}
