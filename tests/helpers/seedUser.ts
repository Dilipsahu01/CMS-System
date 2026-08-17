import { getPayload } from 'payload'
import config from '../../src/payload.config.js'

export const adminUser = {
  email: 'dev2@payloadcms.com',
  password: 'test',
  roles: ['admin'],
}
export const testUser = adminUser

export const normalUser = {
  email: 'normal@test.com',
  password: 'test',
  roles: ['user'],
}

/**
 * Seeds test users for e2e tests.
 */
export async function seedTestUser(): Promise<void> {
  const payload = await getPayload({ config })

  // Clean up existing
  await payload.delete({
    collection: 'users',
    where: {
      or: [
        { email: { equals: adminUser.email } },
        { email: { equals: normalUser.email } }
      ]
    },
  })

  // Create fresh admin
  await payload.create({
    collection: 'users',
    data: adminUser,
    req: { user: { roles: ['admin'] } } as any,
  })

  // Create fresh normal user
  await payload.create({
    collection: 'users',
    data: normalUser,
    req: { user: { roles: ['admin'] } } as any,
  })
}

/**
 * Cleans up test users after tests
 */
export async function cleanupTestUser(): Promise<void> {
  const payload = await getPayload({ config })

  await payload.delete({
    collection: 'users',
    where: {
      or: [
        { email: { equals: adminUser.email } },
        { email: { equals: normalUser.email } }
      ]
    },
  })
}
