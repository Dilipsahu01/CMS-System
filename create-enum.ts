import { Client } from 'pg'
import 'dotenv/config'

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })
  await client.connect()
  try {
    await client.query("CREATE TYPE enum_users_roles AS ENUM ('admin', 'user');")
    console.log("Enum created")
  } catch (e) {
    console.error(e)
  }
  await client.end()
}
run()
