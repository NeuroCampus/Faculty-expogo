import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, TOKEN_REFRESH_INTERVAL_MS } from '../utils/env';

let proactiveTimer: ReturnType<typeof setInterval> | null = null;

async function getTokens() {
  const [access, refresh] = await Promise.all([
    AsyncStorage.getItem('access_token'),
    AsyncStorage.getItem('refresh_token')
  ]);
  return { access, refresh };
}

async function setTokens(access?: string | null, refresh?: string | null) {
  if (access) await AsyncStorage.setItem('access_token', access);
  if (refresh) await AsyncStorage.setItem('refresh_token', refresh);
}

export async function refreshToken(): Promise<boolean> {
  const { refresh } = await getTokens();
  if (!refresh) return false;
  try {
    const res = await fetch(`${API_BASE_URL}/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh })
    });
    const data = await res.json();
    if (!res.ok || !data.access) return false;
    await setTokens(data.access, data.refresh);
    return true;
  } catch {
    return false;
  }
}

export function startProactiveRefresh() {
  stopProactiveRefresh();
  proactiveTimer = setInterval(async () => {
    await refreshToken();
  }, TOKEN_REFRESH_INTERVAL_MS);
}

export function stopProactiveRefresh() {
  if (proactiveTimer) clearInterval(proactiveTimer);
  proactiveTimer = null;
}

export interface FetchOptions extends RequestInit { auth?: boolean }

export async function apiFetch(path: string, options: FetchOptions = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options.headers as any)
  };
  if (options.auth) {
    const { access } = await getTokens();
    if (access) headers['Authorization'] = `Bearer ${access}`;
  }
  let res = await fetch(url, { ...options, headers });
  if (res.status === 401 && options.auth) {
    const refreshed = await refreshToken();
    if (refreshed) {
      const { access } = await getTokens();
      if (access) headers['Authorization'] = `Bearer ${access}`;
      res = await fetch(url, { ...options, headers });
    } else {
      await AsyncStorage.multiRemove(['access_token','refresh_token']);
      stopProactiveRefresh();
    }
  }
  return res;
}

export async function jsonFetch<T>(path: string, options: FetchOptions = {}): Promise<{ ok: boolean; data?: T; error?: string; status?: number }> {
  try {
    const res = await apiFetch(path, options);
    let data: any = null;
    try {
      data = await res.json();
    } catch (parseErr: any) {
      // Fallback: attempt to read text for diagnostics (HTML error pages, etc.)
      try {
        const text = await res.text();
        const snippet = text.slice(0, 180).replace(/\s+/g, ' ');
        return { ok: false, error: `Invalid JSON in response: ${snippet}`, status: res.status };
      } catch {
        return { ok: false, error: 'Invalid JSON in response', status: res.status };
      }
    }
    if (!res.ok) return { ok: false, error: data?.message || `Request failed (${res.status})`, status: res.status };
    return { ok: true, data, status: res.status };
  } catch (e: any) {
    return { ok: false, error: e.message || 'Network error' };
  }
}
