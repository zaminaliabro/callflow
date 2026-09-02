import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { money } from '../lib/format.js'
import { useTheme } from '../context/ThemeContext.jsx'

export default function SalesChart({ data = [], metric = 'sales' }) {
  const isSales = metric === 'sales'
  const { isDark } = useTheme()

  const grid = isDark ? '#1e293b' : '#e2e8f0'
  const tick = isDark ? '#64748b' : '#94a3b8'
  const tooltipStyle = {
    borderRadius: 10,
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    background: isDark ? '#0f172a' : '#ffffff',
    color: isDark ? '#e2e8f0' : '#0f172a',
    fontSize: 12,
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1f40ea" stopOpacity={isDark ? 0.4 : 0.28} />
            <stop offset="100%" stopColor="#1f40ea" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: tick }}
          tickFormatter={(d) => d.slice(5)}
          interval="preserveStartEnd"
          minTickGap={24}
        />
        <YAxis
          tick={{ fontSize: 11, fill: tick }}
          width={isSales ? 64 : 32}
          tickFormatter={(v) => (isSales ? (v >= 1000 ? `${v / 1000}k` : v) : v)}
        />
        <Tooltip
          formatter={(v) => (isSales ? money(v) : [v, 'calls'])}
          labelFormatter={(d) => d}
          contentStyle={tooltipStyle}
        />
        <Area
          type="monotone"
          dataKey={isSales ? 'sales' : 'calls'}
          stroke={isDark ? '#5886fc' : '#1f40ea'}
          strokeWidth={2}
          fill="url(#g)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
