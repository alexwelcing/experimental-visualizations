import { trpc } from '~/lib/trpc'
import { MetricCard } from './MetricCard'
import { ProductChart } from './ProductChart'
import { RevenueChart } from './RevenueChart'
import { TopAccountsTable } from './TopAccountsTable'

export function Dashboard() {
  const companyId = import.meta.env.VITE_COMPANY_ID || 'your-company-id'

  // Fetch analytics data
  const { data: userGrowth, isLoading: loadingGrowth } = trpc.analytics.getUserGrowth.useQuery({
    companyId,
    days: 30,
  })

  const { data: productAdoption, isLoading: loadingProducts } = trpc.analytics.getProductAdoption.useQuery({
    companyId,
  })

  const { data: accountMetrics, isLoading: loadingAccounts } = trpc.analytics.getAccountMetrics.useQuery({
    companyId,
  })

  const { data: revenueMetrics, isLoading: loadingRevenue } = trpc.analytics.getRevenueMetrics.useQuery({
    companyId,
    months: 6,
  })

  const { data: topAccounts, isLoading: loadingTopAccounts } = trpc.analytics.getTopAccounts.useQuery({
    companyId,
    limit: 10,
  })

  const isLoading = loadingGrowth || loadingProducts || loadingAccounts || loadingRevenue || loadingTopAccounts

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60vh',
        fontSize: '1.25rem',
        color: '#6b7280'
      }}>
        Loading analytics...
      </div>
    )
  }

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2rem',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Analytics Dashboard
        </h2>
        <p style={{ color: '#6b7280' }}>
          Real-time insights and metrics for your organization
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        <MetricCard
          title="Total Users"
          value={userGrowth?.totalUsers || 0}
          change={`${userGrowth?.newUsers || 0} new this month`}
          icon="👥"
          trend="up"
        />
        <MetricCard
          title="Active Users"
          value={userGrowth?.activeUsers || 0}
          change={`${userGrowth?.growthRate || 0}% activity rate`}
          icon="✨"
          trend="up"
        />
        <MetricCard
          title="Total Accounts"
          value={accountMetrics?.totalAccounts || 0}
          change={`${accountMetrics?.activeAccounts || 0} active`}
          icon="🏢"
          trend="neutral"
        />
        <MetricCard
          title="Avg Grants/Account"
          value={accountMetrics?.averageGrantsPerAccount || 0}
          change={`${accountMetrics?.totalGrants || 0} total grants`}
          icon="📊"
          trend="up"
        />
      </div>

      {/* Charts Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        {productAdoption && productAdoption.length > 0 && (
          <ProductChart data={productAdoption} />
        )}
        {revenueMetrics && revenueMetrics.length > 0 && (
          <RevenueChart data={revenueMetrics} />
        )}
      </div>

      {/* Top Accounts Table */}
      {topAccounts && topAccounts.length > 0 && (
        <TopAccountsTable accounts={topAccounts} />
      )}
    </div>
  )
}
