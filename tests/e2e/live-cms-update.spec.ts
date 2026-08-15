import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

test('live CMS update workflow', async ({ page }) => {
  test.setTimeout(60000)

  // 1. Log into the /admin dashboard
  console.log('Navigating to admin login...')
  await page.goto(`${BASE_URL}/admin/login`)

  await page.fill('#field-email', 'admin@cms.com')
  await page.fill('#field-password', 'Admin@123')
  await page.click('button:has-text("Login")')

  // Wait for navigation away from /admin/login
  await page.waitForURL('**/admin', { timeout: 15000 })
  console.log('Logged in successfully.')

  // 2. Navigate to the Pages collection directly (Best Practice for E2E speed and reliability)
  await page.goto(`${BASE_URL}/admin/collections/pages`)

  // 3. Edit the "Home" page
  await page.getByRole('link', { name: 'Home', exact: true }).first().click()
  await expect(page.getByRole('button', { name: /Publish|Save/i }).first()).toBeVisible({ timeout: 15000 })

  // 4. Scroll down and look for the "Add Block" button in the layout section
  await page.getByRole('button', { name: /Add Block/i }).first().click()

  // Select Content Block from the drawer
  await page.getByRole('button', { name: /Content/i }).first().click()

  // Fill the lexical rich text editor
  const contentEditable = page.locator('[contenteditable="true"]').last()
  await contentEditable.click()
  await contentEditable.type('VERIFIED PRODUCTION UPDATE')

  // 5. Publish the change
  await page.getByRole('button', { name: /Save/i }).click()

  // Wait for save confirmation
  await page.waitForTimeout(3000)
  console.log('Published successfully.')

  // 6. Navigate to the live public homepage
  await page.goto(BASE_URL)

  // 7. Verify the text is visible
  await expect(page.getByText('VERIFIED PRODUCTION UPDATE')).toBeVisible({ timeout: 10000 })
  console.log('Verified on frontend.')
})
