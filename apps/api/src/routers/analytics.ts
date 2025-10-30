import { z } from 'zod'
import { router, publicProcedure } from '../trpc'

export const analyticsRouter = router({
  // Get user growth metrics
  getUserGrowth: publicProcedure
    .input(z.object({
      companyId: z.string(),
      days: z.number().default(30)
    }))
    .query(async ({ input, ctx }) => {
      // Get all accounts for company
      const accountsRes = await ctx.zephr.getAccountsByCompany(input.companyId)
      const accounts = accountsRes.results as { account_id: string }[]

      if (!accounts || accounts.length === 0) {
        return {
          totalUsers: 0,
          activeUsers: 0,
          newUsers: 0,
          growthRate: 0,
        }
      }

      // Get all users across accounts
      let totalUsers = 0
      let activeUsers = 0
      const now = new Date()
      const cutoffDate = new Date(now.getTime() - input.days * 24 * 60 * 60 * 1000)

      for (const account of accounts) {
        try {
          const grants = await ctx.zephr.getAccountGrants(account.account_id)
          const userIds = [...new Set(grants.results.map((g: any) => g.user_id))]

          for (const userId of userIds) {
            totalUsers++
            try {
              const user = await ctx.zephr.getUser(userId)
              if (user.last_login) {
                const lastLogin = new Date(user.last_login)
                if (lastLogin >= cutoffDate) {
                  activeUsers++
                }
              }
            } catch (err) {
              // Skip user if fetch fails
            }
          }
        } catch (err) {
          console.error(`Failed to fetch grants for account ${account.account_id}`)
        }
      }

      return {
        totalUsers,
        activeUsers,
        newUsers: Math.floor(totalUsers * 0.15), // Mock calculation
        growthRate: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
      }
    }),

  // Get product adoption statistics
  getProductAdoption: publicProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ input, ctx }) => {
      const accountsRes = await ctx.zephr.getAccountsByCompany(input.companyId)
      const accounts = accountsRes.results as { account_id: string }[]

      const productStats: Record<string, number> = {}

      for (const account of accounts) {
        try {
          const grants = await ctx.zephr.getAccountGrants(account.account_id)

          for (const grant of grants.results) {
            if (grant.product_id) {
              productStats[grant.product_id] = (productStats[grant.product_id] || 0) + 1
            }
          }
        } catch (err) {
          console.error(`Failed to fetch grants for account ${account.account_id}`)
        }
      }

      return Object.entries(productStats).map(([productId, count]) => ({
        productId,
        name: productId.replace('-prod', '').replace(/^./, (c) => c.toUpperCase()),
        users: count,
        percentage: 0, // Will be calculated on frontend
      }))
    }),

  // Get account metrics
  getAccountMetrics: publicProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ input, ctx }) => {
      const accountsRes = await ctx.zephr.getAccountsByCompany(input.companyId)
      const accounts = accountsRes.results as { account_id: string }[]

      let totalAccounts = accounts.length
      let activeAccounts = 0
      let totalGrants = 0

      for (const account of accounts) {
        try {
          const grants = await ctx.zephr.getAccountGrants(account.account_id)
          if (grants.results.length > 0) {
            activeAccounts++
            totalGrants += grants.results.length
          }
        } catch (err) {
          console.error(`Failed to fetch grants for account ${account.account_id}`)
        }
      }

      return {
        totalAccounts,
        activeAccounts,
        averageGrantsPerAccount: totalAccounts > 0 ? Math.round(totalGrants / totalAccounts) : 0,
        totalGrants,
      }
    }),

  // Get profile usage statistics
  getProfileUsage: publicProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ input, ctx }) => {
      // This is a simplified version - in production you'd track actual profile access
      return [
        { profile: 'MyLaw', users: 150, percentage: 100 },
        { profile: 'Radar', users: 45, percentage: 30 },
        { profile: 'Scholar', users: 30, percentage: 20 },
        { profile: 'Newsvault', users: 22, percentage: 15 },
      ]
    }),

  // Get revenue metrics (mock data for demonstration)
  getRevenueMetrics: publicProcedure
    .input(z.object({
      companyId: z.string(),
      months: z.number().default(6)
    }))
    .query(async ({ input }) => {
      // Mock revenue data - in production, this would come from billing system
      const months = []
      const now = new Date()

      for (let i = input.months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthName = date.toLocaleString('default', { month: 'short' })

        months.push({
          month: monthName,
          revenue: 50000 + Math.random() * 20000,
          newSubscriptions: Math.floor(10 + Math.random() * 20),
          churn: Math.floor(2 + Math.random() * 5),
        })
      }

      return months
    }),

  // Get top accounts by user count
  getTopAccounts: publicProcedure
    .input(z.object({
      companyId: z.string(),
      limit: z.number().default(10)
    }))
    .query(async ({ input, ctx }) => {
      const accountsRes = await ctx.zephr.getAccountsByCompany(input.companyId)
      const accounts = accountsRes.results as { account_id: string, name?: string }[]

      const accountData = await Promise.all(
        accounts.slice(0, input.limit).map(async (account) => {
          try {
            const grants = await ctx.zephr.getAccountGrants(account.account_id)
            const userIds = [...new Set(grants.results.map((g: any) => g.user_id))]

            return {
              accountId: account.account_id,
              name: account.name || account.account_id,
              userCount: userIds.length,
              grantCount: grants.results.length,
            }
          } catch (err) {
            return {
              accountId: account.account_id,
              name: account.name || account.account_id,
              userCount: 0,
              grantCount: 0,
            }
          }
        })
      )

      return accountData.sort((a, b) => b.userCount - a.userCount)
    }),
})
