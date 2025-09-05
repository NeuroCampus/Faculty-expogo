import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch, jsonFetch, startProactiveRefresh } from './client';

interface LoginResponse { success: boolean; message?: string; access?: string; refresh?: string; role?: string; profile?: any; user_id?: string; }

export async function login(username: string, password: string) {
  const { success, data, error } = await jsonFetch<LoginResponse>('/login/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!success) return { success: false, message: error };
  if (data?.access) {
    await AsyncStorage.setItem('access_token', data.access);
    if (data.refresh) await AsyncStorage.setItem('refresh_token', data.refresh);
    if (data.role) await AsyncStorage.setItem('role', data.role);
    if (data.profile) await AsyncStorage.setItem('user', JSON.stringify(data.profile));
    startProactiveRefresh();
  }
  return data;
}

export async function verifyOTP(user_id: string, otp: string) {
  const { success, data, error } = await jsonFetch<LoginResponse>('/verify-otp/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, otp })
  });
  if (!success) return { success: false, message: error };
  if (data?.access) {
    await AsyncStorage.setItem('access_token', data.access);
    if (data.refresh) await AsyncStorage.setItem('refresh_token', data.refresh);
    if (data.role) await AsyncStorage.setItem('role', data.role);
    if (data.profile) await AsyncStorage.setItem('user', JSON.stringify(data.profile));
    startProactiveRefresh();
  }
  return { success, data, message: data?.message };
}

export async function resendOTP(user_id: string) {
  return jsonFetch<{ success: boolean; message?: string }>('/resend-otp/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id })
  });
}

export async function logout() {
  try {
    const refresh = await AsyncStorage.getItem('refresh_token');
    await apiFetch('/logout/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
      auth: true
    });
  } catch {}
  await AsyncStorage.multiRemove(['access_token','refresh_token','role','user']);
}

export async function forgotPassword(payload: { email: string }) {
  return jsonFetch<{ success: boolean; message?: string }>('/forgot-password/', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
}

export async function resetPassword(payload: { user_id: string; otp: string; new_password: string; confirm_password: string }) {
  return jsonFetch<{ success: boolean; message?: string }>('/reset-password/', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
}
