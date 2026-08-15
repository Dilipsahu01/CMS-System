import { test, expect } from '@playwright/test'

test('verify page fields are editable', async ({ page }) => {
  console.log('Navigating to admin login...')
  await page.goto('http://localhost:3000/admin/login')
  
  await page.fill('input[name="email"]', 'admin@cms.com')
  await page.fill('input[name="password"]', 'Admin@123')
  await page.click('button[type="submit"]')
  
  await expect(page).toHaveURL(/\/admin$/)
  console.log('Logged in successfully.')

  await page.goto('http://localhost:3000/admin/collections/pages')
  await page.waitForSelector('text=About Us')
  await page.click('text=About Us')
  
  await page.waitForURL(/\/admin\/collections\/pages\//)
  
  // Check if title is disabled
  const titleInput = page.locator('input[name="title"]')
  const isDisabled = await titleInput.isDisabled()
  console.log('Title input disabled state:', isDisabled)

  // Expand the Content tab/layout if needed
  const isReadonly = await titleInput.getAttribute('readonly') !== null;
  console.log('Title input readonly attribute:', isReadonly)

  // Take a screenshot to see what it looks like
  await page.screenshot({ path: 'admin-about-page.png', fullPage: true })
})
