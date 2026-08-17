import payload from 'payload'
import configPromise from './src/payload.config'

async function checkPages() {
  const p = await payload.getPayload({ config: configPromise })
  const pages = await p.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
    select: {
      slug: true,
      website: true,
    }
  })
  
  const params = pages.docs?.map(({ slug, website }) => {
    let websiteSlug = 'default'
    if (typeof website === 'object' && website?.slug) {
      websiteSlug = website.slug
    }
    return { websiteSlug, pageSlug: slug, typeOfPageSlug: typeof slug }
  })
  
  console.log(JSON.stringify(params, null, 2))
  process.exit(0)
}

checkPages()
