export async function fetchCsrfToken(): Promise<string | null> {
  try {
    const res = await fetch('/api/csrf', { credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.csrfToken ?? null;
  } catch {
    return null;
  }
}

export async function withCsrfHeaders(init?: RequestInit): Promise<RequestInit> {
  const token = await fetchCsrfToken();
  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) baseHeaders['x-csrf-token'] = token;

  const mergedHeaders = {
    ...(init?.headers || {}),
    ...baseHeaders,
  } as Record<string, string>;

  return { ...(init || {}), headers: mergedHeaders, credentials: 'include' };
}
