import { apiClient } from './client';

export interface UserRule {
  id: number;
  user_id: number;
  rule_name: string;
  rule_type: 'similarity_based' | 'metadata_based' | 'classification_based';
  action: 'delete' | 'archive' | 'tag' | 'move' | 'mark_read' | 'mark_important';
  is_active: boolean;
  reference_email_id?: number;
  similarity_threshold?: number;
  sender_filter?: string;
  sender_pattern?: string;
  subject_keywords?: string[];
  subject_pattern?: string;
  category_filter?: string;
  importance_level_filter?: string;
  folder_filter?: string;
  has_attachments_filter?: boolean;
  classification_category?: string;
  classification_tags?: string[];
  action_details?: Record<string, any>;
  priority: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRuleRequest {
  rule_name: string;
  rule_type: 'similarity_based' | 'metadata_based' | 'classification_based';
  action: 'delete' | 'archive' | 'tag' | 'move' | 'mark_read' | 'mark_important';
  description?: string;
  priority?: number;
  reference_email_id?: number;
  similarity_threshold?: number;
  sender_filter?: string;
  sender_pattern?: string;
  subject_keywords?: string[];
  subject_pattern?: string;
  category_filter?: string;
  importance_level_filter?: string;
  folder_filter?: string;
  has_attachments_filter?: boolean;
  classification_category?: string;
  classification_tags?: string[];
  action_details?: Record<string, any>;
}

export interface CreateRuleFromEmailRequest {
  rule_name: string;
  action: 'delete' | 'archive' | 'tag' | 'move' | 'mark_read' | 'mark_important';
  similarity_threshold?: number;
  description?: string;
  priority?: number;
  action_details?: Record<string, any>;
}

export interface UpdateRuleRequest {
  rule_name?: string;
  rule_type?: 'similarity_based' | 'metadata_based' | 'classification_based';
  action?: 'delete' | 'archive' | 'tag' | 'move' | 'mark_read' | 'mark_important';
  is_active?: boolean;
  description?: string;
  priority?: number;
  reference_email_id?: number;
  similarity_threshold?: number;
  sender_filter?: string;
  sender_pattern?: string;
  subject_keywords?: string[];
  subject_pattern?: string;
  category_filter?: string;
  importance_level_filter?: string;
  folder_filter?: string;
  has_attachments_filter?: boolean;
  classification_category?: string;
  classification_tags?: string[];
  action_details?: Record<string, any>;
}

export const rulesApi = {
  // 규칙 목록 조회
  getRules: async (params?: {
    is_active?: boolean;
    rule_type?: 'similarity_based' | 'metadata_based' | 'classification_based';
  }): Promise<UserRule[]> => {
    const response = await apiClient.instance.get<UserRule[]>('/rules', {
      params,
    });
    return response.data;
  },

  // 규칙 상세 조회
  getRule: async (ruleId: number): Promise<UserRule> => {
    const response = await apiClient.instance.get<UserRule>(`/rules/${ruleId}`);
    return response.data;
  },

  // 규칙 생성
  createRule: async (ruleData: CreateRuleRequest): Promise<UserRule> => {
    const response = await apiClient.instance.post<UserRule>('/rules', ruleData);
    return response.data;
  },

  // 이메일로부터 규칙 생성 (similarity-based)
  createRuleFromEmail: async (
    emailId: string,
    ruleData: CreateRuleFromEmailRequest
  ): Promise<UserRule> => {
    const response = await apiClient.instance.post<UserRule>(
      `/rules/from-email/${emailId}`,
      ruleData
    );
    return response.data;
  },

  // 규칙 수정
  updateRule: async (
    ruleId: number,
    ruleData: UpdateRuleRequest
  ): Promise<UserRule> => {
    const response = await apiClient.instance.put<UserRule>(
      `/rules/${ruleId}`,
      ruleData
    );
    return response.data;
  },

  // 규칙 삭제
  deleteRule: async (ruleId: number): Promise<void> => {
    await apiClient.instance.delete(`/rules/${ruleId}`);
  },

  // 규칙 활성화/비활성화 토글
  toggleRuleActive: async (ruleId: number): Promise<UserRule> => {
    const response = await apiClient.instance.post<UserRule>(
      `/rules/${ruleId}/toggle`
    );
    return response.data;
  },
};

