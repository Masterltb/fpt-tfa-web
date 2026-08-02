import axios, { AxiosError, type AxiosResponse } from 'axios';
import type { ApiErrorResponse } from '../types/api';

/**
 * Helper to generate a valid Base64 Bearer Token for Local Dev Mode (without Firebase).
 * Backend app/api/deps.py decodes token via base64.b64decode() when FIREBASE_PROJECT_ID is absent.
 */
export function createDevMockToken(userId: string, role: 'STUDENT' | 'LECTURER' | 'ADMIN'): string {
  const payload = JSON.stringify({ uid: userId, role: role.toLowerCase() });
  return btoa(payload);
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject Authorization Bearer Token
apiClient.interceptors.request.use((config) => {
  const savedToken = localStorage.getItem('tfa_token');
  const activeRole = (localStorage.getItem('tfa_role') as 'STUDENT' | 'LECTURER' | 'ADMIN') || 'STUDENT';
  const activeUserId = localStorage.getItem('tfa_user_id') || 'stu_01';

  const token = savedToken || createDevMockToken(activeUserId, activeRole);
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response Interceptor: RFC 7807 Error Extraction & Envelope Unwrapping
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Unwraps success envelope data if present
    return response.data?.data !== undefined ? response.data : response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    if (!error.response) {
      return Promise.reject({
        status: 0,
        title: 'Lỗi Kết Nối Ngoại Tuyến',
        detail: 'Không thể kết nối đến máy chủ TFA Backend (port 8000). Vui lòng kiểm tra lại mạng.',
      });
    }

    const status = error.response.status;
    const data = error.response.data;

    let errorMessage = data?.detail || data?.title || 'Đã xảy ra lỗi hệ thống.';
    if (Array.isArray(errorMessage)) {
      errorMessage = (errorMessage as any[]).map((e: any) => `${e.loc?.slice(-1)}: ${e.msg}`).join(', ');
    }

    if (status === 401) {
      localStorage.removeItem('tfa_token');
    }

    return Promise.reject({
      status,
      title: data?.title || 'Lỗi Yêu Cầu',
      detail: errorMessage,
      errors: data?.errors || [],
      raw: data,
    });
  }
);
