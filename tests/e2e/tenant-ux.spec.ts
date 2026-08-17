import { expect, test } from '@playwright/test'
import { getPayload } from 'payload'
import configPromise from '../../src/payload.config'

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

test.describe('Tenant UX Auto-Association', () => {
  let payload
  let singleSiteUser
  let multiSiteUser
  let siteA
  let siteB
  let siteC

  test.beforeAll(async () => {
    payload = await getPayload({ config: configPromise })

    const randomStr = Math.random().toString(36).substring(7)
    const emailSingle = `single_${randomStr}@test.com`
    const emailMulti = `multi_${randomStr}@test.com`

    // Create User with exactly 1 website
    singleSiteUser = await payload.create({
      collection: 'users',
      data: { email: emailSingle, password: 'password', name: 'Single Site User', roles: ['user'] },
    })

    siteA = await payload.create({
      collection: 'websites',
      data: { title: 'Single User Site', slug: `single-site-${randomStr}`, owner: singleSiteUser.id },
      overrideAccess: true,
    })

    // Create User with multiple websites
    multiSiteUser = await payload.create({
      collection: 'users',
      data: { email: emailMulti, password: 'password', name: 'Multi Site User', roles: ['user'] },
    })

    siteB = await payload.create({
      collection: 'websites',
      data: { title: 'Multi User Site B', slug: `site-b-${randomStr}`, owner: multiSiteUser.id },
      overrideAccess: true,
    })

    siteC = await payload.create({
      collection: 'websites',
      data: { title: 'Multi User Site C', slug: `site-c-${randomStr}`, owner: multiSiteUser.id },
      overrideAccess: true,
    })
  })

  test('Single-website user automatically associates new page with their only website', async ({ request }) => {
    // Login
    const loginRes = await request.post(`${BASE_URL}/api/users/login`, {
      data: { email: singleSiteUser.email, password: 'password' },
    })
    const authCookie = loginRes.headers()['set-cookie']

    // Create page without specifying website
    const pageRes = await request.post(`${BASE_URL}/api/pages`, {
      headers: { Cookie: authCookie },
      data: {
        title: 'Auto Associated Page',
        slug: `auto-page-${Math.random().toString(36).substring(7)}`,
        _status: 'draft',
        layout: [{ blockType: 'content', columns: [] }],
      },
    })

    expect(pageRes.status()).toBe(201)
    const page = await pageRes.json()
    const websiteId = typeof page.doc.website === 'object' ? page.doc.website.id : page.doc.website
    expect(websiteId).toBe(siteA.id)
  })

  test('Multi-website user automatically associates new page based on payload-tenant cookie', async ({ request }) => {
    // Login
    const loginRes = await request.post(`${BASE_URL}/api/users/login`, {
      data: { email: multiSiteUser.email, password: 'password' },
    })
    const authCookie = loginRes.headers()['set-cookie']

    // Inject the payload-tenant cookie for Site C
    // The standard set-cookie might have multiple lines, so we just append our cookie to the string sent in the header
    const cookieHeader = `${authCookie}; payload-tenant=${siteC.id}`

    // Create page without specifying website
    const pageRes = await request.post(`${BASE_URL}/api/pages`, {
      headers: { Cookie: cookieHeader },
      data: {
        title: 'Cookie Associated Page',
        slug: `cookie-page-${Math.random().toString(36).substring(7)}`,
        _status: 'draft',
        layout: [{ blockType: 'content', columns: [] }],
      },
    })

    expect(pageRes.status()).toBe(201)
    const page = await pageRes.json()
    const websiteId = typeof page.doc.website === 'object' ? page.doc.website.id : page.doc.website
    expect(websiteId).toBe(siteC.id)
  })

  test('Multi-website user fails to associate page if no cookie is provided', async ({ request }) => {
    // Login
    const loginRes = await request.post(`${BASE_URL}/api/users/login`, {
      data: { email: multiSiteUser.email, password: 'password' },
    })
    const authCookie = loginRes.headers()['set-cookie']

    // Create page without specifying website and NO payload-tenant cookie
    const pageRes = await request.post(`${BASE_URL}/api/pages`, {
      headers: { Cookie: authCookie },
      data: {
        title: 'Failing Page',
        slug: `fail-page-${Math.random().toString(36).substring(7)}`,
        _status: 'draft',
        layout: [{ blockType: 'content', columns: [] }],
      },
    })

    // Should fail validation because website is required, and couldn't be auto-associated
    expect(pageRes.status()).toBe(400)
    const err = await pageRes.json()
    expect(JSON.stringify(err)).toContain('website')
  })
})
