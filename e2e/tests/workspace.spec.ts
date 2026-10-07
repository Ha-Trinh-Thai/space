import { test, expect } from '../fixtures';

test.describe('workspace', () => {
  test('creates a workspace and opens it', async ({ authedPage: page }) => {
    const name = `E2E Workspace ${Date.now()}`;
    await page.goto('/');
    await page.getByRole('button', { name: 'New Workspace' }).click();

    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Workspace name').fill(name);
    await dialog.getByRole('button', { name: 'Create', exact: true }).click();

    await expect(page).toHaveURL(/\/workspace\/[^/]+$/);
    await expect(page.getByText(name).first()).toBeVisible();
  });
});
