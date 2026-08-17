import type { PayloadRequest } from 'payload'

export const tenantListFilter = ({ req }: { req: PayloadRequest }) => {
  // If user is admin, don't filter
  if (req.user?.roles?.includes('admin')) {
    return null
  }

  // Get active tenant from cookie
  let activeTenantId: string | null = null
  const cookieStr = req.headers?.get('cookie')
  if (cookieStr) {
    const match = cookieStr.match(/(?:^|; )payload-tenant=([^;]+)/)
    if (match) {
      activeTenantId = match[1]
    }
  }

  if (activeTenantId) {
    return {
      website: {
        equals: activeTenantId,
      },
    }
  }

  return null
}
