import { apiClient } from './client';
import { Email, PaginatedResponse } from '@/types';

export const emailApi = {
  // 이메일 목록 가져오기
  // GET /api/v1/email?page=1&page_size=20&status=pending
  getEmails: async (params?: {
    page?: number;
    page_size?: number;
    status?: string;
    is_read?: boolean;
    is_important?: boolean;
    is_deleted?: boolean;
    search?: string;
    account_id?: string;  // 암호화된 ID
  }): Promise<PaginatedResponse<Email>> => {
    const response = await apiClient.instance.get('/email', { params });
    return response.data;
  },

  // 이메일 상세 정보 가져오기
  // GET /api/v1/email/{email_id}?include_deleted=true
  getEmailById: async (id: string, includeDeleted: boolean = false): Promise<Email> => {
    const params = includeDeleted ? { include_deleted: true } : {};
    const response = await apiClient.instance.get(`/email/${id}`, { params });
    return response.data;
  },

  // 이메일 요약 가져오기
  // GET /api/v1/email/{email_id}/summary
  getEmailSummary: async (id: string): Promise<string> => {
    const response = await apiClient.instance.get(`/email/${id}/summary`);
    return response.data.summary || '';
  },

  // 이메일 읽음 처리
  // PATCH /api/v1/email/{id}/read?read=true
  markAsRead: async (id: string, read: boolean = true): Promise<void> => {
    await apiClient.instance.patch(`/email/${id}/read`, null, {
      params: { read },
    });
  },

  // 이메일 중요 표시
  // PATCH /api/v1/email/{id}/important?important=true
  markAsImportant: async (id: string, important: boolean = true): Promise<void> => {
    await apiClient.instance.patch(`/email/${id}/important`, null, {
      params: { important },
    });
  },

  // 이메일 삭제
  // DELETE /api/v1/email/{id}
  deleteEmail: async (id: string): Promise<void> => {
    await apiClient.instance.delete(`/email/${id}`);
  },

  // 이메일 아카이브
  // PATCH /api/v1/email/{id}/archive?archived=true
  archiveEmail: async (id: string, archived: boolean = true): Promise<void> => {
    await apiClient.instance.patch(`/email/${id}/archive`, null, {
      params: { archived },
    });
  },

  // 이메일 동기화 (수동 트리거)
  // POST /api/v1/email/ingest?account_id=xxx (optional)
  syncEmails: async (accountId?: string): Promise<{ message: string; triggered_count?: number; accounts?: any[] }> => {
    const params = accountId ? { account_id: accountId } : {};
    const response = await apiClient.instance.post('/email/ingest', null, { params });
    return response.data;
  },

  // 첨부파일 다운로드
  // GET /api/v1/email/{email_id}/attachments/{index}
  downloadAttachment: async (emailId: string, attachmentIndex: number, filename: string): Promise<void> => {
    const response = await apiClient.instance.get(
      `/email/${emailId}/attachments/${attachmentIndex}`,
      {
        responseType: 'blob', // Blob으로 받아서 파일 다운로드 처리
      }
    );
    
    // Blob을 다운로드 링크로 변환하여 다운로드
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

