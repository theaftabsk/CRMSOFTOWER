const API_BASE_URL = {
  toString() {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      if (host.includes('zyvocrm.in')) {
        return `${window.location.protocol}//api.zyvocrm.in/api/v1`;
      }
    }
    return 'http://localhost:4000/api/v1';
  },
};

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-org-id': 'ORG001',
        ...(options.headers || {}),
      },
    });
    if (!res.ok) throw new Error(`API error: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn(`API Error [${endpoint}]:`, err);
    return null;
  }
}
