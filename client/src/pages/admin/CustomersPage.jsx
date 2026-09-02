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
import { Field, TextInput, Select, TextArea } from '../../components/Field.jsx'
import PageHeader from '../PageHeader.jsx'

const EMPTY = { name: '', phone: '', email: '', city: '', notes: '', assignedAgentId: '', nextFollowUpAt: '' }

export default function CustomersPage() {
  const [filters, setFilters] = useState({ search: '', status: '', agent: '', page: 1 })
  const params = {
    search: filters.search || undefined,
    status: filters.status || undefined,
    agent: filters.agent || undefined,
    page: filters.page,
    pageSize: 15,
  }
  const { data, loading, error, reload } = useFetch('/customers', { params })
  const { data: agents } = useFetch('/agents')

  const [modal, setModal] = useState(null) // {mode, customer}
  const [form, setForm] = useState(EMPTY)
  const [formError, setFormError] = useState(null)
  const [busy, setBusy] = useState(false)

  const agentList = agents || []

  function setFilter(patch) {
    setFilters((f) => ({ ...f, ...patch, page: patch.page ?? 1 }))
  }

  function openCreate() {
    setForm(EMPTY)
    setFormError(null)
    setModal({ mode: 'create' })
  }
  function openEdit(c) {
    setForm({
      name: c.name,
      phone: c.phone,
      email: c.email || '',
      city: c.city || '',
      notes: c.notes || '',
      assignedAgentId: c.assignedAgentId || '',
      nextFollowUpAt: c.nextFollowUpAt ? c.nextFollowUpAt.slice(0, 10) : '',
      status: c.status,
    })
    setFormError(null)
    setModal({ mode: 'edit', customer: c })
  }

  async function save(e) {
    e.preventDefault()
    setBusy(true)
    setFormError(null)
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        email: form.email,
        city: form.city,
        notes: form.notes,
        assignedAgentId: form.assignedAgentId || null,
        nextFollowUpAt: form.nextFollowUpAt || null,
      }
      if (modal.mode === 'create') await api.post('/customers', payload)
      else {
        payload.status = form.status
        await api.put(`/customers/${modal.customer.id}`, payload)
      }
      setModal(null)
      reload()
    } catch (err) {
      setFormError(apiError(err))
    } finally {
      setBusy(false)
    }
  }

  async function remove(c) {
    if (!confirm(`Delete customer "${c.name}"? This also removes their call history.`)) return
    try {
      await api.delete(`/customers/${c.id}`)
      reload()
    } catch (err) {
      alert(apiError(err))
    }
  }

  async function quickAssign(c, agentId) {
    try {
      await api.put(`/customers/${c.id}/assign`, { agentId: agentId || null })
      reload()
    } catch (err) {
      alert(apiError(err))
    }
  }

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle={data ? `${data.total} total` : ''}
        actions={
          <button className="btn-primary" onClick={openCreate}>
            + Add Customer
          </button>
        }
      />

      <div className="card mb-4 flex flex-wrap gap-3 p-4">
        <input
          className="input max-w-xs"
          placeholder="Search name, phone, email, city…"
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
        <select
          className="input max-w-[12rem]"
          value={filters.agent}
          onChange={(e) => setFilter({ agent: e.target.value })}
        >
          <option value="">All agents</option>
          {agentList.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
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
                  <th className="th">Assigned Agent</th>
                  <th className="th">Last Call</th>
                  <th className="th">Follow-up</th>
                  <th className="th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.rows.map((c) => (
                  <tr key={c.id} className="row-hover">
                    <td className="td">
                      <Link
                        to={`/admin/customers/${c.id}`}
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
                    <td className="td">
                      <select
                        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        value={c.assignedAgentId || ''}
                        onChange={(e) => quickAssign(c, e.target.value)}
                      >
                        <option value="">Unassigned</option>
                        {agentList.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="td text-slate-500 dark:text-slate-400">
                      {c.lastCallAt ? fromNow(c.lastCallAt) : '—'}
                    </td>
                    <td className="td text-slate-500 dark:text-slate-400">
                      {dateOnly(c.nextFollowUpAt)}
                    </td>
                    <td className="td">
                      <div className="flex justify-end gap-2">
                        <button className="btn-ghost btn-sm" onClick={() => openEdit(c)}>
                          Edit
                        </button>
                        <button className="btn-danger btn-sm" onClick={() => remove(c)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data.rows.length === 0 && (
                  <tr>
                    <td className="td text-slate-500 dark:text-slate-400" colSpan={7}>
                      No customers match these filters.
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
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'create' ? 'Add Customer' : 'Edit Customer'}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setModal(null)}>
              Cancel
            </button>
            <button className="btn-primary" form="customer-form" disabled={busy}>
              {busy ? 'Saving…' : 'Save'}
            </button>
          </>
        }
      >
        <form id="customer-form" onSubmit={save} className="space-y-3">
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
            <Field label="Assigned agent">
              <Select
                value={form.assignedAgentId}
                onChange={(e) => setForm({ ...form, assignedAgentId: e.target.value })}
              >
                <option value="">Unassigned</option>
                {agentList.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Next follow-up">
              <TextInput
                type="date"
                value={form.nextFollowUpAt}
                onChange={(e) => setForm({ ...form, nextFollowUpAt: e.target.value })}
              />
            </Field>
          </div>
          {modal?.mode === 'edit' && (
            <Field label="Status">
              <Select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {CUSTOMER_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </Field>
          )}
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
