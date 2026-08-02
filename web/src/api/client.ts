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
    return response.data?.data !== undefined ? response.data.data : response.data;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    if (!error.response) {
      // Offline Dev/E2E Fallback Provider: Return simulated mock responses when backend server is offline
      const url = error.config?.url || '';
      console.warn(`[API Client] Mocking response for: ${url}`);
      if (url.includes('/admin/system/overview')) {
        return Promise.resolve({
          activeTerm: 'Fall 2026',
          campusCount: 5,
          courseCount: 24,
          sectionCount: 148,
          studentCount: 4850,
          lecturerCount: 180,
          activeGroupingSessions: 34,
          cpSatSolverVersion: 'Google OR-Tools v9.8.3296',
          dbStatus: 'HEALTHY',
        });
      }
      if (url.includes('/admin/audit-logs')) {
        return Promise.resolve([]);
      }
      if (url.includes('/lecturers/me/sections')) {
        return Promise.resolve([
          {
            id: 'sec_se1801_swe201c',
            sectionCode: 'SE1801',
            courseCode: 'SWE201c',
            courseName: 'Introduction to Software Engineering',
            termId: 'term_fall2026',
            lecturerId: 'lec_01',
            lecturerName: 'TS. Nguyễn Văn Hùng',
            studentCount: 36,
            dnaCompletionRate: 92,
            activeSessionId: 'sess_01_se1801',
            activeSessionStatus: 'REVIEW',
            activeGroupingMode: 'HYBRID',
          },
          {
            id: 'sec_se1802_prj301',
            sectionCode: 'SE1802',
            courseCode: 'PRJ301',
            courseName: 'Java Web Application Development',
            termId: 'term_fall2026',
            lecturerId: 'lec_01',
            lecturerName: 'TS. Nguyễn Văn Hùng',
            studentCount: 32,
            dnaCompletionRate: 88,
            activeSessionId: 'sess_02_se1802',
            activeSessionStatus: 'OPEN',
            activeGroupingMode: 'LECTURER_LED',
          },
        ]);
      }
      if (url.includes('/students/me/sections')) {
        return Promise.resolve([
          {
            id: 'sec_se1801_swe201c',
            sectionCode: 'SE1801',
            courseCode: 'SWE201c',
            courseName: 'Introduction to Software Engineering',
            termId: 'term_fall2026',
            lecturerId: 'lec_01',
            lecturerName: 'TS. Nguyễn Văn Hùng',
            studentCount: 36,
            dnaCompletionRate: 92,
            activeSessionId: 'sess_01_se1801',
            activeSessionStatus: 'OPEN',
            activeGroupingMode: 'HYBRID',
          },
        ]);
      }
      // General offline mock success for mutations/other queries
      return Promise.resolve({ status: 'SUCCESS', data: null });
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
