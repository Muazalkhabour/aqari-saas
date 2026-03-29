'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ReportingDashboardData } from '@/lib/reporting'

type OperationsRevenueChartProps = {
  monthlyRevenue: ReportingDashboardData['monthlyRevenue']
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(value)
}

function normalizeChartValue(value: number | string | readonly (number | string)[] | undefined) {
  if (Array.isArray(value)) {
    return Number(value[0] || 0)
  }

  return typeof value === 'number' ? value : Number(value || 0)
}

export function OperationsRevenueChart({ monthlyRevenue }: OperationsRevenueChartProps) {
  return (
    <div className="h-[21rem] w-full">
      <ResponsiveContainer>
        <AreaChart data={monthlyRevenue} margin={{ top: 14, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueCollected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0f766e" stopOpacity={0.32} />
              <stop offset="95%" stopColor="#0f766e" stopOpacity={0.03} />
            </linearGradient>
            <linearGradient id="revenueExpected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.26} />
              <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.03} />
            </linearGradient>
            <linearGradient id="revenueOutstanding" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ea580c" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#ea580c" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="monthLabel" tickLine={false} axisLine={false} tickMargin={10} />
          <YAxis tickFormatter={formatMoney} tickLine={false} axisLine={false} width={52} />
          <Tooltip
            formatter={(value, name) => [`${formatMoney(normalizeChartValue(value))} $`, String(name)]}
            contentStyle={{
              borderRadius: 20,
              border: '1px solid rgba(148, 163, 184, 0.2)',
              backgroundColor: 'rgba(255,255,255,0.96)',
              boxShadow: '0 18px 50px rgba(15,23,42,0.12)',
            }}
          />
          <Legend wrapperStyle={{ paddingTop: 10 }} />
          <Area type="monotone" dataKey="expected" name="المتوقع" stroke="#1d4ed8" fill="url(#revenueExpected)" strokeWidth={2.5} />
          <Area type="monotone" dataKey="collected" name="المحصّل" stroke="#0f766e" fill="url(#revenueCollected)" strokeWidth={3} />
          <Area type="monotone" dataKey="outstanding" name="قيد التحصيل" stroke="#ea580c" fill="url(#revenueOutstanding)" strokeWidth={2.5} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}