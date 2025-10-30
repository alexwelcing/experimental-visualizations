import crypto from 'crypto'

interface ZephrConfig {
  baseUrl: string
  hmacKey: string
  hmacSecret: string
}

export function createZephrClient(config: ZephrConfig) {
  async function makeRequest<T = any>(
    method: string,
    path: string,
    body?: any
  ): Promise<T> {
    const timestamp = new Date().toISOString()
    const bodyStr = body ? JSON.stringify(body) : ''

    // Create HMAC signature
    const stringToSign = `${method}\n${path}\n${timestamp}\n${bodyStr}`
    const signature = crypto
      .createHmac('sha256', config.hmacSecret)
      .update(stringToSign)
      .digest('hex')

    const response = await fetch(`${config.baseUrl}${path}`, {
      method,
      headers: {
        'Authorization': `ZEPHR-HMAC-SHA-256 ${config.hmacKey}:${signature}`,
        'X-Api-Timestamp': timestamp,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Zephr API Error: ${response.status} - ${error}`)
    }

    return response.json()
  }

  return {
    // Account operations
    getAccountsByCompany: (companyId: string) =>
      makeRequest('GET', `/v4/accounts?company_id=${companyId}`),

    getAccountUsers: (accountId: string) =>
      makeRequest('GET', `/v4/accounts/${accountId}/grants`),

    getAccountGrants: (accountId: string) =>
      makeRequest('GET', `/v3/accounts/${accountId}/grants`),

    // User operations
    getUser: (userId: string) =>
      makeRequest('GET', `/v3/users/${userId}`),

    getUserGrants: (userId: string) =>
      makeRequest('GET', `/v3/users/${userId}/grants`),

    // Grant operations
    createGrant: (accountId: string, data: {
      user_id: string
      product_id: string
      entitlement_type: string
    }) =>
      makeRequest('POST', `/v3/accounts/${accountId}/grants`, data),

    deleteGrant: (accountId: string, grantId: string) =>
      makeRequest('DELETE', `/v3/accounts/${accountId}/grants/${grantId}`),

    // Profile operations
    getUserProfile: (userId: string, appId: string) =>
      makeRequest('GET', `/v3/users/${userId}/profile/${appId}`),

    updateUserProfile: (userId: string, appId: string, data: any) =>
      makeRequest('PATCH', `/v3/users/${userId}/profile/${appId}`, data),

    // Product operations
    listProducts: () =>
      makeRequest('GET', '/v3/products'),
  }
}

export type ZephrClient = ReturnType<typeof createZephrClient>
