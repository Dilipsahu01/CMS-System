import { test, expect } from '@playwright/test'

test('live CMS update workflow', async ({ page }) => {
  // 1. Log into the /admin dashboard
  console.log('Navigating to admin login...')
  await page.goto('/admin/login')
  
  await page.fill('#field-email', 'admin@business.com')
  await page.fill('#field-password', 'password123')
  await page.click('button[type="submit"]')
  
  // Wait for dashboard to load
  await expect(page).toHaveURL(/\/admin/)
  console.log('Logged in successfully.')

  // 2. Navigate to the Pages collection
  await page.click('text=Pages')
  await expect(page).toHaveURL(/\/admin\/collections\/pages/)

  // 3. Edit the "Home" page
  await page.click('text=Home')
  
  // 4. Add a new text/content block saying "VERIFIED PRODUCTION UPDATE"
  // Assuming there is an "Add Block" button or similar, but the easiest way is to modify the title 
  // or a specific text field if it's too complex to add a block via UI.
  // Wait, the prompt says "Adds a new paragraph/text block that says "VERIFIED PRODUCTION UPDATE"".
  // Payload's lexical editor might be hard to interact with. Let's just modify the meta description or title?
  // Let's add a Content block.
  
  // Click on the Content tab
  await page.click('button:has-text("Content")')

  // Click Add Block in Layout
  await page.click('button:has-text("Add Block")')
  
  // Select Content Block
  await page.click('button:has-text("Content")')
  
  // Fill the lexical rich text editor. 
  // Finding Lexical editor content editable area
  const contentEditable = page.locator('[contenteditable="true"]').last()
  await contentEditable.click()
  await contentEditable.fill('VERIFIED PRODUCTION UPDATE')

  // 5. Publish the change
  await page.click('button:has-text("Publish")')
  
  // Wait for success toast
  await expect(page.locator('.toast-success')).toBeVisible({ timeout: 10000 })
  console.log('Published successfully.')

  // 6. Navigate to the live public homepage
  await page.goto('/')

  // 7. Verify the text is visible
  await expect(page.locator('text=VERIFIED PRODUCTION UPDATE')).toBeVisible()
  console.log('Verified on frontend.')
})
