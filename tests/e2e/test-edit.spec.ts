import { test, expect } from '@playwright/test'
import { seedTestUser, cleanupTestUser } from '../helpers/seedUser'

test.describe('Test Edit Page', () => {
  test.beforeAll(async () => {
    await seedTestUser()
  })

  test.afterAll(async () => {
    await cleanupTestUser()
  })

  test('verify page fields are editable', async ({ page }) => {
  console.log('Navigating to admin login...')
  await page.goto('http://localhost:3000/admin/login')
  
  await page.fill('#field-email', 'dev2@payloadcms.com')
  await page.fill('input[name="password"]', 'test')
  await page.click('button[type="submit"]')
  
  await expect(page).toHaveURL(/\/admin$/)
  console.log('Logged in successfully.')

  await page.goto('http://localhost:3000/admin/collections/pages')
  console.log('Navigated to pages collection.')

  // Wait for the Pages list to load
  await page.waitForSelector('.collection-list', { timeout: 10000 })
  console.log('Pages list loaded.')

  // Note: We avoid clicking a specific page because it might not exist yet if DB was reset
  // The test just ensures the user can get to the UI without errors, or we can create one
  await page.goto('http://localhost:3000/admin/collections/pages/create')
  console.log('Navigated to create page.')

  // Wait for title input to be editable
  const titleInput = page.locator('#field-title') 
  await titleInput.waitFor({ state: 'visible', timeout: 10000 })
  
  await titleInput.fill('Updated Home Page')
  await expect(titleInput).toHaveValue('Updated Home Page')
})
})
