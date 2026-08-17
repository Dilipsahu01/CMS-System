import { HeaderClient } from './Component.client'
import React, { cache } from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'

export async function Header({ websiteSlug }: { websiteSlug: string }) {
  const headerData = await queryHeaderByWebsiteSlug(websiteSlug)
  return <HeaderClient data={headerData || { navItems: [] }} />
}

const queryHeaderByWebsiteSlug = cache(async (websiteSlug: string) => {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  // Fetch website ID first with overrideAccess
  const websites = await payload.find({
    collection: 'websites',
    where: { slug: { equals: websiteSlug } },
    depth: 0,
    overrideAccess: true,
  })

  if (!websites.docs.length) return null
  const websiteId = websites.docs[0].id

  const result = await payload.find({
    collection: 'header',
    overrideAccess: false,
    user,
    where: {
      website: {
        equals: websiteId,
      },
    },
    limit: 1,
  })
  return result.docs?.[0] || null
})
