import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface RevenueChartProps {
  data: Array<{
    month: string
    revenue: number
    newSubscriptions: number
  }>
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600' }}>
        Revenue Trend
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#10b981"
            strokeWidth={2}
            name="Revenue"
          />
          <Line
            type="monotone"
            dataKey="newSubscriptions"
            stroke="#3b82f6"
            strokeWidth={2}
            name="New Subscriptions"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
