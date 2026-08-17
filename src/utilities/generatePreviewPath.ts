import { PreviewSearchParams } from '@/app/(frontend)/next/preview/route'
import { PayloadRequest, CollectionSlug } from 'payload'

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  pages: '',
}

type Props = {
  collection: keyof typeof collectionPrefixMap
  slug: string
  req: PayloadRequest
  website?: any
}

export const generatePreviewPath = async ({ collection, slug, req, website }: Props) => {
  if (slug === undefined || slug === null) {
    return null
  }

  let websiteSlug = ''
  if (website) {
    if (typeof website === 'object' && website.slug) {
      websiteSlug = website.slug
    } else if ((typeof website === 'number' || typeof website === 'string') && req?.payload) {
      try {
        const websiteDoc = await req.payload.findByID({
          collection: 'websites',
          id: website,
        })
        if (websiteDoc && websiteDoc.slug) {
          websiteSlug = websiteDoc.slug
        }
      } catch (e) {
        // ignore
      }
    }
  }

  // Encode to support slugs with special characters
  const encodedSlug = encodeURIComponent(slug)
  const encodedWebsiteSlug = websiteSlug ? encodeURIComponent(websiteSlug) : ''

  const pathPrefix = encodedWebsiteSlug ? `/${encodedWebsiteSlug}` : collectionPrefixMap[collection] || ''
  const path = `${pathPrefix}/${encodedSlug}`

  const encodedParams = new URLSearchParams({
    path,
    previewSecret: process.env.PREVIEW_SECRET || '',
  } satisfies PreviewSearchParams)

  const url = `/next/preview?${encodedParams.toString()}`

  return url
}
