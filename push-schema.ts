import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from './src/payload.config'

async function run() {
  console.log('Initializing payload...')
  const payload = await getPayload({ config: configPromise })
  console.log('Payload initialized! Schema should be pushed.')
  process.exit(0)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
