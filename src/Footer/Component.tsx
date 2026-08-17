import React, { cache } from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

export async function Footer({ websiteSlug }: { websiteSlug: string }) {
  const footerData = await queryFooterByWebsiteSlug(websiteSlug)

  const navItems = footerData?.navItems || []

  return (
    <footer className="mt-auto border-t border-border bg-black dark:bg-card text-white">
      <div className="container py-8 gap-8 flex flex-col md:flex-row md:justify-between">
        <Link className="flex items-center" href="/">
          <Logo />
        </Link>

        <div className="flex flex-col-reverse items-start md:flex-row gap-4 md:items-center">
          <ThemeSelector />
          <nav className="flex flex-col md:flex-row gap-4">
            {navItems.map(({ link }, i) => {
              return <CMSLink className="text-white" key={i} {...link} />
            })}
          </nav>
        </div>
      </div>
    </footer>
  )
}

const queryFooterByWebsiteSlug = cache(async (websiteSlug: string) => {
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
    collection: 'footer',
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
