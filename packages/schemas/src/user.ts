import { z } from 'zod'

export const UserSchema = z.object({
  user_id: z.string(),
  email_address: z.string().email(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  created_at: z.string(),
  last_login: z.string().optional(),
})

export const AccountGrantSchema = z.object({
  grant_id: z.string(),
  user_id: z.string(),
  account_id: z.string(),
  product_id: z.string().optional(),
  entitlement_type: z.string(),
  created_at: z.string(),
})

export type User = z.infer<typeof UserSchema>
export type AccountGrant = z.infer<typeof AccountGrantSchema>
