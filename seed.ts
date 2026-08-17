import { getPayload } from 'payload'
import configPromise from './src/payload.config'

async function seed() {
  const payload = await getPayload({ config: configPromise })

  const existingAdmin = await payload.find({
    collection: 'users',
    where: { email: { equals: 'admin@example.com' } },
  })

  if (existingAdmin.totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: {
        email: 'admin@example.com',
        password: 'payload',
        name: 'Admin',
        roles: ['admin'],
      },
    })
    console.log('Created admin@example.com')
  } else {
    console.log('admin@example.com already exists')
  }

  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
