import type { Access, AccessArgs, PayloadRequest } from 'payload'

// Helper function to get website IDs based on user's role on the website
const getTenantWebsiteIds = async (req: PayloadRequest, allowedRoles: 'owner' | 'editor' | 'author'): Promise<string[]> => {
  if (!req.user) return []

  const orConditions: any[] = [{ owner: { equals: req.user.id } }]

  if (allowedRoles === 'editor' || allowedRoles === 'author') {
    orConditions.push({ editors: { in: [req.user.id] } })
  }
  
  if (allowedRoles === 'author') {
    orConditions.push({ authors: { in: [req.user.id] } })
  }

  try {
    const websites = await req.payload.find({
      collection: 'websites',
      where: {
        or: orConditions,
      },
      depth: 0,
      limit: 100,
    })
    return websites.docs.map((w) => w.id)
  } catch (e) {
    return []
  }
}

// -----------------------------------------------------------------------------
// PAGES ACCESS CONTROLS
// -----------------------------------------------------------------------------

export const canReadPage: Access = async ({ req }: AccessArgs) => {
  const { user } = req

  if (user && user.roles?.includes('admin')) return true

  const publicAccess = {
    _status: {
      equals: 'published',
    },
  }

  if (!user) return publicAccess

  // Authors (and above) can read all pages (including drafts) for their websites
  const websiteIds = await getTenantWebsiteIds(req, 'author')

  return {
    or: [
      publicAccess,
      {
        website: {
          in: websiteIds,
        },
      },
    ],
  }
}

export const canCreatePage: Access = async ({ req, data }: AccessArgs) => {
  const { user } = req

  if (!user) return false
  if (user.roles?.includes('admin')) return true
  
  if (!data?.website) {
    return true // Allow to pass so `beforeValidate` can attempt auto-association
  }

  try {
    const website = await req.payload.findByID({
      collection: 'websites',
      id: data.website,
    })
    
    const ownerId = typeof website.owner === 'object' ? website.owner.id : website.owner
    if (ownerId === user.id) return true
    
    const editors = website.editors?.map((e: any) => typeof e === 'object' ? e.id : e) || []
    if (editors.includes(user.id)) return true
    
    const authors = website.authors?.map((a: any) => typeof a === 'object' ? a.id : a) || []
    if (authors.includes(user.id)) return true
    
    return false
  } catch (err) {
    return false
  }
}

export const canUpdateOrDeletePage: Access = async ({ req }: AccessArgs) => {
  const { user } = req

  if (!user) return false
  if (user.roles?.includes('admin')) return true

  // Get websites where user is Owner or Editor (they can modify ANY page)
  const editorWebsiteIds = await getTenantWebsiteIds(req, 'editor')
  
  // Get websites where user is an Author (they can only modify THEIR pages)
  const authorWebsiteIds = await getTenantWebsiteIds(req, 'author')

  return {
    or: [
      // Condition 1: User is an Editor/Owner for the website
      {
        website: {
          in: editorWebsiteIds,
        },
      },
      // Condition 2: User is an Author for the website AND they are the author of the page
      {
        and: [
          {
            website: {
              in: authorWebsiteIds,
            },
          },
          {
            author: {
              equals: user.id,
            },
          },
        ],
      },
    ],
  }
}

// -----------------------------------------------------------------------------
// WEBSITES & MEDIA COLLECTION CONTROLS
// -----------------------------------------------------------------------------

// Only the Owner (or Super Admin) can manage the Website settings and team
export const isWebsiteOwner: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.roles?.includes('admin')) return true

  return {
    owner: {
      equals: user.id,
    },
  }
}

// Anyone on the team can read the website
export const canReadWebsite: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.roles?.includes('admin')) return true

  return {
    or: [
      { owner: { equals: user.id } },
      { editors: { in: [user.id] } },
      { authors: { in: [user.id] } }
    ]
  }
}

// Media creation requires at least Author role
export const isTenantAdminCreate: Access = canCreatePage

// Media update/delete requires at least Editor role
export const isTenantAdmin: Access = async ({ req }: AccessArgs) => {
  const { user } = req

  if (!user) return false
  if (user.roles?.includes('admin')) return true

  const websiteIds = await getTenantWebsiteIds(req, 'editor')

  return {
    website: {
      in: websiteIds,
    },
  }
}

// Legacy function mapping for backward compatibility with Media / forms
export const isTenantAdminOrPublished: Access = canReadPage
