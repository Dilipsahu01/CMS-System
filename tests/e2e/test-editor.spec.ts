import { test, expect } from '@playwright/test'
import { seedTestUser, normalUser } from '../helpers/seedUser'

test('dump editor', async ({ page }) => {
  await seedTestUser()
  await page.goto('http://localhost:3000/admin/login')
  await page.fill('#field-email', normalUser.email)
  await page.fill('#field-password', normalUser.password)
  await page.click('button:has-text("Login")')
  await page.waitForURL('**/admin', { timeout: 15000 })
  
  // Create website to set active tenant
  await page.goto('http://localhost:3000/admin/collections/websites/create')
  await page.fill('#field-title', 'Normal Site')
  await page.fill('#field-slug', `normal-site-${Math.random().toString(36).substring(7)}`)
  await page.click('button:has-text("Save")')
  await expect(page.locator('.toast-success')).toBeVisible({ timeout: 15000 })
  
  // Create page
  await page.goto('http://localhost:3000/admin/collections/pages/create')
  await page.waitForTimeout(2000)
  
  await page.locator('button.tabs-field__tab-button:has-text("Content")').click()
  await page.getByRole('button', { name: /Add Layout/i }).first().click()
  const contentBlockBtn = page.locator('button.thumbnail-card:has-text("Content")').first()
  await contentBlockBtn.waitFor({ state: 'visible', timeout: 5000 })
  await contentBlockBtn.click()
  await page.waitForTimeout(3000)
  
  const editorHtml = await page.evaluate(() => {
    // Attempt to find lexical editor elements
    const pE = document.querySelector('[contenteditable="true"]')
    if (pE) return pE.outerHTML
    const rE = document.querySelector('.rich-text-editor')
    if (rE) return rE.outerHTML
    
    // Dump all contenteditables if any
    const allC = Array.from(document.querySelectorAll('[contenteditable]'))
    if (allC.length > 0) return allC.map(x => x.outerHTML).join('\n')
    
    // Dump all blocks
    return document.querySelector('.blocks-field')?.innerHTML || 'NO EDITOR FOUND'
  })
  
  console.log('EDITOR HTML DUMP:', editorHtml)
})
