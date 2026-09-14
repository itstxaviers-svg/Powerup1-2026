import { expect, test, type Page } from '@playwright/test'
import { unit3LexicalItems } from '../src/content/unit3'

async function establishStudentSession(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem('word-code:session', 'e2e')
    sessionStorage.setItem('word-code:cloud-session', JSON.stringify({ token: 'e2e-local', role: 'student', subjectId: 'e2e', expiresAt: new Date(Date.now() + 60_000).toISOString() }))
  })
}

test('keeps login through reload and removes persistent legacy sessions', async ({ page }) => {
  await page.goto('/#/login')
  await page.evaluate(() => {
    localStorage.setItem('word-code:session', 'legacy-e2e')
    localStorage.setItem('word-code:cloud-session', JSON.stringify({ token: 'legacy-e2e', role: 'student', subjectId: 'legacy-e2e', expiresAt: new Date(Date.now() + 60_000).toISOString() }))
  })
  await page.goto('/')
  await expect(page).not.toHaveURL(/#\/login/)
  expect(await page.evaluate(() => localStorage.getItem('word-code:session'))).toBeNull()
  expect(await page.evaluate(() => localStorage.getItem('word-code:cloud-session'))).toBeNull()
  expect(await page.evaluate(() => sessionStorage.getItem('word-code:session'))).toBe('legacy-e2e')
  await page.reload()
  await expect(page).not.toHaveURL(/#\/login/)
})

test('opens Hello and starts a session without horizontal overflow', async ({ page }) => {
  test.setTimeout(60_000)
  await establishStudentSession(page)
  await page.goto('/')
  await page.getByRole('link', { name: /Hello!/ }).click()
  await expect(page.getByRole('heading', { name: 'Hello!' })).toBeVisible()
  await expect(page.locator('.mode-card')).toHaveCount(5)
  await expect(page.locator('.mode-card strong')).toHaveText(['Repair', 'Unscramble', 'Memory', 'Error Hunt', 'Audio Code'])
  await expect(page.locator('.part-options button')).toHaveCount(4)
  await page.getByRole('button', { name: /Introductions/ }).click()
  await expect(page.getByRole('button', { name: /All Parts/ })).toHaveAttribute('aria-pressed', 'false')
  await page.reload()
  await expect(page.getByRole('button', { name: /Introductions/ })).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByRole('button', { name: /Numbers/ })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: /Colours/ })).toHaveAttribute('aria-pressed', 'true')
  const unitOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(unitOverflow).toBe(false)
  const smallestPartControl = await page.locator('.part-options button').evaluateAll((buttons) => Math.min(...buttons.map((button) => button.getBoundingClientRect().height)))
  expect(smallestPartControl).toBeGreaterThanOrEqual(44)
  await page.getByRole('link', { name: /Quick training/ }).click()
  await expect(page.getByLabel('YOUR DECODE')).toBeVisible({ timeout: 10_000 })
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(overflow).toBe(false)
})

test('activates Checkpoint 03 and renders its first-person battle without overflow', async ({ page }) => {
  await establishStudentSession(page)
  await page.goto('/')
  await page.evaluate(async (targetIds) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('word-code')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    const transaction = db.transaction('progress', 'readwrite')
    const store = transaction.objectStore('progress')
    const now = new Date().toISOString()
    targetIds.forEach((targetId) => store.put({ targetId, mastery: 70, state: 'stable', attempts: 5, correct: 5, independentCorrect: 3, taskTypesSeen: ['repair', 'unscramble', 'audio'], sessionDays: ['2026-09-13', '2026-09-14'], lastSeenAt: now }))
    await new Promise<void>((resolve, reject) => { transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error) })
    db.close()
  }, unit3LexicalItems.map((item) => item.id))
  await page.reload()
  const enterBattle = page.getByRole('link', { name: /ENTER BATTLE/ })
  await expect(enterBattle).toHaveCount(1)
  await enterBattle.click()
  await expect(page.locator('.battle-intro-copy blockquote')).toContainText('You cannot clear this signal.')
  await expect(page.getByRole('button', { name: /START BATTLE/ })).toBeVisible()
  await expect(page.locator('.battle-boss img')).toBeVisible()
  expect(await page.locator('.battle-boss img').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0)
  expect(await page.locator('[class*="player-avatar"]').count()).toBe(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false)
})
