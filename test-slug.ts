import { getPayload } from 'payload'
import configPromise from '@payload-config'

async function test() {
  const payload = await getPayload({ config: configPromise })
  
  try {
    const adminUser = await payload.find({ collection: 'users', limit: 1 })
    
    await payload.create({
      collection: 'websites',
      data: {
        title: 'Admin Corporate Site',
        slug: 'admin-corp',
        owner: adminUser.docs[0].id,
      },
    })
    console.log('Website created successfully')
  } catch (error: any) {
    console.error('Validation Error for Websites:', JSON.stringify(error, null, 2))
    if (error.data) {
      console.error('Error Data:', JSON.stringify(error.data, null, 2))
    }
  }

  try {
    await payload.create({
      collection: 'pages',
      data: {
        title: 'Home',
        slug: 'home',
        website: adminUser.docs[0].id, // Doesn't matter if it fails
        author: adminUser.docs[0].id,
      }
    })
    console.log('Page created successfully')
  } catch (error: any) {
    console.error('Validation Error for Pages:', JSON.stringify(error, null, 2))
    if (error.data) {
      console.error('Error Data:', JSON.stringify(error.data, null, 2))
    }
  }
}

test().then(() => process.exit(0))
