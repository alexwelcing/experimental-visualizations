import { router } from '../trpc'
import { companyRouter } from './company'

export const appRouter = router({
  company: companyRouter,
  // Add more routers for analytics, admin, etc.
})

export type AppRouter = typeof appRouter
