'use client';

import { useState } from 'react';
import { Email } from '@/types';
import { Star, Paperclip, Clock, Mail, Sparkles, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import Link from 'next/link';
import { agentApi } from '@/lib/api/agent';
import { useQueryClient } from '@tanstack/react-query';

interface EmailCardProps {
  email: Email;
}

export function EmailCard({ email }: EmailCardProps) {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const getStatusBadge = () => {
    switch (email.status) {
      case 'processing':
        return (
          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
            ⏳ AI 처리 중
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
            PENDING
          </span>
        );
      case 'processed':
        return null;
      default:
        return null;
    }
  };

  const handleProcessAI = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isProcessing || email.status === 'processing') return;
    
    setIsProcessing(true);
    try {
      const result = await agentApi.processEmail(email.id, true); // 비동기 모드로 처리
      if (result.success) {
        // 데이터 새로고침
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['emails'] });
        }, 2000);
      }
    } catch (error: any) {
      console.error('AI processing error:', error);
      alert(error.response?.data?.detail || error.message || 'AI 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getImportanceBadge = () => {
    if (email.is_important) {
      return (
        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full flex items-center gap-1">
          <Star className="w-3 h-3 fill-current" />
          중요
        </span>
      );
    }
    return null;
  };

  // 날짜 파싱 및 유효성 검사
  const parseEmailDate = (dateStr: string | null | undefined): Date => {
    if (!dateStr) {
      return new Date(); // 날짜가 없으면 현재 시간 사용
    }
    
    const date = new Date(dateStr);
    
    // 유효하지 않은 날짜인지 확인 (1970년 이전이거나 2100년 이후)
    if (isNaN(date.getTime()) || date.getFullYear() < 1970 || date.getFullYear() > 2100) {
      console.warn(`Invalid email date: ${dateStr}, using current date`);
      return new Date(); // 유효하지 않은 날짜면 현재 시간 사용
    }
    
    return date;
  };

  const timeAgo = formatDistanceToNow(parseEmailDate(email.email_date), {
    addSuffix: true,
    locale: ko,
  });

  // 삭제된 이메일인 경우 URL에 쿼리 파라미터 추가
  const emailUrl = email.is_deleted 
    ? `/email/${email.id}?include_deleted=true`
    : `/email/${email.id}`;

  return (
    <Link href={emailUrl}>
      <div
        className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
          !email.is_read ? 'bg-blue-50' : ''
        } ${email.is_deleted ? 'opacity-60' : ''}`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">
              {email.sender[0]?.toUpperCase() || '?'}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {!email.is_read && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
              <span className="text-sm font-medium text-gray-900 truncate">
                {email.sender}
              </span>
              {getImportanceBadge()}
              {getStatusBadge()}
              {/* AI 처리 버튼 */}
              {email.status !== 'processing' && (
                <button
                  onClick={handleProcessAI}
                  disabled={isProcessing}
                  className="ml-auto p-1.5 text-primary-500 hover:bg-primary-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title={email.is_processed ? 'AI 재처리' : 'AI 처리'}
                >
                  {isProcessing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
              {email.subject || '(제목 없음)'}
            </h3>
            {email.summary && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                📝 {email.summary}
              </p>
            )}
            {!email.summary && email.body_text && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {email.body_text.substring(0, 100)}...
              </p>
            )}
            {email.classification?.tags && email.classification.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {email.classification.tags.slice(0, 3).map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-1.5 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {email.classification.tags.length > 3 && (
                  <span className="px-1.5 py-0.5 text-xs text-gray-500">
                    +{email.classification.tags.length - 3}
                  </span>
                )}
              </div>
            )}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo}
              </div>
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {email.provider_type === 'gmail' ? 'Gmail' : email.provider_type === 'naver' ? 'Naver' : 'Unknown'}
              </div>
              {email.has_attachments && (
                <div className="flex items-center gap-1">
                  <Paperclip className="w-3 h-3" />
                  {email.attachment_count}개
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

