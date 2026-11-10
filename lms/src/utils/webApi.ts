export class WebApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
export async function webRequest<T>(path: string, options: { method?: string; body?: unknown; signal?: AbortSignal } = {}): Promise<T> {
  if (!path.startsWith('/api/')) throw new Error('Use a local API path.');
  const response = await fetch(path, {
    method: options.method || 'GET', credentials: 'same-origin', cache: 'no-store', signal: options.signal,
    headers: { Accept: 'application/json', ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result || result.error) throw new WebApiError(result?.message || 'We could not complete that request. Please try again.', response.status);
  return result.data as T;
}
