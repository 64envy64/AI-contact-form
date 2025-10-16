import { test, expect } from '@playwright/test';

// Test data
const TEST_USER_NAME = 'Test User';
const TEST_EMAIL = 'test@example.com';
const TEST_SUBJECT = 'Сообщение об ошибке';
const TEST_MESSAGE = 'Ваше приложение вылетело когда я нажал кнопку. Пожалуйста исправьте это как можно скорее. Это очень важно для меня.';

// Check if AI API key is configured
const hasAIKey = !!process.env.GEMINI_API_KEY;

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should submit contact form successfully', async ({ page }) => {
    // Navigate to page
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Добро пожаловать!' })).toBeVisible();
    await page.getByLabel('Ваше имя').fill(TEST_USER_NAME);
    await page.getByRole('button', { name: 'Продолжить' }).click();

    await expect(page.getByRole('heading', { name: 'Контактная форма', exact: true })).toBeVisible();

    await expect(page.getByLabel('Имя')).toHaveValue(TEST_USER_NAME);

    await page.getByLabel('Email').fill(TEST_EMAIL);
    await page.getByLabel('Тема обращения').selectOption(TEST_SUBJECT);
    await page.getByLabel('Сообщение').fill(TEST_MESSAGE);

    await expect(page.getByText(`${TEST_MESSAGE.length}/1000`)).toBeVisible();

    await page.getByRole('button', { name: 'Отправить' }).click();

    await expect(page.getByText('Сообщение успешно отправлено!')).toBeVisible();

    await expect(page.getByLabel('Имя')).toHaveValue(TEST_USER_NAME);
    await expect(page.getByLabel('Email')).toHaveValue('');
    await expect(page.getByLabel('Тема обращения')).toHaveValue('');
    await expect(page.getByLabel('Сообщение')).toHaveValue('');
  });

  test('should improve message with AI', async ({ page }) => {
    test.skip(!hasAIKey, 'Skipping AI test: GEMINI_API_KEY not configured');
    
    // Navigate to page
    await page.goto('/');

    await page.getByLabel('Ваше имя').fill(TEST_USER_NAME);
    await page.getByRole('button', { name: 'Продолжить' }).click();

    await expect(page.getByRole('heading', { name: 'Контактная форма', exact: true })).toBeVisible();

    await page.getByLabel('Сообщение').fill(TEST_MESSAGE);

    const [response] = await Promise.all([
      page.waitForResponse(response => response.url().includes('/api/ai/improve')),
      page.getByRole('button', { name: /Улучшить с помощью AI/ }).click()
    ]);

    // Wait for loading state
    await expect(page.getByText('Улучшение...')).toBeVisible();

    // Wait for improved message preview modal (with longer timeout for API call)
    await expect(page.getByRole('heading', { name: 'Улучшенное сообщение' })).toBeVisible({ timeout: 30000 });

    // Verify original message is shown
    await expect(page.getByText('Исходное сообщение:')).toBeVisible();
    await expect(page.locator('text=' + TEST_MESSAGE)).toBeVisible();

    // Verify improved message is shown
    await expect(page.getByText('Улучшенная версия:')).toBeVisible();

    // Get the improved message text
    const improvedMessageElement = page.locator('.bg-violet-50').last();
    const improvedText = await improvedMessageElement.textContent();
    
    // Verify improved message is different from original
    expect(improvedText).toBeTruthy();
    expect(improvedText).not.toBe(TEST_MESSAGE);

    // Click "Use this" button
    await page.getByRole('button', { name: 'Использовать это' }).click();

    // Verify message field is updated with improved text
    await expect(page.getByLabel('Сообщение')).toHaveValue(improvedText || '');

    // Verify modal is closed
    await expect(page.getByRole('heading', { name: 'Улучшенное сообщение' })).not.toBeVisible();
  });

  test('should validate form fields', async ({ page }) => {
    // Navigate to page
    await page.goto('/');

    // Enter user name
    await page.getByLabel('Ваше имя').fill(TEST_USER_NAME);
    await page.getByRole('button', { name: 'Продолжить' }).click();

    // Wait for the form
    await expect(page.getByRole('heading', { name: 'Контактная форма', exact: true })).toBeVisible();

    // Try to submit empty form - button should be disabled
    const submitButton = page.getByRole('button', { name: 'Отправить' });
    await expect(submitButton).toBeDisabled();

    // Fill invalid email
    await page.getByLabel('Email').fill('invalid-email');
    await page.getByLabel('Email').blur();
    await expect(page.getByText('Некорректный email')).toBeVisible();

    // Fill valid email
    await page.getByLabel('Email').fill(TEST_EMAIL);
    
    // Fill message that's too short
    await page.getByLabel('Сообщение').fill('Short');
    await expect(page.getByText(/Сообщение должно содержать минимум 50 символов/)).toBeVisible();

    // Verify character counter shows red for invalid length
    await expect(page.getByText('5/1000')).toHaveClass(/text-red-600/);
  });

  test('should cancel AI improvement', async ({ page }) => {
    test.skip(!hasAIKey, 'Skipping AI test: GEMINI_API_KEY not configured');
    
    // Navigate to page
    await page.goto('/');

    // Enter user name
    await page.getByLabel('Ваше имя').fill(TEST_USER_NAME);
    await page.getByRole('button', { name: 'Продолжить' }).click();

    // Wait for the form
    await expect(page.getByRole('heading', { name: 'Контактная форма', exact: true })).toBeVisible();

    // Fill message field
    await page.getByLabel('Сообщение').fill(TEST_MESSAGE);

    // Click "Improve with AI" button and wait for API response
    await Promise.all([
      page.waitForResponse(response => response.url().includes('/api/ai/improve')),
      page.getByRole('button', { name: /Улучшить с помощью AI/ }).click()
    ]);

    await expect(page.getByRole('heading', { name: 'Улучшенное сообщение' })).toBeVisible({ timeout: 30000 });

    await page.getByRole('button', { name: 'Отменить' }).click();

    await expect(page.getByRole('heading', { name: 'Улучшенное сообщение' })).not.toBeVisible();

    await expect(page.getByLabel('Сообщение')).toHaveValue(TEST_MESSAGE);
  });

  test('should navigate to submissions page', async ({ page }) => {
    // Navigate to page
    await page.goto('/');

    await page.getByLabel('Ваше имя').fill(TEST_USER_NAME);
    await page.getByRole('button', { name: 'Продолжить' }).click();

    await expect(page.getByRole('heading', { name: 'Контактная форма', exact: true })).toBeVisible();

    await page.getByRole('link', { name: 'История отправок' }).click();

    await expect(page).toHaveURL('/submissions');
    await expect(page.getByRole('heading', { name: 'История отправок' })).toBeVisible();
  });
});
