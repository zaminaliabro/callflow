import { useState } from 'react'
import { Link } from 'react-router-dom'
import api, { apiError } from '../../api/client.js'
import { useFetch } from '../../lib/useFetch.js'
import { money, number } from '../../lib/format.js'
import Spinner from '../../components/Spinner.jsx'
import Modal from '../../components/Modal.jsx'
import { Field, TextInput } from '../../components/Field.jsx'
import PageHeader from '../PageHeader.jsx'

const EMPTY = { name: '', email: '', phone: '', monthlyTarget: '', password: '' }

export default function AgentsPage() {
  const { data: agents, loading, error, reload } = useFetch('/agents')
  const [modal, setModal] = useState(null) // { mode: 'create'|'edit', agent }
  const [form, setForm] = useState(EMPTY)
  const [formError, setFormError] = useState(null)
  const [busy, setBusy] = useState(false)

  function openCreate() {
    setForm(EMPTY)
    setFormError(null)
    setModal({ mode: 'create' })
  }
  function openEdit(a) {
    setForm({
      name: a.name,
      email: a.email,
      phone: a.phone || '',
      monthlyTarget: String(a.monthlyTarget ?? ''),
      password: '',
    })
    setFormError(null)
    setModal({ mode: 'edit', agent: a })
  }

  async function save(e) {
    e.preventDefault()
    setBusy(true)
    setFormError(null)
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        monthlyTarget: Number(form.monthlyTarget || 0),
      }
      if (form.password) payload.password = form.password
      if (modal.mode === 'create') {
        await api.post('/agents', payload)
      } else {
        await api.put(`/agents/${modal.agent.id}`, payload)
      }
      setModal(null)
      reload()
    } catch (err) {
      setFormError(apiError(err))
    } finally {
      setBusy(false)
    }
  }

  async function remove(a) {
    if (!confirm(`Delete agent "${a.name}"? Their customers will be unassigned.`)) return
    try {
      await api.delete(`/agents/${a.id}`)
      reload()
    } catch (err) {
      alert(apiError(err))
    }
  }

  if (loading) return <Spinner />
  if (error) return <p className="text-sm text-rose-600">{error}</p>

  return (
    <>
      <PageHeader
        title="Agents"
        subtitle={`${agents.length} sales agents`}
        actions={
          <button className="btn-primary" onClick={openCreate}>
            + Add Agent
          </button>
        }
      />

      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="th">Agent</th>
              <th className="th">Customers</th>
              <th className="th">Calls (mo)</th>
              <th className="th">Sales (mo)</th>
              <th className="th">Target</th>
              <th className="th text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {agents.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="td">
                  <Link to={`/admin/agents/${a.id}`} className="font-medium hover:text-brand-600">
                    {a.name}
                  </Link>
                  <div className="text-xs text-slate-400">{a.email}</div>
                </td>
                <td className="td">{number(a.customers)}</td>
                <td className="td">{number(a.monthCalls)}</td>
                <td className="td font-medium text-emerald-600">{money(a.monthSales)}</td>
                <td className="td">
                  {a.monthlyTarget > 0 ? (
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-brand-500"
                          style={{ width: `${Math.min(a.targetPct || 0, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">{a.targetPct}%</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">Not set</span>
                  )}
                </td>
                <td className="td">
                  <div className="flex justify-end gap-2">
                    <button className="btn-ghost btn-sm" onClick={() => openEdit(a)}>
                      Edit
                    </button>
                    <button className="btn-danger btn-sm" onClick={() => remove(a)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {agents.length === 0 && (
              <tr>
                <td className="td text-slate-500" colSpan={6}>
                  No agents yet — add your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'create' ? 'Add Agent' : 'Edit Agent'}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setModal(null)}>
              Cancel
            </button>
            <button className="btn-primary" form="agent-form" disabled={busy}>
              {busy ? 'Saving…' : 'Save'}
            </button>
          </>
        }
      >
        <form id="agent-form" onSubmit={save} className="space-y-3">
          {formError && (
            <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</div>
          )}
          <Field label="Full name">
            <TextInput
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </Field>
          <Field label="Email">
            <TextInput
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone">
              <TextInput
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Field>
            <Field label="Monthly target (Rs)">
              <TextInput
                type="number"
                min="0"
                value={form.monthlyTarget}
                onChange={(e) => setForm({ ...form, monthlyTarget: e.target.value })}
              />
            </Field>
          </div>
          <Field
            label={modal?.mode === 'create' ? 'Password' : 'New password (leave blank to keep)'}
          >
            <TextInput
              type="text"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={modal?.mode === 'create'}
              minLength={6}
            />
          </Field>
        </form>
      </Modal>
    </>
  )
}
