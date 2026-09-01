export const money = (n) =>
  'Rs ' + Number(n || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 })

export const number = (n) => Number(n || 0).toLocaleString('en-PK')

export function dateTime(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function dateOnly(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function fromNow(d) {
  if (!d) return '—'
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.round(diff / 60000)
  if (Math.abs(mins) < 60) return rel(mins, 'min')
  const hrs = Math.round(mins / 60)
  if (Math.abs(hrs) < 24) return rel(hrs, 'hr')
  return rel(Math.round(hrs / 24), 'day')
}

function rel(v, unit) {
  const abs = Math.abs(v)
  const plural = abs === 1 ? '' : 's'
  return v > 0 ? `${abs} ${unit}${plural} ago` : `in ${abs} ${unit}${plural}`
}
