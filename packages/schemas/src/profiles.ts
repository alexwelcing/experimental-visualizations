import { z } from 'zod'

// Extended profile schemas
export const MyLawProfileSchema = z.object({
  newsDigest: z.boolean(),
  favoriteTopics: z.array(z.string()).max(10),
  alertFrequency: z.enum(['daily', 'weekly', 'monthly']),
  emailNotifications: z.boolean(),
})

export const RadarProfileSchema = z.object({
  notifications: z.boolean(),
  dataSources: z.array(z.string()),
  teamView: z.boolean(),
  accessLevel: z.enum(['viewer', 'editor', 'admin']),
  dashboardLayout: z.string().optional(),
})

export const ScholarProfileSchema = z.object({
  researchArea: z.string(),
  referenceIds: z.array(z.string()),
  saveToLibrary: z.boolean(),
  citationStyle: z.enum(['APA', 'MLA', 'Chicago']),
})

export const NewsvaultProfileSchema = z.object({
  defaultSection: z.string().nullable(),
  emailReports: z.boolean(),
  frequency: z.enum(['daily', 'weekly']),
})

export const ProfileAppId = z.enum([
  'MyLawProfile',
  'RadarProfile',
  'ScholarProfile',
  'SettingsProfile'
])

export type MyLawProfile = z.infer<typeof MyLawProfileSchema>
export type RadarProfile = z.infer<typeof RadarProfileSchema>
export type ScholarProfile = z.infer<typeof ScholarProfileSchema>
export type NewsvaultProfile = z.infer<typeof NewsvaultProfileSchema>
export type ProfileAppIdType = z.infer<typeof ProfileAppId>

// Product to Profile mapping
export const PRODUCT_PROFILE_MAP: Record<string, ProfileAppIdType> = {
  'radar-prod': 'RadarProfile',
  'scholar-prod': 'ScholarProfile',
  'mylaw-prod': 'MyLawProfile',
  'newsvault-prod': 'SettingsProfile',
}
