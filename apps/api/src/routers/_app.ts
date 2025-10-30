import { router } from '../trpc'
import { companyRouter } from './company'
import { analyticsRouter } from './analytics'

export const appRouter = router({
  company: companyRouter,
  analytics: analyticsRouter,
})

export type AppRouter = typeof appRouter
