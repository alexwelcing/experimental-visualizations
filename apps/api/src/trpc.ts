import { initTRPC, TRPCError } from '@trpc/server'
import { createZephrClient } from '@repo/zephr-client'

// Create context
export const createContext = () => {
  const zephrClient = createZephrClient({
    baseUrl: process.env.ZEPHR_BASE_URL!,
    hmacKey: process.env.ZEPHR_HMAC_KEY!,
    hmacSecret: process.env.ZEPHR_HMAC_SECRET!,
  })

  return {
    zephr: zephrClient,
    companyId: process.env.COMPANY_ID!,
  }
}

type Context = Awaited<ReturnType<typeof createContext>>

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure
