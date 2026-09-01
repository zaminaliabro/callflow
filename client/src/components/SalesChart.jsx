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

export default function SalesChart({ data = [], metric = 'sales' }) {
  const isSales = metric === 'sales'
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1f40ea" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#1f40ea" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          tickFormatter={(d) => d.slice(5)}
          interval="preserveStartEnd"
          minTickGap={24}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          width={isSales ? 64 : 32}
          tickFormatter={(v) => (isSales ? (v >= 1000 ? `${v / 1000}k` : v) : v)}
        />
        <Tooltip
          formatter={(v) => (isSales ? money(v) : [v, 'calls'])}
          labelFormatter={(d) => d}
          contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
        />
        <Area
          type="monotone"
          dataKey={isSales ? 'sales' : 'calls'}
          stroke="#1f40ea"
          strokeWidth={2}
          fill="url(#g)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
