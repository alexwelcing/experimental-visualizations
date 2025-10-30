import { UserTable } from '@/components/UserTable'

export default function IndecksPage() {
  const companyId = process.env.NEXT_PUBLIC_COMPANY_ID!

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <UserTable companyId={companyId} />
    </div>
  )
}
