import { test, expect, Page } from '@playwright/test'

test.describe('Frontend', () => {
  let page: Page

  test.beforeAll(async ({ browser }, testInfo) => {
    const context = await browser.newContext()
    page = await context.newPage()
  })

  test('redirects homepage to admin login', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.waitForURL('**/admin/login')
    await expect(page.locator('#field-email')).toBeVisible()
  })
})
