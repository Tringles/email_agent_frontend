import { apiClient } from './client';
import { AIProcessingStats, ProcessingEmail } from '@/types';

export interface ProcessEmailResponse {
  success: boolean;
  email_id: string;
  task_id?: string;
  completed_nodes?: string[];
  errors?: Array<{ node: string; error: string; timestamp: string }>;
  summary?: string;
  importance_level?: string;
  classification?: {
    category: string;
    tags: string[];
  };
  status: 'processing' | 'completed' | 'failed';
  message?: string;
}

export interface ProcessEmailsBatchResponse {
  success: boolean;
  message: string;
  tasks?: Array<{ email_id: string; task_id: string }>;
  results?: Array<{
    email_id: string;
    success: boolean;
    completed_nodes?: string[];
    errors?: Array<{ node: string; error: string; timestamp: string }>;
    summary?: string;
    importance_level?: string;
    error?: string;
  }>;
  total: number;
  success_count?: number;
  failed_count?: number;
  status: 'processing' | 'completed';
}

export const agentApi = {
  // 단일 이메일 AI 처리
  // POST /api/v1/agent/process?email_id=xxx&async_mode=false
  processEmail: async (
    emailId: string,
    asyncMode: boolean = false
  ): Promise<ProcessEmailResponse> => {
    const response = await apiClient.instance.post<ProcessEmailResponse>(
      '/agent/process',
      null,
      {
        params: {
          email_id: emailId,
          async_mode: asyncMode,
        },
      }
    );
    return response.data;
  },

  // 여러 이메일 일괄 처리
  // POST /api/v1/agent/process/batch
  processEmailsBatch: async (
    emailIds: string[],
    asyncMode: boolean = false
  ): Promise<ProcessEmailsBatchResponse> => {
    const response = await apiClient.instance.post<ProcessEmailsBatchResponse>(
      '/agent/process/batch',
      {
        email_ids: emailIds,
        async_mode: asyncMode,
      }
    );
    return response.data;
  },

  // AI Agent 실행 (하위 호환용, deprecated)
  // POST /api/v1/agent/run?email_id=xxx
  runAgent: async (emailId?: string): Promise<void> => {
    if (!emailId) {
      throw new Error('email_id is required');
    }
    const params = { email_id: emailId };
    await apiClient.instance.post('/agent/run', null, { params });
  },

  // AI 처리 통계 가져오기
  // GET /api/v1/agent/stats
  getProcessingStats: async (): Promise<AIProcessingStats> => {
    const response = await apiClient.instance.get<AIProcessingStats>('/agent/stats');
    return response.data;
  },

  // 처리 중인 이메일 목록
  // GET /api/v1/agent/processing
  getProcessingEmails: async (): Promise<ProcessingEmail[]> => {
    const response = await apiClient.instance.get<ProcessingEmail[]>('/agent/processing');
    return response.data;
  },

  // 대기 중인 이메일 목록
  // GET /api/v1/agent/pending
  getPendingEmails: async (): Promise<ProcessingEmail[]> => {
    const response = await apiClient.instance.get<ProcessingEmail[]>('/agent/pending');
    return response.data;
  },
};

