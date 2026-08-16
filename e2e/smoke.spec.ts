import { expect, test } from '@playwright/test'

test('opens Hello and starts a session without horizontal overflow', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: /Hello!/ }).click()
  await expect(page.getByRole('heading', { name: 'Hello!' })).toBeVisible()
  const unitOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(unitOverflow).toBe(false)
  await page.getByRole('link', { name: /Quick training/ }).click()
  await expect(page.locator('.challenge-card')).toBeVisible()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(overflow).toBe(false)
})
