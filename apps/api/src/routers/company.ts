import { z } from 'zod'
import { router, publicProcedure } from '../trpc'
import { UserSchema, AccountGrantSchema, ProfileAppId } from '@repo/schemas'
import {
  MyLawProfileSchema,
  RadarProfileSchema,
  ScholarProfileSchema,
  NewsvaultProfileSchema,
  PRODUCT_PROFILE_MAP,
} from '@repo/schemas'
import { TRPCError } from '@trpc/server'

export const companyRouter = router({
  // List all users in company
  listUsers: publicProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ input, ctx }) => {
      // 1. Get all accounts for company
      const accountsRes = await ctx.zephr.getAccountsByCompany(input.companyId)
      const accounts = accountsRes.results as { account_id: string }[]

      if (!accounts || accounts.length === 0) {
        return []
      }

      // 2. Get users from all accounts (parallel)
      const userPromises = accounts.map(async (account) => {
        const grants = await ctx.zephr.getAccountGrants(account.account_id)

        // Get unique user IDs
        const userIds = [...new Set(grants.results.map((g: any) => g.user_id))]

        // Fetch user details
        const users = await Promise.all(
          userIds.map(async (userId: string) => {
            try {
              const user = await ctx.zephr.getUser(userId)
              return {
                ...user,
                accountId: account.account_id,
              }
            } catch (err) {
              console.error(`Failed to fetch user ${userId}:`, err)
              return null
            }
          })
        )

        return users.filter(Boolean)
      })

      const allUsers = (await Promise.all(userPromises)).flat()
      return allUsers
    }),

  // Grant product to user (via account)
  grantProduct: publicProcedure
    .input(z.object({
      accountId: z.string(),
      userId: z.string(),
      productId: z.string(),
      entitlementType: z.string().default('subscription'),
    }))
    .mutation(async ({ input, ctx }) => {
      return ctx.zephr.createGrant(input.accountId, {
        user_id: input.userId,
        product_id: input.productId,
        entitlement_type: input.entitlementType,
      })
    }),

  // Remove product from user
  removeProduct: publicProcedure
    .input(z.object({
      accountId: z.string(),
      grantId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      return ctx.zephr.deleteGrant(input.accountId, input.grantId)
    }),

  // List available profiles for user
  listAvailableProfiles: publicProcedure
    .input(z.object({
      userId: z.string(),
      accountId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      // Get account grants to determine available products
      const grants = await ctx.zephr.getAccountGrants(input.accountId)
      const products = grants.results
        .filter((g: any) => g.product_id)
        .map((g: any) => g.product_id)

      // Always include MyLaw
      const availableProfiles = [
        { appId: 'MyLawProfile', label: 'MyLaw', enabled: true },
      ]

      // Add other profiles based on products
      Object.entries(PRODUCT_PROFILE_MAP).forEach(([productId, appId]) => {
        if (appId !== 'MyLawProfile') {
          availableProfiles.push({
            appId,
            label: appId.replace('Profile', ''),
            enabled: products.includes(productId),
          })
        }
      })

      return availableProfiles
    }),

  // Get user profile
  getProfile: publicProcedure
    .input(z.object({
      userId: z.string(),
      accountId: z.string(),
      appId: ProfileAppId,
    }))
    .query(async ({ input, ctx }) => {
      // Verify profile is allowed
      const available = await ctx.zephr.getAccountGrants(input.accountId)
      const products = available.results.map((g: any) => g.product_id).filter(Boolean)

      // MyLaw always allowed
      if (input.appId !== 'MyLawProfile') {
        const requiredProduct = Object.entries(PRODUCT_PROFILE_MAP).find(
          ([_, appId]) => appId === input.appId
        )?.[0]

        if (requiredProduct && !products.includes(requiredProduct)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: `Profile ${input.appId} not available for this account`,
          })
        }
      }

      const profile = await ctx.zephr.getUserProfile(input.userId, input.appId)

      // Validate against schema
      let schema
      switch (input.appId) {
        case 'MyLawProfile':
          schema = MyLawProfileSchema
          break
        case 'RadarProfile':
          schema = RadarProfileSchema
          break
        case 'ScholarProfile':
          schema = ScholarProfileSchema
          break
        case 'SettingsProfile':
          schema = NewsvaultProfileSchema
          break
      }

      return schema.parse(profile)
    }),

  // Update user profile
  updateProfile: publicProcedure
    .input(z.object({
      userId: z.string(),
      accountId: z.string(),
      appId: ProfileAppId,
      data: z.any(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Same permission check as getProfile
      const available = await ctx.zephr.getAccountGrants(input.accountId)
      const products = available.results.map((g: any) => g.product_id).filter(Boolean)

      if (input.appId !== 'MyLawProfile') {
        const requiredProduct = Object.entries(PRODUCT_PROFILE_MAP).find(
          ([_, appId]) => appId === input.appId
        )?.[0]

        if (requiredProduct && !products.includes(requiredProduct)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: `Profile ${input.appId} not available for this account`,
          })
        }
      }

      // Validate data against schema
      let schema
      switch (input.appId) {
        case 'MyLawProfile':
          schema = MyLawProfileSchema
          break
        case 'RadarProfile':
          schema = RadarProfileSchema
          break
        case 'ScholarProfile':
          schema = ScholarProfileSchema
          break
        case 'SettingsProfile':
          schema = NewsvaultProfileSchema
          break
      }

      const validatedData = schema.parse(input.data)

      return ctx.zephr.updateUserProfile(input.userId, input.appId, validatedData)
    }),
})
