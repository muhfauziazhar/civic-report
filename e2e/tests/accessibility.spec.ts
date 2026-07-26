import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'];

test.describe('Accessibility (Axe Core, WCAG 2.2 AA)', () => {
  test('form page has no detectable violations', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(results.violations).toEqual([]);
  });

  test('error state has no detectable violations', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Submit report' }).click();
    await expect(page.getByRole('alert')).toBeVisible();

    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(results.violations).toEqual([]);
  });

  test('success state with populated list has no detectable violations', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Issue title').fill('Axe scan report');
    await page.getByLabel('Category').selectOption('waste');
    await page.getByLabel('Location').fill('Jalan Axe 3');
    await page.getByLabel('Description').fill('Ensuring the success state is accessible too');
    await page.getByRole('button', { name: 'Submit report' }).click();
    await expect(page.getByRole('status')).toBeVisible();

    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(results.violations).toEqual([]);
  });
});
