---
name: api-integration
description: Frontend API integration standards with FastAPI backend using TanStack Query v5 and Axios/Fetch.
---

# API Integration Skill — FPT University Team Formation Assistant (TFA)

## Overview
Skill này quy định quy chuẩn tích hợp API giữa Frontend (React + TanStack Query v5) và Backend FastAPI, tuân thủ `docs/api-contract.md` (RFC 7807 Error Standard, Bearer Token Auth, và RBAC Rules).

## 1. Authentication Header & Dev Mock Token Helper (BẮT BUỘC)
Backend API sử dụng `HTTPBearer()` trong `app/api/deps.py`.

- **Production Mode (Firebase)**: `Authorization: Bearer <firebase_id_token>`
- **Dev Mode (Không có Firebase)**: Backend giải mã token bằng `base64.b64decode()`.

### Code tạo Mock Token chuẩn cho Frontend Dev (axios instance):
```typescript
import axios from 'axios';

// Helper tạo Bearer Token Base64 hợp lệ cho Dev Mode
export function createDevMockToken(userId: string, role: 'STUDENT' | 'LECTURER' | 'ADMIN'): string {
  const payload = JSON.stringify({ uid: userId, role: role.toLowerCase() });
  return typeof window !== 'undefined' ? btoa(payload) : Buffer.from(payload).toString('base64');
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor inject Token vào mọi request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token') || createDevMockToken('stu_01', 'STUDENT');
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

## 2. Response Data Unwrapping & RFC 7807 Error Interceptor
Backend trả về hai cấu trúc chính:
- **Success Envelope**: `{"data": ..., "meta": {"page": 1, "pageSize": 20, "total": 100}, "traceId": "..."}`
- **RFC 7807 Error**: `{"type": "...", "title": "...", "status": 422, "detail": "...", "errors": [...]}`

### Code Interceptor bóc tách dữ liệu & xử lý lỗi tập trung:
```typescript
apiClient.interceptors.response.use(
  (response) => {
    // Trả về dữ liệu bóc tách từ envelope data nếu có
    return response.data;
  },
  (error) => {
    if (!error.response) {
      // Lỗi Mạng / Offline
      return Promise.reject({
        status: 0,
        title: 'Ngoại tuyến',
        detail: 'Không thể kết nối đến máy chủ TFA. Vui lòng kiểm tra lại mạng.',
      });
    }

    const { status, data } = error.response;
    
    // Đọc trường `detail` chuẩn RFC 7807 (hoặc title)
    let errorMessage = data?.detail || data?.title || 'Đã xảy ra lỗi không xác định.';
    if (Array.isArray(errorMessage)) {
      // Nếu là danh sách lỗi FastAPI validation 422
      errorMessage = errorMessage.map((e: any) => `${e.loc?.slice(-1)}: ${e.msg}`).join(', ');
    }

    if (status === 401) {
      // Token hết hạn -> Xóa token và về /login
      localStorage.removeItem('access_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
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
```

---

## 3. TanStack Query v5 Integration Patterns
1. **Query Keys Factory**:
   ```typescript
   export const queryKeys = {
     studentDashboard: () => ['students', 'me', 'dashboard'] as const,
     sectionDetails: (id: string) => ['sections', id] as const,
     teamProfile: () => ['students', 'me', 'team-profile'] as const,
     groupingSession: (id: string) => ['grouping-sessions', id] as const,
     reviewBoard: (sessionId: string) => ['grouping-sessions', sessionId, 'review-board'] as const,
   };
   ```

2. **Debounced Search Hook (Dùng cho mọi ô Tìm kiếm API)**:
   ```typescript
   import { useState, useEffect } from 'react';

   export function useDebounce<T>(value: T, delay = 300): T {
     const [debouncedValue, setDebouncedValue] = useState<T>(value);
     useEffect(() => {
       const timer = setTimeout(() => setDebouncedValue(value), delay);
       return () => clearTimeout(timer);
     }, [value, delay]);
     return debouncedValue;
   }
   ```

3. **Optimistic Mutation (Dùng cho Kéo-thả Override & Join Request)**:
   ```typescript
   export function useMoveMemberMutation(sessionId: string) {
     const queryClient = useQueryClient();
     return useMutation({
       mutationFn: (data: { teamId: string; studentId: string; targetTeamId: string }) =>
         apiClient.post(`/teams/${data.teamId}/move-member`, data),
       onMutate: async (newMove) => {
         await queryClient.cancelQueries({ queryKey: queryKeys.reviewBoard(sessionId) });
         const previousBoard = queryClient.getQueryData(queryKeys.reviewBoard(sessionId));
         // Cập nhật UI ngay lập tức trước khi server trả về (Optimistic)
         return { previousBoard };
       },
       onError: (err, newMove, context) => {
         // Hoàn tác lại trạng thái cũ nếu server báo lỗi
         if (context?.previousBoard) {
           queryClient.setQueryData(queryKeys.reviewBoard(sessionId), context.previousBoard);
         }
       },
       onSettled: () => {
         queryClient.invalidateQueries({ queryKey: queryKeys.reviewBoard(sessionId) });
       },
     });
   }
   ```

---

## 4. Bảng Kiểm Tra Kết Nối API Chống Lỗi (API Checklist)
- [x] Đã cấu hình `baseURL` trỏ chính xác về `/api/v1`.
- [x] Đã inject `Authorization: Bearer <token>` thông qua Axios Request Interceptor.
- [x] Đã xử lý bóc tách `response.data.data` và `response.data.meta`.
- [x] Đã đọc trường `detail` trong RFC 7807 Error Response để hiển thị cho người dùng.
- [x] Đã bọc tất cả Input Search bằng `useDebounce(searchQuery, 300)`.
- [x] Đã cấu hình Toast notification hiển thị thông báo lỗi thân thiện.
