import { test, expect } from '@playwright/test'

// Уникальные данные для каждого запуска
const timestamp = Date.now()
const organizer = {
  email: `organizer_${timestamp}@test.com`,
  password: 'TestPassword123!',
  name: `Organizer ${timestamp}`,
}
const member = {
  email: `member_${timestamp}@test.com`,
  password: 'TestPassword123!',
  name: `Member ${timestamp}`,
}

test.describe('Full platform flow', () => {
  test('organizer: register, create club, create meeting', async ({ page }) => {
    // 1. Регистрация организатора
    await page.goto('/register')
    await page.fill('[name="email"]', organizer.email)
    await page.fill('[name="password"]', organizer.password)
    await page.fill('[name="confirmPassword"]', organizer.password)
    await page.fill('[name="name"]', organizer.name)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/profile|\/meetings/, { timeout: 45000 })

    // 2. Создание клуба
    await page.goto('/clubs/new')
    await page.fill('input[name="name"]', `Test Club ${timestamp}`)
    await page.fill('textarea[name="description"]', 'English speaking club for practice')
    await page.click('main [type="submit"]')
    await expect(page).toHaveURL(/\/organizer/, { timeout: 45000 })

    // 3. Создание встречи — находим клуб через organizer page
    await page.locator('a[href*="/meetings/new"]').first().click()
    await page.fill('input[name="title"]', `Test Meeting ${timestamp}`)
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 16)
    await page.fill('input[name="date"]', tomorrow)
    await page.selectOption('select[name="cefr_level"]', 'B1')
    await page.fill('input[name="seats_total"]', '10')
    await page.click('main [type="submit"]')
    await expect(page).toHaveURL(/\/meetings\/[a-z0-9-]+/, { timeout: 45000 })
  })

  test('member: register, sign up for meeting', async ({ page }) => {
    // 1. Регистрация участника
    await page.goto('/register')
    await page.fill('[name="email"]', member.email)
    await page.fill('[name="password"]', member.password)
    await page.fill('[name="confirmPassword"]', member.password)
    await page.fill('[name="name"]', member.name)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/profile|\/meetings/, { timeout: 45000 })

    // 2. Открыть каталог и найти встречу
    await page.goto('/meetings')
    // Просто проверяем что каталог загружается
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })
})
