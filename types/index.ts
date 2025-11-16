// User types
export interface User {
  id: number;
  oauth_provider: 'google' | 'naver';
  oauth_email: string;
  display_name: string | null;
  profile_image_url: string | null;
  is_active: boolean;
  created_at: string;
}

// Email Account types
export interface EmailAccount {
  id: string;  // 암호화된 ID
  user_id: number;
  provider_type: 'gmail' | 'naver';
  email_address: string;
  is_active: boolean;
  last_fetch_at: string | null;
  fetch_interval: number;
  created_at: string;
}

// Email types
export type EmailStatus = 'pending' | 'processing' | 'processed' | 'failed';
export type ImportanceLevel = 'low' | 'medium' | 'high' | 'urgent';

export interface Email {
  id: string;  // 암호화된 ID
  email_account_id: string;  // 암호화된 ID
  provider_type?: 'gmail' | 'naver';  // 이메일 계정의 provider 타입
  provider_message_id: string;
  subject: string;
  sender: string;
  recipient: string;
  body_text: string;
  body_html: string | null;
  email_date: string;
  attachments: Attachment[] | null;
  attachment_count: number;
  has_attachments: boolean;
  status: EmailStatus;
  is_processed: boolean;
  processed_at: string | null;
  vector_db_id: string | null;
  summary: string | null;
  importance_score: number | null;
  importance_level: ImportanceLevel | null;
  classification: Classification | null;
  sentiment: string | null;
  is_read: boolean;
  is_archived: boolean;
  is_deleted: boolean;
  is_starred: boolean;
  is_important: boolean;
  created_at: string;
}

export interface Attachment {
  attachment_id?: string;
  filename: string;
  mime_type: string;
  size: number;
}

export interface Classification {
  category?: string;
  tags?: string[];
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Auth types
export interface AuthToken {
  access_token: string;
  token_type: string;
}

// AI Processing types
export interface AIProcessingStats {
  processed: number;
  processing: number;
  pending: number;
}

export interface ProcessingEmail {
  id: string;  // 암호화된 ID
  subject: string;
  sender: string;
  status: EmailStatus;
  started_at: string;
  current_step?: string;
}

