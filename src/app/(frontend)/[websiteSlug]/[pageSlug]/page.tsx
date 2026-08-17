import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode, headers } from 'next/headers'
import React, { cache } from 'react'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
    select: {
      slug: true,
      website: true,
    },
  })

  const params = pages.docs
    ?.filter((doc) => {
      return doc.slug && typeof doc.slug === 'string' && doc.slug !== 'home'
    })
    .map(({ slug, website }) => {
      let websiteSlug = 'default'
      if (typeof website === 'object' && website?.slug) {
        websiteSlug = website.slug
      }
      return { websiteSlug, pageSlug: slug }
    })

  return params
}

type Args = {
  params: Promise<{
    websiteSlug: string
    pageSlug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { websiteSlug, pageSlug = 'home' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedWebsiteSlug = decodeURIComponent(websiteSlug)
  const decodedPageSlug = decodeURIComponent(pageSlug)
  const url = `/${decodedWebsiteSlug}/${decodedPageSlug}`

  const page = await queryPageBySlug({
    websiteSlug: decodedWebsiteSlug,
    slug: decodedPageSlug,
  })

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page

  return (
    <article className="pt-16 pb-24">
      <PageClient />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { websiteSlug, pageSlug = 'home' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedWebsiteSlug = decodeURIComponent(websiteSlug)
  const decodedPageSlug = decodeURIComponent(pageSlug)
  const page = await queryPageBySlug({
    websiteSlug: decodedWebsiteSlug,
    slug: decodedPageSlug,
  })

  return generateMeta({ doc: page })
}

const queryPageBySlug = cache(async ({ websiteSlug, slug }: { websiteSlug: string; slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  // Fetch website ID first with overrideAccess to avoid access control limits on website.slug
  const websites = await payload.find({
    collection: 'websites',
    where: { slug: { equals: websiteSlug } },
    depth: 0,
    overrideAccess: true,
  })

  if (!websites.docs.length) return null
  const websiteId = websites.docs[0].id

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: false,
    user,
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        {
          website: {
            equals: websiteId,
          },
        },
      ],
    },
  })

  return result.docs?.[0] || null
})

