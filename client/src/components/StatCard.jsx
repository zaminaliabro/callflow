export default function StatCard({ label, value, sub, icon, accent = 'brand' }) {
  const accents = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300',
  }
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{sub}</p>}
        </div>
        {icon && (
          <span className={`grid h-10 w-10 place-items-center rounded-lg text-lg ${accents[accent]}`}>
            {icon}
          </span>
        )}
      </div>
    </div>
  )
}
