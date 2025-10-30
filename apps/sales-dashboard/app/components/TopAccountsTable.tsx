interface TopAccountsTableProps {
  accounts: Array<{
    accountId: string
    name: string
    userCount: number
    grantCount: number
  }>
}

export function TopAccountsTable({ accounts }: TopAccountsTableProps) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600' }}>
        Top Accounts by Users
      </h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#6b7280', fontWeight: '600' }}>
                Account
              </th>
              <th style={{ padding: '0.75rem', textAlign: 'right', color: '#6b7280', fontWeight: '600' }}>
                Users
              </th>
              <th style={{ padding: '0.75rem', textAlign: 'right', color: '#6b7280', fontWeight: '600' }}>
                Grants
              </th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account, idx) => (
              <tr key={account.accountId} style={{
                borderBottom: '1px solid #f3f4f6',
                background: idx % 2 === 0 ? 'white' : '#f9fafb'
              }}>
                <td style={{ padding: '0.75rem' }}>
                  <div style={{ fontWeight: '500', color: '#1e293b' }}>{account.name}</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{account.accountId}</div>
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#3b82f6' }}>
                  {account.userCount}
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'right', color: '#6b7280' }}>
                  {account.grantCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
