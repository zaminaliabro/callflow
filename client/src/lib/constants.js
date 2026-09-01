// Call / customer status metadata used across tables, badges and forms.
export const CALL_STATUSES = [
  { value: 'INTERESTED', label: 'Interested', tone: 'emerald' },
  { value: 'CALLBACK', label: 'Callback', tone: 'amber' },
  { value: 'NO_ANSWER', label: 'No Answer', tone: 'slate' },
  { value: 'NOT_INTERESTED', label: 'Not Interested', tone: 'rose' },
  { value: 'SALE', label: 'Sale', tone: 'brand' },
]

export const CUSTOMER_STATUSES = [
  { value: 'NEW', label: 'New', tone: 'slate' },
  ...CALL_STATUSES,
]

const TONES = {
  emerald: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  slate: 'bg-slate-100 text-slate-600',
  rose: 'bg-rose-100 text-rose-700',
  brand: 'bg-brand-100 text-brand-700',
}

export function statusMeta(value) {
  const found = CUSTOMER_STATUSES.find((s) => s.value === value)
  return {
    label: found?.label || value,
    className: TONES[found?.tone] || TONES.slate,
  }
}
