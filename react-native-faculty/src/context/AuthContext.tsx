import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, logout, verifyOTP } from '../api/auth';
import { startProactiveRefresh, stopProactiveRefresh } from '../api/client';
import { getProfile } from '../api/faculty';

interface AuthState { loading: boolean; isAuthenticated: boolean; role?: string | null; user?: any; otpRequired?: boolean; userIdForOtp?: string | null; }
interface AuthContextValue extends AuthState { loginUser: (u: string, p: string) => Promise<{ success: boolean; message?: string }>; logoutUser: () => Promise<void>; verifyOtp: (otp: string) => Promise<{ success: boolean; message?: string }>; verifying?: boolean; }

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({ loading: true, isAuthenticated: false });

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      if (!cancelled) setState((s) => ({ ...s, loading: false, isAuthenticated: false }));
    }, 8000);
    (async () => {
      try {
        const access = await AsyncStorage.getItem('access_token');
        const role = await AsyncStorage.getItem('role');
        const userStr = await AsyncStorage.getItem('user');
        if (access) {
          const res = await getProfile();
          if (cancelled) return;
          if (res.success) {
            startProactiveRefresh();
            setState({ loading: false, isAuthenticated: true, role, user: userStr ? JSON.parse(userStr) : res.data?.data });
          } else {
            await AsyncStorage.multiRemove(['access_token','refresh_token','role','user']);
            setState({ loading: false, isAuthenticated: false, otpRequired: false, userIdForOtp: null });
          }
        } else {
          setState({ loading: false, isAuthenticated: false });
        }
      } catch {
        if (!cancelled) setState({ loading: false, isAuthenticated: false });
      } finally {
        clearTimeout(timer);
      }
    })();
    return () => { cancelled = true; clearTimeout(timer); };
  }, []);

  const loginUser = async (username: string, password: string) => {
    const res = await login(username, password);
    if (res.success && res.access) {
      setState(s => ({ ...s, isAuthenticated: true, role: res.role, user: res.profile, otpRequired: false, userIdForOtp: null }));
    } else if (res.success && !res.access && res.user_id) {
      setState(s => ({ ...s, isAuthenticated: false, otpRequired: true, userIdForOtp: res.user_id }));
    }
    return { success: !!res.success, message: res.message };
  };

  const logoutUser = async () => {
    await logout();
    stopProactiveRefresh();
    setState({ loading: false, isAuthenticated: false, otpRequired: false, userIdForOtp: null });
  };

  const [verifying, setVerifying] = useState(false);
  const verifyOtp = async (otp: string) => {
    if (!state.userIdForOtp) return { success: false, message: 'Missing user context' };
    setVerifying(true);
    try {
      const { success, data, message } = await verifyOTP(state.userIdForOtp, otp);
      if (!success || !data?.access) {
        return { success: false, message: message || 'Invalid OTP' };
      }
      // Tokens persisted inside verifyOTP util. Now mark authed.
      setState(s => ({ ...s, isAuthenticated: true, otpRequired: false, userIdForOtp: null, role: data.role, user: data.profile }));
      return { success: true };
    } finally {
      setVerifying(false);
    }
  };

  return <AuthContext.Provider value={{ ...state, loginUser, logoutUser, verifyOtp, verifying }}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
