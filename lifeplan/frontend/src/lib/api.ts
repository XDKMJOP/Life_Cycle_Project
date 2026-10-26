import { Capacitor } from '@capacitor/core';

let cachedWorkingBase: string | null = null;

export function getCandidates(): string[] {
  // 1. Custom URL explicitly configured by user (if any)
  const custom = localStorage.getItem('life_cycle_api_url');
  if (custom) return [custom.replace(/\/$/, '')];

  // 2. When running on native Android / iOS
  if (Capacitor.isNativePlatform()) {
    const list: string[] = [];
    if (import.meta.env.VITE_API_URL) {
      list.push((import.meta.env.VITE_API_URL as string).replace(/\/$/, ''));
    }
    // High-priority candidates for Android:
    // - Android Studio Emulator standard host alias (10.0.2.2 points to host PC)
    list.push('http://10.0.2.2:3000');
    // - Local PC LAN Wi-Fi IP (for physical Android phone on the same Wi-Fi)
    list.push('http://192.168.1.198:3000');
    // - Localhost fallback
    list.push('http://localhost:3000');
    return list;
  }

  // 3. Web browser (handled by Vite dev proxy or same origin)
  return ['/api'];
}

export function getApiBase(): string {
  if (cachedWorkingBase) return cachedWorkingBase;
  const candidates = getCandidates();
  return candidates[0] || '/api';
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const candidates = cachedWorkingBase ? [cachedWorkingBase, ...getCandidates().filter(c => c !== cachedWorkingBase)] : getCandidates();

  let lastError: Error | null = null;

  for (const base of candidates) {
    const url = `${base.replace(/\/$/, '')}${cleanPath}`;
    try {
      const res = await fetch(url, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...init.headers,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errMsg = (data as { error?: string }).error ?? `HTTP ${res.status}`;
        if (res.status === 401) {
          setToken(null);
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
        throw new ApiError(errMsg, res.status);
      }

      // Connection succeeded! Cache this base URL for future requests
      cachedWorkingBase = base;
      return data as T;
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        // Server replied with an explicit application error (e.g. 400, 401, 409)
        // The host is alive, so do not try fallback
        throw err;
      }
      // Network failure (connection refused / failed to fetch) -> try next candidate
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  // All candidates failed
  cachedWorkingBase = null;
  const msg = lastError?.message === 'Failed to fetch'
    ? 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบว่าเซิร์ฟเวอร์เปิดอยู่หรือตรวจสอบอินเทอร์เน็ต'
    : lastError?.message || 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้';

  throw new ApiError(msg, 0);
}
