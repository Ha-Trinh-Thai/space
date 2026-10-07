import { test, expect, newUserData } from '../fixtures';

test.describe('auth', () => {
  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  });

  test('signs up a new account and lands on home', async ({ page }) => {
    const data = newUserData();
    await page.goto('/auth/signup');
    await page.getByPlaceholder('John Doe').fill(data.name);
    await page.getByPlaceholder('you@example.com').fill(data.email);
    await page.getByPlaceholder('Minimum 8 characters').fill(data.password);
    await page.getByRole('button', { name: 'Create Account' }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText(`Welcome back, ${data.name}`)).toBeVisible();
  });

  test('logs in with an existing account', async ({ page, user }) => {
    await page.goto('/auth/login');
    await page.getByPlaceholder('you@example.com').fill(user.email);
    await page.getByPlaceholder('Enter your password').fill(user.password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText(`Welcome back, ${user.name}`)).toBeVisible();
  });

  test('shows an error for a wrong password', async ({ page, user }) => {
    await page.goto('/auth/login');
    await page.getByPlaceholder('you@example.com').fill(user.email);
    await page.getByPlaceholder('Enter your password').fill('wrong-password');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/login$/);
  });
});
