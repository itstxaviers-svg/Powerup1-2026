import { expect, test, type Page } from '@playwright/test'

async function seedCheckpoint07ImageFight(page: Page) {
  await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('word-code')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    const transaction = db.transaction('battleProgress', 'readwrite')
    const store = transaction.objectStore('battleProgress')
    const now = new Date().toISOString()
    store.put({
      id: 'checkpoint-03', allocations: {}, completedFightIds: ['checkpoint-03'], bestAccuracy: {}, lastIncorrectIds: {},
      introSeenFightIds: [], activated: true, courseCompleted: false, updatedAt: now,
    })
    store.put({
      id: 'checkpoint-07',
      allocations: {
        'checkpoint-07-a': ['u4-food-vocabulary-1-1'],
        'checkpoint-07-b': ['u4-food-vocabulary-1-6'],
      },
      completedFightIds: [], bestAccuracy: {}, lastIncorrectIds: {}, introSeenFightIds: [],
      activated: true, courseCompleted: false, updatedAt: now,
    })
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    })
    db.close()
  })
}

test('opens without login and keeps local progress through reload', async ({ page }) => {
  test.setTimeout(60_000)
  await page.goto('/#/login', { waitUntil: 'domcontentloaded' })
  await expect(page).not.toHaveURL(/#\/login/)
  await expect(page.getByRole('heading', { name: /Decode English/ })).toBeVisible({ timeout: 20_000 })
  await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('word-code')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    const transaction = db.transaction('progress', 'readwrite')
    transaction.objectStore('progress').put({ targetId: 'local-e2e', mastery: 42, state: 'practising', attempts: 4, correct: 3, independentCorrect: 2, taskTypesSeen: ['repair'], sessionDays: ['2026-11-09'], lastSeenAt: new Date().toISOString() })
    await new Promise<void>((resolve, reject) => { transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error) })
    db.close()
  })
  await page.reload({ waitUntil: 'domcontentloaded' })
  const mastery = await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve) => { const request = indexedDB.open('word-code'); request.onsuccess = () => resolve(request.result) })
    const value = await new Promise<{ mastery: number } | undefined>((resolve) => { const request = db.transaction('progress').objectStore('progress').get('local-e2e'); request.onsuccess = () => resolve(request.result) })
    db.close(); return value?.mastery
  })
  expect(mastery).toBe(42)
})

test('shows local transfer tools and the teacher report inbox', async ({ page }) => {
  await page.goto('/#/account')
  await expect(page.getByRole('heading', { name: 'Saved on this device' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Export progress' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Import progress' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Send results' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Change PIN' })).toHaveCount(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false)
  await page.goto('/#/teacher')
  await expect(page.getByRole('heading', { name: 'Teacher Dashboard' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Choose report' })).toBeVisible()
  await expect(page.getByText('No reports imported yet.')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false)
})

test('opens Hello and starts a session without horizontal overflow', async ({ page }) => {
  test.setTimeout(60_000)
  await page.goto('/')
  await page.getByRole('link', { name: /Hello!/ }).click()
  await expect(page.getByRole('heading', { name: 'Hello!' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Training paths' })).toHaveCount(0)
  await expect(page.getByText('Audio codes are ready')).toHaveCount(0)
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

test('opens Checkpoint 03 without Unit mastery and keeps later Units sealed', async ({ page }) => {
  test.setTimeout(60_000)
  await page.goto('/')
  await expect(page.getByRole('link', { name: /Hello!/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /Unit 3/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /Unit 4/ })).toHaveCount(0)
  await expect(page.getByText('CHECKPOINT 07-A')).toBeVisible()
  await expect(page.getByText('CHECKPOINT 03 must be won first.')).toBeVisible()
  const enterBattle = page.getByRole('link', { name: /ENTER BATTLE/ })
  await expect(enterBattle).toHaveCount(1)
  await enterBattle.click()
  await expect(page.locator('.battle-intro-copy blockquote')).toContainText('You cannot clear this signal.', { timeout: 20_000 })
  await expect(page.locator('.battle-intro-copy')).toContainText('no more than 5 mistakes')
  await expect(page.getByRole('button', { name: /START BATTLE/ })).toBeVisible()
  await expect(page.locator('.battle-boss img')).toBeVisible()
  expect(await page.locator('.battle-boss img').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0)
  expect(await page.locator('[class*="player-avatar"]').count()).toBe(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false)
})

test('loads an approved Unit 4 image prompt in Checkpoint 07 without overflow', async ({ page }) => {
  test.setTimeout(60_000)
  await page.goto('/')
  await seedCheckpoint07ImageFight(page)
  await page.goto('/#/battle/checkpoint-07-a')
  await expect(page.locator('.battle-intro-copy')).toContainText('no more than 7 mistakes', { timeout: 20_000 })
  await expect(page.locator('.battle-intro-copy')).toContainText('8s EACH')
  await page.getByRole('button', { name: /START BATTLE/ }).click()
  const clue = page.locator('.battle-prompt img[alt="Word clue"]')
  await expect(clue).toBeVisible({ timeout: 20_000 })
  const imageMetrics = await clue.evaluate((image: HTMLImageElement) => {
    const resource = performance.getEntriesByName(image.currentSrc)[0] as PerformanceResourceTiming | undefined
    return { naturalWidth: image.naturalWidth, source: image.currentSrc, bytes: resource?.decodedBodySize ?? 0 }
  })
  expect(imageMetrics.naturalWidth).toBeGreaterThan(0)
  expect(imageMetrics.source).toContain('.webp')
  expect(imageMetrics.bytes).toBeLessThan(150_000)
  await expect(page.getByLabel('TYPE THE CODE')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false)
})

test('loads compressed rewards artwork without broken images', async ({ page }) => {
  test.setTimeout(60_000)
  await page.goto('/#/rewards')
  await expect(page.getByRole('heading', { name: 'MY ARTIFACTS' })).toBeVisible({ timeout: 20_000 })
  const rewardMessage = page.locator('.reward-message')
  await rewardMessage.scrollIntoViewIfNeeded()
  await expect(rewardMessage).toBeVisible()
  const metrics = await page.locator('.rewards-page img').evaluateAll((images: HTMLImageElement[]) => {
    return images.map((image) => {
      const resource = performance.getEntriesByName(image.currentSrc)[0] as PerformanceResourceTiming | undefined
      return { source: image.currentSrc || image.src, complete: image.complete, naturalWidth: image.naturalWidth, bytes: resource?.decodedBodySize ?? 0 }
    })
  })
  const loaded = metrics.filter((image) => image.complete)
  expect(metrics.length).toBeGreaterThan(20)
  expect(metrics.every((image) => image.source.includes('.webp'))).toBe(true)
  expect(loaded.length).toBeGreaterThan(5)
  expect(loaded.every((image) => image.naturalWidth > 0)).toBe(true)
  expect(Math.max(...loaded.map((image) => image.bytes))).toBeLessThan(250_000)
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false)
})
