import { getPayload } from 'payload'
import configPromise from '@payload-config'

async function checkUsers() {
  const payload = await getPayload({ config: configPromise })
  const users = await payload.find({
    collection: 'users',
    limit: 1000
  })
  console.log(`Total users: ${users.totalDocs}`)
  users.docs.forEach(u => console.log(`- Email: ${u.email} | Roles: ${u.roles?.join(', ')}`))
  process.exit(0)
}
checkUsers()
