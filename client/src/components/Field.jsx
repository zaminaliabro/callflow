export function Field({ label, error, children, className = '' }) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      {children}
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  )
}

export function TextInput({ error, ...props }) {
  return <input className={`input ${error ? 'border-rose-400' : ''}`} {...props} />
}

export function Select({ error, children, ...props }) {
  return (
    <select className={`input ${error ? 'border-rose-400' : ''}`} {...props}>
      {children}
    </select>
  )
}

export function TextArea({ error, ...props }) {
  return <textarea className={`input ${error ? 'border-rose-400' : ''}`} rows={3} {...props} />
}
