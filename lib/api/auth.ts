import { apiClient } from './client';
import { User, AuthToken } from '@/types';

export const authApi = {
  // Google 로그인 - 백엔드가 RedirectResponse를 반환하므로 직접 리다이렉트
  // GET /api/v1/auth/google/login
  getGoogleLoginUrl: async (): Promise<void> => {
    // 백엔드가 RedirectResponse를 반환하므로 직접 URL로 이동
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    window.location.href = `${apiUrl}/api/v1/auth/google/login`;
  },

  // Google 로그인 콜백 처리
  // GET /api/v1/auth/google/callback?code=xxx
  handleGoogleCallback: async (code: string, state?: string): Promise<AuthToken> => {
    const response = await apiClient.instance.get('/auth/google/callback', {
      params: { code, state },
    });
    return response.data;
  },

  // 현재 사용자 정보 가져오기 - 백엔드에 엔드포인트 없음 (구현 필요)
  // 임시로 콜백에서 받은 user 정보 사용
  getCurrentUser: async (): Promise<User> => {
    // 백엔드에 /auth/me 엔드포인트가 없으므로 에러 처리
    throw new Error('getCurrentUser endpoint not implemented in backend');
  },

  // 로그아웃 - 백엔드에 엔드포인트 없음 (클라이언트에서만 처리)
  logout: async (): Promise<void> => {
    // 백엔드에 로그아웃 엔드포인트가 없으므로 클라이언트에서만 처리
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
  },
};

