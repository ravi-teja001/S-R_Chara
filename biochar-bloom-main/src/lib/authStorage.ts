/**
 * Railway API auth: store JWT and user in localStorage when using VITE_API_URL.
 */

const TOKEN_KEY = 'railway_token';
const USER_KEY = 'railway_user';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getUser(): { id: string; email: string; name: string; role: string; stockPointId?: string; plantId?: string } | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setUser(user: { id: string; email: string; name: string; role: string; stockPointId?: string; plantId?: string }): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clear(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
