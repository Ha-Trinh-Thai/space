import { test as base, expect, type APIRequestContext } from '@playwright/test';

export const API_URL = process.env.E2E_API_URL ?? 'http://localhost:4000/api';

export interface TestUser {
  name: string;
  email: string;
  password: string;
  accessToken: string;
  refreshToken: string;
}

/** Unique per call so parallel tests never collide on the same email. */
export function newUserData() {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return { name: `E2E User ${id}`, email: `e2e-${id}@example.test`, password: 'Passw0rd!e2e' };
}

export async function createUser(request: APIRequestContext): Promise<TestUser> {
  const data = newUserData();
  const res = await request.post(`${API_URL}/auth/signup`, { data });
  expect(res.ok(), `signup failed: ${res.status()} ${await res.text()}`).toBeTruthy();
  const body = await res.json();
  return { ...data, accessToken: body.access_token, refreshToken: body.refresh_token };
}

type Fixtures = {
  /** A freshly registered user (via API), not logged in in the browser. */
  user: TestUser;
  /** A page already authenticated as `user`. */
  authedPage: import('@playwright/test').Page;
};

export const test = base.extend<Fixtures>({
  user: async ({ request }, use) => {
    await use(await createUser(request));
  },
  authedPage: async ({ page, user }, use) => {
    await page.addInitScript(
      ([access, refresh]) => {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
      },
      [user.accessToken, user.refreshToken],
    );
    await use(page);
  },
});

export { expect };
