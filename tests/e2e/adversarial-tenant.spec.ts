import { expect, test } from '@playwright/test'
import { getPayload } from 'payload'
import configPromise from '../../src/payload.config'

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

test.describe.serial('Adversarial Tenant Verification', () => {
  let payload
  let userA, userB
  let websiteA, websiteB
  let pageA, pageB

  test.beforeAll(async () => {
    payload = await getPayload({ config: configPromise })

    // Clean up
    await payload.delete({ collection: 'pages', where: { slug: { like: 'tenant-test-page' } } })
    await payload.delete({ collection: 'websites', where: { slug: { like: 'site-' } } })
    await payload.delete({ collection: 'users', where: { email: { like: 'test.com' } } })
  })

  test('User A Full Workflow', async ({ request }) => {
    const randomStr = Math.random().toString(36).substring(7)
    const emailA = `userA_${randomStr}@test.com`
    const emailB = `userB_${randomStr}@test.com`
    
    // 1. User A Sign Up
    let res = await request.post(`${BASE_URL}/api/users`, {
      data: { email: emailA, password: 'password', name: 'User A', roles: ['admin'] },
    })
    expect(res.status()).toBe(201)
    let json = await res.json()
    userA = json.doc
    expect(userA.roles).not.toContain('admin') // escalate to admin prevented

    // 2. User A Login
    let loginRes = await request.post(`${BASE_URL}/api/users/login`, {
      data: { email: emailA, password: 'password' },
    })
    const authCookieA = loginRes.headers()['set-cookie']

    // 3. Create Website A
    res = await request.post(`${BASE_URL}/api/websites`, {
      headers: { Cookie: authCookieA },
      data: { title: 'Site A', slug: `site-a-${randomStr}` },
    })
    expect(res.status()).toBe(201)
    json = await res.json()
    websiteA = json.doc
    expect(typeof websiteA.owner === 'object' ? websiteA.owner.id : websiteA.owner).toBe(userA.id) // Server sets owner securely

    // 4. Create Page A (draft)
    res = await request.post(`${BASE_URL}/api/pages`, {
      headers: { Cookie: authCookieA },
      data: {
        title: 'Tenant Test Page A',
        slug: `tenant-test-page-a-${randomStr}`,
        website: websiteA.id,
        _status: 'draft',
        layout: [
          {
            blockType: 'content',
            columns: [],
          },
        ],
      },
    })
    expect(res.status()).toBe(201)
    json = await res.json()
    pageA = json.doc

    // === User B Full Workflow ===

    // 1. User B Sign Up
    res = await request.post(`${BASE_URL}/api/users`, {
      data: { email: emailB, password: 'password', name: 'User B', roles: ['user'] },
    })
    expect(res.status()).toBe(201)
    json = await res.json()
    userB = json.doc

    // 2. User B Login
    loginRes = await request.post(`${BASE_URL}/api/users/login`, {
      data: { email: emailB, password: 'password' },
    })
    const authCookieB = loginRes.headers()['set-cookie']

    // 3. Create Website B
    res = await request.post(`${BASE_URL}/api/websites`, {
      headers: { Cookie: authCookieB },
      data: { title: 'Site B', slug: `site-b-${randomStr}` },
    })
    expect(res.status()).toBe(201)
    json = await res.json()
    websiteB = json.doc
    expect(typeof websiteB.owner === 'object' ? websiteB.owner.id : websiteB.owner).toBe(userB.id)

    // 4. Create Page B (published)
    res = await request.post(`${BASE_URL}/api/pages`, {
      headers: { Cookie: authCookieB },
      data: {
        title: 'Tenant Test Page B',
        slug: `tenant-test-page-b-${randomStr}`,
        website: websiteB.id,
        _status: 'published',
        layout: [
          {
            blockType: 'content',
            columns: [],
          },
        ],
      },
    })
    expect(res.status()).toBe(201)
    json = await res.json()
    pageB = json.doc

    // === User A Cross-Tenant Attacks ===

    // - read Website B
    res = await request.get(`${BASE_URL}/api/websites/${websiteB.id}`, { headers: { Cookie: authCookieA } })
    expect(res.status()).toBe(404)

    // - read Page B directly by ID
    res = await request.get(`${BASE_URL}/api/pages/${pageB.id}`, { headers: { Cookie: authCookieA } })
    // wait, Page B is published, so anyone can read it! Let's check.
    // the test is about A not being able to UPDATE it.

    // - update Page B
    res = await request.patch(`${BASE_URL}/api/pages/${pageB.id}`, {
      headers: { Cookie: authCookieA },
      data: { title: 'Hacked by A' },
    })
    expect(res.status()).toBe(403)

    // - delete Page B
    res = await request.delete(`${BASE_URL}/api/pages/${pageB.id}`, { headers: { Cookie: authCookieA } })
    expect(res.status()).toBe(403)

    // - modify Website B
    res = await request.patch(`${BASE_URL}/api/websites/${websiteB.id}`, {
      headers: { Cookie: authCookieA },
      data: { title: 'Hacked Site B' },
    })
    expect(res.status()).toBe(403)

    // - change Website B ownership
    res = await request.patch(`${BASE_URL}/api/websites/${websiteB.id}`, {
      headers: { Cookie: authCookieA },
      data: { owner: userA.id },
    })
    expect(res.status()).toBe(403)

    // - create a page inside Website B
    res = await request.post(`${BASE_URL}/api/pages`, {
      headers: { Cookie: authCookieA },
      data: { title: 'Hacked Page B', slug: 'hacked-page-b', website: websiteB.id },
    })
    // Either 403 Forbidden or 400 Bad Request if validation fails
    expect([403, 400]).toContain(res.status())

    // - update User B
    res = await request.patch(`${BASE_URL}/api/users/${userB.id}`, {
      headers: { Cookie: authCookieA },
      data: { email: 'hacked@test.com' },
    })
    expect(res.status()).toBe(403)

    // - promote themselves to admin
    res = await request.patch(`${BASE_URL}/api/users/${userA.id}`, {
      headers: { Cookie: authCookieA },
      data: { roles: ['admin'] },
    })
    // This might return 200, but ignores the role change! Let's check the json.
    const selfUpdate = await res.json()
    if (res.status() === 200) {
      expect(selfUpdate.doc.roles).not.toContain('admin')
    } else {
      expect(res.status()).toBe(403) // Field access control might block it
    }
    
    // - create website owned by User B
    res = await request.post(`${BASE_URL}/api/websites`, {
      headers: { Cookie: authCookieA },
      data: { title: 'Fake Site B', slug: 'fake-site-b', owner: userB.id },
    })
    expect(res.status()).toBe(201)
    const fakeSite = await res.json()
    // Payload's relationship field might return ID or populated object
    const ownerId = typeof fakeSite.doc.owner === 'object' ? fakeSite.doc.owner.id : fakeSite.doc.owner
    expect(ownerId).toBe(userA.id) // The hook overrides the requested owner
  })
})
