'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { agentApi } from '@/lib/api/agent';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { RefreshCw } from 'lucide-react';

export default function AIProcessingPage() {
  const queryClient = useQueryClient();
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['aiStats'],
    queryFn: () => agentApi.getProcessingStats(),
    refetchInterval: 5000,
  });

  const { data: processing = [], isLoading: processingLoading } = useQuery({
    queryKey: ['processingEmails'],
    queryFn: () => agentApi.getProcessingEmails(),
    refetchInterval: 5000,
  });

  const { data: pending = [], isLoading: pendingLoading } = useQuery({
    queryKey: ['pendingEmails'],
    queryFn: () => agentApi.getPendingEmails(),
    refetchInterval: 5000,
  });

  const handleProcessNow = async (emailId: string) => {
    try {
      await agentApi.processEmail(emailId, false); // 동기 처리
      // Refetch after processing
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['aiStats'] });
        queryClient.invalidateQueries({ queryKey: ['processingEmails'] });
        queryClient.invalidateQueries({ queryKey: ['pendingEmails'] });
      }, 1000);
    } catch (error: any) {
      console.error('Process error:', error);
      alert(error.response?.data?.detail || error.message || '처리 시작에 실패했습니다.');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">🤖 AI 처리 상태</h1>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          <RefreshCw className="w-4 h-4" />
          전체 새로고침
        </button>
      </div>

      {statsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        stats && (
          <>
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">전체 통계</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {stats.processed}
                  </div>
                  <div className="text-sm text-gray-600">처리됨</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    {stats.processing}
                  </div>
                  <div className="text-sm text-gray-600">처리 중</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-gray-600 mb-2">
                    {stats.pending}
                  </div>
                  <div className="text-sm text-gray-600">대기 중</div>
                </div>
              </div>
            </div>

            {processingLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
              </div>
            ) : (
              processing && processing.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">처리 중인 이메일</h2>
                  <div className="space-y-3">
                    {processing.map((email) => (
                      <div
                        key={email.id}
                        className="bg-white border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">
                              📧 {email.subject}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              From: {email.sender}
                            </p>
                            <p className="text-sm text-yellow-600">
                              상태: ⏳ {email.current_step || '처리 중...'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              시작: {formatDistanceToNow(new Date(email.started_at), {
                                addSuffix: true,
                                locale: ko,
                              })}
                            </p>
                          </div>
                          <button className="text-sm text-primary-600 hover:text-primary-700">
                            상세 보기
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}

            {pendingLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
              </div>
            ) : (
              pending && pending.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    대기 중인 이메일 (PENDING)
                  </h2>
                  <div className="space-y-3">
                    {pending.map((email) => (
                      <div
                        key={email.id}
                        className="bg-white border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">
                              📧 {email.subject}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              From: {email.sender}
                            </p>
                            <p className="text-sm text-gray-500">
                              상태: ⏸️ 처리 대기 중
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              수집: {formatDistanceToNow(new Date(email.started_at), {
                                addSuffix: true,
                                locale: ko,
                              })}
                            </p>
                          </div>
                          <button
                            onClick={() => handleProcessNow(email.id)}
                            className="px-3 py-1 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                          >
                            지금 처리
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </>
        )
      )}
    </div>
  );
}

