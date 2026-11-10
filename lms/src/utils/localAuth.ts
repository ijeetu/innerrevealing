import type { UserDetails } from "@/utils/api/user/getUserDetails";

interface AuthData {
  user: UserDetails;
  token: string;
}

export async function localAuthRequest<T>(path: string, body?: Record<string, unknown>, method = "POST"): Promise<{ message?: string; data: T }> {
  const response = await fetch(`/api/auth/${path}`, {
    method,
    credentials: "same-origin",
    headers: { Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
    cache: "no-store",
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result || result.error) {
    throw new Error(result?.message || "We could not complete that request. Please try again.");
  }
  return result;
}

export const loginLocalAccount = (email: string, password: string) => localAuthRequest<AuthData>("login", { email, password });
export const registerLocalAccount = (name: string, email: string, password: string) => localAuthRequest<AuthData>("register", { name, email, password });
export const logoutLocalSession = async (): Promise<void> => { await localAuthRequest<null>("logout"); };
export const changeLocalPassword = (current_password: string, password: string, confirm_password: string) => localAuthRequest<null>("password", { current_password, password, confirm_password });
export const deleteLocalAccount = (password: string) => localAuthRequest<null>("account", { password }, "DELETE");

export const updateLocalProfile = (name: string) => localAuthRequest<AuthData>("profile", { name });
