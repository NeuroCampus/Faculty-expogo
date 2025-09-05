import AsyncStorage from '@react-native-async-storage/async-storage';

export async function setCache(key: string, value: any) {
  try {
    const payload = JSON.stringify({ t: Date.now(), v: value });
    await AsyncStorage.setItem(`cache:${key}`, payload);
  } catch {}
}

export async function getCache<T = any>(key: string, maxAgeMs: number = 1000 * 60 * 5): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(`cache:${key}`);
    if (!raw) return null;
    const { t, v } = JSON.parse(raw);
    if (Date.now() - t > maxAgeMs) return null;
    return v as T;
  } catch {
    return null;
  }
}

export async function fetchWithCache<T = any>(key: string, fetcher: () => Promise<{ success: boolean; data?: T; message?: string; error?: string }>, maxAgeMs?: number): Promise<{ success: boolean; data?: T; message?: string; error?: string }> {
  const res = await fetcher();
  if (res.success) {
    await setCache(key, res.data);
    return res;
  }
  const cached = await getCache<T>(key, maxAgeMs);
  if (cached) return { success: true, data: cached } as any;
  return res;
}


