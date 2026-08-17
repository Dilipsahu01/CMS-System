import { expect, test } from '@playwright/test'
import { getPayload } from 'payload'
import configPromise from '../../src/payload.config'

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

test.describe('Tenant Isolation', () => {
  let payload
  let userA
  let userB
  let websiteA
  let websiteB
  let pageA

  test.beforeAll(async () => {
    payload = await getPayload({ config: configPromise })

    // Clean up
    await payload.delete({ collection: 'pages', where: { slug: { like: 'tenant-test-page' } } })
    await payload.delete({ collection: 'websites', where: { slug: { like: 'site-' } } })
    await payload.delete({ collection: 'users', where: { email: { like: 'test.com' } } })

    // Unique random suffix
    const randomStr = Math.random().toString(36).substring(7)
    const emailA = `usera_${randomStr}@test.com`
    const emailB = `userb_${randomStr}@test.com`
    const websiteSlugA = `site-a-${randomStr}`
    const websiteSlugB = `site-b-${randomStr}`
    const pageSlug = `tenant-test-page-${randomStr}`

    // Create User A
    userA = await payload.create({
      collection: 'users',
      data: {
        email: emailA,
        password: 'password',
        name: 'User A',
        roles: ['user'],
      },
    })

    // Create User B
    userB = await payload.create({
      collection: 'users',
      data: {
        email: emailB,
        password: 'password',
        name: 'User B',
        roles: ['user'],
      },
    })

    // Create Website A for User A
    websiteA = await payload.create({
      collection: 'websites',
      data: {
        title: 'Site A',
        slug: websiteSlugA,
        owner: userA.id,
      },
      overrideAccess: true,
    })

    // Create Website B for User B
    websiteB = await payload.create({
      collection: 'websites',
      data: {
        title: 'Site B',
        slug: websiteSlugB,
        owner: userB.id,
      },
      overrideAccess: true,
    })

    // Create Page for Website A
    pageA = await payload.create({
      collection: 'pages',
      data: {
        title: 'Tenant Test Page',
        slug: pageSlug,
        website: websiteA.id,
        _status: 'draft',
        layout: [
          {
            blockType: 'content',
            columns: [],
          },
        ],
      },
      overrideAccess: true,
    })
  })

  test('User B cannot access User A private page via API', async ({ request }) => {
    // Login as User B
    const loginRes = await request.post(`${BASE_URL}/api/users/login`, {
      data: {
        email: userB.email,
        password: 'password',
      },
    })
    const authCookie = loginRes.headers()['set-cookie']

    // Attempt to fetch User A's private page
    const pageRes = await request.get(`${BASE_URL}/api/pages/${pageA.id}`, {
      headers: {
        Cookie: authCookie,
      },
    })

    // Payload should return 404 because access control filters it out
    expect(pageRes.status()).toBe(404)
  })

  test('User A can access User A private page via API', async ({ request }) => {
    // Login as User A
    const loginRes = await request.post(`${BASE_URL}/api/users/login`, {
      data: {
        email: userA.email,
        password: 'password',
      },
    })
    const authCookie = loginRes.headers()['set-cookie']

    // Fetch User A's private page
    const pageRes = await request.get(`${BASE_URL}/api/pages/${pageA.id}`, {
      headers: {
        Cookie: authCookie,
      },
    })

    expect(pageRes.status()).toBe(200)
    const json = await pageRes.json()
    expect(json.id).toBe(pageA.id)
  })

  test('Public visitor cannot access draft page', async ({ request }) => {
    const pageRes = await request.get(`${BASE_URL}/api/pages/${pageA.id}`)
    expect(pageRes.status()).toBe(404)
  })

  test('Public visitor can access published page', async ({ request }) => {
    // Publish the page via API bypass
    await payload.update({
      collection: 'pages',
      id: pageA.id,
      data: { _status: 'published' },
      overrideAccess: true,
    })

    const pageRes = await request.get(`${BASE_URL}/api/pages/${pageA.id}`)
    expect(pageRes.status()).toBe(200)
    const json = await pageRes.json()
    expect(json.id).toBe(pageA.id)
  })

  test('Signup creates user with user role and ignores requested role', async ({ request }) => {
    const signupRes = await request.post(`${BASE_URL}/api/users`, {
      data: {
        email: `hacker_${Math.random().toString(36).substring(7)}@test.com`,
        password: 'password',
        name: 'Hacker',
        roles: ['admin'], // Attempt privilege escalation
      },
    })

    expect(signupRes.status()).toBe(201)
    const json = await signupRes.json()
    expect(json.doc.roles).toContain('user')
    expect(json.doc.roles).not.toContain('admin')
  })
})
