import { getPayload } from 'payload'
import configPromise from '@payload-config'

export const maxDuration = 120

export async function POST(): Promise<Response> {
  const payload = await getPayload({ config: configPromise })

  try {
    // 1. CLEANUP
    console.log('Cleaning up existing data...')
    const collectionsToClean = ['pages', 'header', 'footer', 'websites'] as const
    
    for (const collection of collectionsToClean) {
      const existing = await payload.find({
        collection,
        limit: 1000,
        depth: 0,
        pagination: false,
      })
      for (const doc of existing.docs) {
        await payload.delete({ collection, id: doc.id })
      }
    }

    // Delete all users except admin@cms.com
    const existingUsersToDelete = await payload.find({
      collection: 'users',
      limit: 1000,
      depth: 0,
      pagination: false,
      where: { email: { not_equals: 'admin@cms.com' } }
    })
    for (const doc of existingUsersToDelete.docs) {
      await payload.delete({ collection: 'users', id: doc.id })
    }

    // 2. CREATE USERS
    console.log('Creating users...')
    
    // Admin User
    let adminUser
    const existingAdmins = await payload.find({ collection: 'users', where: { email: { equals: 'admin@cms.com' } } })
    if (existingAdmins.docs.length === 0) {
      adminUser = await payload.create({
        collection: 'users',
        data: { email: 'admin@cms.com', password: 'password', name: 'Admin User', roles: ['admin'] },
      })
    } else {
      adminUser = existingAdmins.docs[0]
    }

    // Owner User
    const ownerUser = await payload.create({
      collection: 'users',
      data: { email: 'owner@cms.com', password: 'password', name: 'Owner User', roles: ['user'] },
    })

    // Editor User
    const editorUser = await payload.create({
      collection: 'users',
      data: { email: 'editor@cms.com', password: 'password', name: 'Editor User', roles: ['user'] },
    })

    // Author User
    const authorUser = await payload.create({
      collection: 'users',
      data: { email: 'author@cms.com', password: 'password', name: 'Author User', roles: ['user'] },
    })

    // 3. CREATE WEBSITES
    console.log('Creating websites...')
    
    const adminWebsite = await payload.create({
      collection: 'websites',
      data: {
        title: 'Admin Corporate Site',
        slug: 'admin-corp',
        owner: adminUser.id,
      },
    })

    const ownerWebsite = await payload.create({
      collection: 'websites',
      data: {
        title: 'Tech Startup (Owner)',
        slug: 'tech-startup',
        owner: ownerUser.id,
        editors: [editorUser.id],
        authors: [authorUser.id],
      },
    })

    const editorWebsite = await payload.create({
      collection: 'websites',
      data: {
        title: 'Editor Personal Blog',
        slug: 'editor-blog',
        owner: editorUser.id,
      },
    })

    const authorWebsite = await payload.create({
      collection: 'websites',
      data: {
        title: 'Author Portfolio',
        slug: 'author-portfolio',
        owner: authorUser.id,
      },
    })

    const multiPageSite1 = await payload.create({
      collection: 'websites',
      data: {
        title: 'Global Marketing',
        slug: 'global-marketing',
        owner: adminUser.id,
      },
    })

    const multiPageSite2 = await payload.create({
      collection: 'websites',
      data: {
        title: 'Community Hub',
        slug: 'community-hub',
        owner: ownerUser.id,
      },
    })

    const multiPageSite3 = await payload.create({
      collection: 'websites',
      data: {
        title: 'Design Agency',
        slug: 'design-agency',
        owner: editorUser.id,
      },
    })

    const singlePageWebsites = [adminWebsite, ownerWebsite, editorWebsite, authorWebsite]
    const multiPageWebsites = [multiPageSite1, multiPageSite2, multiPageSite3]
    const allWebsites = [...singlePageWebsites, ...multiPageWebsites]

    // 4. CREATE PAGES, HEADERS, FOOTERS
    console.log('Creating pages, headers, and footers...')
    
    // Create Single Page Websites
    for (const website of singlePageWebsites) {
      // Create Home Page
      await payload.create({
        collection: 'pages',
        data: {
          title: 'Home',
          slug: 'home',
          website: website.id,
          author: typeof website.owner === 'object' ? website.owner.id : website.owner,
          _status: 'published',
          hero: { type: 'none' },
          layout: [
            {
              blockType: 'content',
              columns: [
                {
                  size: 'full',
                  richText: {
                    root: {
                      type: 'root',
                      children: [
                        {
                          type: 'heading',
                          tag: 'h1',
                          children: [{ type: 'text', version: 1, text: `Welcome to ${website.title}` }],
                          version: 1,
                          direction: 'ltr',
                          format: 'center',
                          indent: 0,
                        },
                        {
                          type: 'paragraph',
                          children: [{ type: 'text', version: 1, text: `This is a seeded page for the website: ${website.slug}. Feel free to edit this block!` }],
                          version: 1,
                          direction: 'ltr',
                          format: 'center',
                          indent: 0,
                        },
                      ],
                      direction: 'ltr',
                      format: '',
                      indent: 0,
                      version: 1,
                    },
                  },
                },
              ],
            },
          ],
        },
      })
    }

    // Create Multi-Page Websites
    for (const website of multiPageWebsites) {
      const pagesToCreate = [
        { title: 'Home', slug: 'home' },
        { title: 'About Us', slug: 'about' },
        { title: 'Contact', slug: 'contact' },
        { title: 'Services', slug: 'services' },
      ]

      for (const p of pagesToCreate) {
        await payload.create({
          collection: 'pages',
          data: {
            title: p.title,
            slug: p.slug,
            website: website.id,
            author: typeof website.owner === 'object' ? website.owner.id : website.owner,
            _status: 'published',
            hero: { type: 'none' },
            layout: [
              {
                blockType: 'content',
                columns: [
                  {
                    size: 'full',
                    richText: {
                      root: {
                        type: 'root',
                        children: [
                          {
                            type: 'heading',
                            tag: 'h1',
                            children: [{ type: 'text', version: 1, text: `${p.title} - ${website.title}` }],
                            version: 1,
                            direction: 'ltr',
                            format: 'center',
                            indent: 0,
                          },
                          {
                            type: 'paragraph',
                            children: [{ type: 'text', version: 1, text: `This is the ${p.title} page for ${website.title}. It is fully public!` }],
                            version: 1,
                            direction: 'ltr',
                            format: 'center',
                            indent: 0,
                          },
                        ],
                        direction: 'ltr',
                        format: '',
                        indent: 0,
                        version: 1,
                      },
                    },
                  },
                ],
              },
            ],
          },
        })
      }
    }

    for (const website of allWebsites) {
      // Create Header
      await payload.create({
        collection: 'header',
        data: {
          website: website.id,
          navItems: [
            {
              link: {
                type: 'custom',
                url: `/${website.slug}/home`,
                label: 'Home',
              },
            },
            ...(multiPageWebsites.includes(website) ? [
              {
                link: {
                  type: 'custom',
                  url: `/${website.slug}/about`,
                  label: 'About',
                },
              },
              {
                link: {
                  type: 'custom',
                  url: `/${website.slug}/contact`,
                  label: 'Contact',
                },
              },
            ] : []),
          ],
        },
      })

      // Create Footer
      await payload.create({
        collection: 'footer',
        data: {
          website: website.id,
          navItems: [
            {
              link: {
                type: 'custom',
                url: `/${website.slug}/home`,
                label: 'Home',
              },
            },
          ],
        },
      })
    }

    return Response.json({ success: true, message: 'Database successfully seeded with users, websites, pages, headers, and footers.' })
  } catch (error: any) {
    console.error('Seed Error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
