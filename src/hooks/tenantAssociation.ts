import { APIError, type CollectionBeforeValidateHook } from 'payload'

export const tenantAssociation: CollectionBeforeValidateHook = async ({ req, data, operation }) => {
  console.log(`[tenantAssociation] TRIGGERED for operation ${operation}. User Email: ${req.user?.email}, Roles: ${JSON.stringify(req.user?.roles)}`)
  // Only auto-associate for non-admin users creating or updating documents
  if ((operation === 'create' || operation === 'update') && req.user && !req.user.roles?.includes('admin')) {
    
    // Only attempt to set the website if it's not already set
    if (!data?.website) {
      
      let activeTenantId: string | null = null
      
      // Try to parse the active tenant from the cookie
      // In Payload v3, req is a Web Request, so we can use req.headers.get
      const cookieStr = req.headers?.get('cookie')
      if (cookieStr) {
        // Find the payload-tenant cookie
        const match = cookieStr.match(/(?:^|; )payload-tenant=([^;]+)/)
        if (match) {
          activeTenantId = match[1]
        }
      }

      const orConditions = [
        { owner: { equals: req.user.id } },
        { editors: { in: [req.user.id] } },
        { authors: { in: [req.user.id] } },
      ]

      // If we found a cookie, verify the user is part of this website
      if (activeTenantId) {
        try {
          const websites = await req.payload.find({
            collection: 'websites',
            where: {
              and: [
                { id: { equals: activeTenantId } },
                { or: orConditions },
              ],
            },
            depth: 0,
            limit: 1,
          })

          if (websites.totalDocs === 1) {
            data.website = websites.docs[0].id
            return data
          }
        } catch (e) {
          // If query fails, fallback
        }
      }

      // Fallback: If no cookie or invalid cookie, check if they are part of exactly 1 website
      try {
        const websites = await req.payload.find({
          collection: 'websites',
          where: { or: orConditions },
          depth: 0,
          limit: 2, // We only need to know if it's exactly 1
        })
        console.log(`[tenantAssociation] User ${req.user?.id} is in ${websites.totalDocs} websites.`)
        if (websites.totalDocs === 1) {
          console.log(`[tenantAssociation] Auto-assigning website ${websites.docs[0].id} for user ${req.user?.id}`)
          data.website = websites.docs[0].id
        }
      } catch (e) {
        console.error('[tenantAssociation] Fallback error:', e)
      }
    }

    if (!data?.website) {
      throw new APIError('You must select an active website to create or update this document.', 400)
    }
  }

  return data
}
