import { getPayload } from 'payload'
import configPromise from '@payload-config'

export const maxDuration = 60

export async function POST(): Promise<Response> {
  const payload = await getPayload({ config: configPromise })

  try {
    const homePages = await payload.find({
      collection: 'pages',
      where: {
        slug: { equals: 'home' }
      }
    })

    if (homePages.docs.length > 0) {
      const home = homePages.docs[0]
      await payload.update({
        collection: 'pages',
        id: home.id,
        data: {
          hero: {
            ...home.hero,
            richText: {
              ...(home.hero?.richText as any),
              root: {
                ...(home.hero?.richText as any)?.root,
                children: [
                  {
                    type: 'heading',
                    tag: 'h1',
                    children: [{ type: 'text', version: 1, text: 'Content Management Reimagined Live on Production!' }],
                    version: 1,
                    direction: 'ltr',
                    format: 'center',
                    indent: 0,
                  },
                ]
              }
            }
          }
        }
      })
      return Response.json({ success: true, message: 'Live Update Successful' })
    }
    
    return Response.json({ success: false, message: 'Home page not found' })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
