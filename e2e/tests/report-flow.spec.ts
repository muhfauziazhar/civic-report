import { expect, test } from '@playwright/test';

test.describe('Report submission flow', () => {
  test('submits a report and sees it in the list', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel('Issue title').fill('E2E broken pavement');
    await page.getByLabel('Category').selectOption('roads');
    await page.getByLabel('Location').fill('Jalan Testing 1');
    await page.getByLabel('Description').fill('Created by Playwright e2e test');
    await page.getByRole('button', { name: 'Submit report' }).click();

    await expect(page.getByRole('status')).toContainText('submitted');
    await expect(page.getByRole('table')).toContainText('E2E broken pavement');
  });

  test('shows error summary and moves focus on invalid submit', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Submit report' }).click();

    const summary = page.getByRole('alert');
    await expect(summary).toContainText('There is a problem');
    await expect(summary).toBeFocused();

    // Clicking an error link moves focus to the field (WCAG 2.2 error handling pattern)
    await summary.getByRole('link').first().click();
    await expect(page.getByLabel('Issue title')).toBeFocused();
  });

  test('form is fully operable with keyboard only', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel('Issue title').focus();
    await page.keyboard.type('Keyboard-only report');
    await page.keyboard.press('Tab'); // category
    await page.getByLabel('Category').selectOption('other');
    await page.keyboard.press('Tab'); // location
    await page.keyboard.type('Somewhere');
    await page.keyboard.press('Tab'); // description
    await page.keyboard.type('Submitted without a mouse');
    await page.keyboard.press('Tab'); // submit button
    await expect(page.getByRole('button', { name: 'Submit report' })).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(page.getByRole('status')).toContainText('submitted');
  });
});
