import { getPayload } from 'payload'
import configPromise from '@payload-config'

export const maxDuration = 60

export async function POST(): Promise<Response> {
  const payload = await getPayload({ config: configPromise })

  try {
    // CLEANUP
    await payload.delete({
      collection: 'pages',
      where: {
        slug: {
          in: ['home', 'about', 'contact'],
        },
      },
    })

    // ENSURE ADMIN USER EXISTS
    const existingUsers = await payload.find({
      collection: 'users',
      where: { email: { equals: 'admin@cms.com' } },
    })

    if (existingUsers.docs.length === 0) {
      await payload.create({
        collection: 'users',
        data: {
          email: 'admin@cms.com',
          password: 'Admin@123',
          name: 'CMS Admin',
          roles: ['admin'],
        },
      })
    }

    // HOME PAGE
    await payload.create({
      collection: 'pages',
      data: {
        title: 'Home',
        slug: 'home',
        _status: 'published',
        hero: {
          type: 'none',
        },
        layout: [
          {
            blockType: 'cta',
            richText: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'heading',
                    tag: 'h1',
                    children: [{ type: 'text', version: 1, text: 'Content Management Reimagined' }],
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
            links: [
              {
                link: {
                  type: 'custom',
                  url: '/signup',
                  label: 'Get Started',
                  appearance: 'default',
                },
              },
            ],
          },
          {
            blockType: 'statistics',
            stats: [
              { value: '10K+', label: 'Active Users' },
              { value: '99.9%', label: 'Uptime' },
              { value: '24/7', label: 'Support' },
              { value: '50+', label: 'Integrations' },
            ],
          },
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
                        tag: 'h2',
                        children: [{ type: 'text', version: 1, text: 'Features that scale with you' }],
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
          {
            blockType: 'testimonials',
            title: 'Trusted by Industry Leaders',
            testimonials: [
              {
                quote: 'This CMS builder transformed our workflow completely.',
                author: 'Jane Doe',
                role: 'CTO, TechCorp',
              },
              {
                quote: 'Incredible flexibility and ease of use.',
                author: 'John Smith',
                role: 'Lead Developer',
              },
            ],
          },
          {
            blockType: 'faq',
            title: 'Frequently Asked Questions',
            questions: [
              {
                question: 'Is it easy to set up?',
                answer: 'Yes! It deploys seamlessly on Vercel.',
              },
              {
                question: 'Can I add custom blocks?',
                answer: 'Absolutely. The architecture is fully extensible.',
              },
            ],
          },
        ],
      },
    })

    // ABOUT PAGE
    await payload.create({
      collection: 'pages',
      data: {
        title: 'About Us',
        slug: 'about',
        _status: 'published',
        hero: {
          type: 'none',
        },
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
                        children: [{ type: 'text', version: 1, text: 'Our Mission & Vision' }],
                        version: 1,
                        direction: 'ltr',
                        format: 'center',
                        indent: 0,
                      },
                      {
                        type: 'paragraph',
                        children: [{ type: 'text', version: 1, text: 'We believe in empowering teams to build amazing digital experiences.' }],
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
          {
            blockType: 'statistics',
            stats: [
              { value: '2015', label: 'Founded' },
              { value: '100+', label: 'Team Members' },
            ],
          },
        ],
      },
    })

    // CONTACT PAGE
    await payload.create({
      collection: 'pages',
      data: {
        title: 'Contact Us',
        slug: 'contact',
        _status: 'published',
        hero: {
          type: 'none',
        },
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
                        children: [{ type: 'text', version: 1, text: 'Get in Touch' }],
                        version: 1,
                        direction: 'ltr',
                        format: 'center',
                        indent: 0,
                      },
                      {
                        type: 'paragraph',
                        children: [{ type: 'text', version: 1, text: 'We would love to hear from you. Reach out to our support team at support@example.com' }],
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
          {
            blockType: 'faq',
            title: 'Support FAQ',
            questions: [
              {
                question: 'What are your support hours?',
                answer: 'We are available 24/7.',
              },
            ],
          },
        ],
      },
    })

    return Response.json({ success: true, message: 'Seeded successfully' })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
