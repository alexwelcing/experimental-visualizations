interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  icon?: string
  trend?: 'up' | 'down' | 'neutral'
}

export function MetricCard({ title, value, change, icon, trend = 'neutral' }: MetricCardProps) {
  const trendColors = {
    up: '#10b981',
    down: '#ef4444',
    neutral: '#6b7280'
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{title}</span>
        {icon && <span style={{ fontSize: '1.5rem' }}>{icon}</span>}
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
        {value}
      </div>
      {change && (
        <div style={{ color: trendColors[trend], fontSize: '0.875rem', fontWeight: '500' }}>
          {change}
        </div>
      )}
    </div>
  )
}
