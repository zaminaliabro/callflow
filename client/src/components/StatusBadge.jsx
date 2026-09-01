import { statusMeta } from '../lib/constants.js'

export default function StatusBadge({ status }) {
  const { label, className } = statusMeta(status)
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
      {label}
    </span>
  )
}
