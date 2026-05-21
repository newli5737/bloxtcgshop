import { apiFetch } from "../api";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  locale: string;
};

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    const res = await apiFetch<AuthUser>("users/me");
    return res.data;
  } catch {
    return null;
  }
}

export async function loginUser(email: string, password: string): Promise<{ user: AuthUser }> {
  const res = await apiFetch<{ user: AuthUser }>("auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.data;
}

export async function logoutUser(): Promise<void> {
  await apiFetch("auth/logout", { method: "POST" });
}
