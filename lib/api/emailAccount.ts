import { apiClient } from './client';
import { EmailAccount } from '@/types';

export const emailAccountApi = {
  // Gmail 계정 연결 URL 가져오기
  // GET /api/v1/auth/email-accounts/gmail/connect
  // 백엔드가 redirect_url을 JSON으로 반환하므로 그 URL로 리다이렉트
  getGmailConnectUrl: async (): Promise<void> => {
    const response = await apiClient.instance.get('/auth/email-accounts/gmail/connect');
    const redirectUrl = response.data.redirect_url;
    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      throw new Error('Failed to get Gmail connect URL');
    }
  },

  // Gmail 계정 연결 콜백 처리
  // GET /api/v1/auth/email-accounts/gmail/callback?code=xxx&state=user_id
  handleGmailCallback: async (code: string, state: string): Promise<EmailAccount> => {
    const response = await apiClient.instance.get('/auth/email-accounts/gmail/callback', {
      params: { code, state },
    });
    // 백엔드 응답: {email_account_id, email, message}
    // EmailAccount 형태로 변환 필요
    return {
      id: response.data.email_account_id,
      user_id: parseInt(state), // state에서 user_id 추출
      provider_type: 'gmail',
      email_address: response.data.email,
      is_active: true,
      last_fetch_at: null,
      fetch_interval: 300, // 기본값
      created_at: new Date().toISOString(),
    };
  },

  // 연결된 계정 목록 가져오기
  // GET /api/v1/auth/email-accounts
  getAccounts: async (): Promise<EmailAccount[]> => {
    const response = await apiClient.instance.get('/auth/email-accounts');
    return response.data;
  },

  // 계정 연결 해제 - 백엔드에 엔드포인트 없음 (구현 필요)
  // DELETE /api/v1/email-accounts/{id} (구현 필요)
  disconnectAccount: async (id: string): Promise<void> => {
    // 백엔드에 엔드포인트가 없으므로 에러 처리
    throw new Error('disconnectAccount endpoint not implemented in backend');
  },

  // Naver 계정 연결
  // POST /api/v1/auth/email-accounts/naver/connect
  connectNaverAccount: async (email: string, password: string): Promise<EmailAccount> => {
    const response = await apiClient.instance.post('/auth/email-accounts/naver/connect', {
      email,
      password,
    });
    // 백엔드 응답: {email_account_id, email, message}
    // EmailAccount 형태로 변환
    return {
      id: response.data.email_account_id,
      user_id: 0, // Will be set from current user
      provider_type: 'naver',
      email_address: response.data.email,
      is_active: true,
      last_fetch_at: null,
      fetch_interval: 300,
      created_at: new Date().toISOString(),
    };
  },

  // 계정 동기화 설정 업데이트 - 백엔드에 엔드포인트 없음 (구현 필요)
  // PATCH /api/v1/email-accounts/{id} (구현 필요)
  updateAccountSettings: async (
    id: string,
    settings: { fetch_interval?: number; is_active?: boolean }
  ): Promise<EmailAccount> => {
    // 백엔드에 엔드포인트가 없으므로 에러 처리
    throw new Error('updateAccountSettings endpoint not implemented in backend');
  },
};

