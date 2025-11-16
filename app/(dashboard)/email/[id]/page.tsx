'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { emailApi } from '@/lib/api/email';
import { agentApi } from '@/lib/api/agent';
import { rulesApi } from '@/lib/api/rules';
import { Star, Trash2, Archive, ArrowLeft, Download, Sparkles, Loader2, Shield, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function EmailDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;  // 이미 암호화된 ID (string)
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const includeDeleted = searchParams.get('include_deleted') === 'true';
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCreateRuleDialog, setShowCreateRuleDialog] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [similarityThreshold, setSimilarityThreshold] = useState(0.3);
  const [isCreatingRule, setIsCreatingRule] = useState(false);

  const { data: email, isLoading } = useQuery({
    queryKey: ['email', id, includeDeleted],
    queryFn: () => emailApi.getEmailById(id, includeDeleted),  // string 그대로 전달
    enabled: !!id,
  });

  // Mark email as read when viewing (backend automatically marks as read)
  // Invalidate email list query to update read status in inbox
  useEffect(() => {
    if (email && !email.is_read) {
      // Backend automatically marks as read when fetching email
      // Invalidate email list to refresh the inbox
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    }
  }, [email, queryClient]);

  const handleProcessAI = async (asyncMode: boolean = false) => {
    if (!email) return;
    
    setIsProcessing(true);
    try {
      const result = await agentApi.processEmail(email.id, asyncMode);
      
      if (asyncMode) {
        // 비동기 모드: 백그라운드 처리 시작
        alert('AI 처리가 백그라운드에서 시작되었습니다. 잠시 후 새로고침해주세요.');
        // 3초 후 자동 새로고침
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['email', id] });
          queryClient.invalidateQueries({ queryKey: ['emails'] });
        }, 3000);
      } else {
        // 동기 모드: 즉시 결과 반환
        if (result.success) {
          alert('AI 처리가 완료되었습니다.');
          // 데이터 새로고침
          queryClient.invalidateQueries({ queryKey: ['email', id] });
          queryClient.invalidateQueries({ queryKey: ['emails'] });
        } else {
          alert(`AI 처리 중 오류가 발생했습니다: ${result.errors?.map(e => e.error).join(', ') || '알 수 없는 오류'}`);
        }
      }
    } catch (error: any) {
      console.error('AI processing error:', error);
      alert(error.response?.data?.detail || error.message || 'AI 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateRule = async () => {
    if (!email || !ruleName.trim()) {
      alert('규칙 이름을 입력해주세요.');
      return;
    }

    // 이메일이 AI 처리되어야 Vector DB에 저장됨
    if (!email.vector_db_id) {
      const shouldProcess = confirm(
        '이 이메일이 아직 AI 처리되지 않았습니다. 스마트 필터 규칙을 생성하려면 먼저 AI 처리가 필요합니다.\n\nAI 처리를 진행하시겠습니까?'
      );
      if (shouldProcess) {
        await handleProcessAI(false);
        // AI 처리 후 다시 시도
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['email', id] });
          setTimeout(() => handleCreateRule(), 1000);
        }, 2000);
        return;
      }
      return;
    }

    setIsCreatingRule(true);
    try {
      await rulesApi.createRuleFromEmail(email.id, {
        rule_name: ruleName,
        action: 'delete',
        similarity_threshold: similarityThreshold,
        description: `이 이메일과 유사한 이메일을 자동 삭제하는 규칙`,
      });

      alert('스마트 필터 규칙이 생성되었습니다. 앞으로 이와 유사한 메일은 자동으로 차단됩니다.');
      setShowCreateRuleDialog(false);
      setRuleName('');
      setSimilarityThreshold(0.3);
    } catch (error: any) {
      console.error('Rule creation error:', error);
      alert(error.response?.data?.detail || error.message || '규칙 생성 중 오류가 발생했습니다.');
    } finally {
      setIsCreatingRule(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">이메일을 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          뒤로
        </button>
        <div className="flex items-center gap-2">
          {/* 유사 메일 차단 버튼 */}
          {email.is_processed && email.vector_db_id && (
            <button
              onClick={() => setShowCreateRuleDialog(true)}
              className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              title="유사한 메일을 자동으로 차단하는 규칙 생성"
            >
              <Shield className="w-4 h-4" />
              <span>유사 메일 차단</span>
            </button>
          )}
          {/* AI 처리 버튼 */}
          {email.status !== 'processing' && (
            <button
              onClick={() => handleProcessAI(false)}
              disabled={isProcessing}
              className="flex items-center gap-2 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title={email.is_processed ? 'AI 재처리' : 'AI 처리'}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>처리 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{email.is_processed ? 'AI 재처리' : 'AI 처리'}</span>
                </>
              )}
            </button>
          )}
          {email.status === 'processing' && (
            <div className="flex items-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>AI 처리 중...</span>
            </div>
          )}
          <button
            onClick={async () => {
              try {
                await emailApi.markAsImportant(email.id, !email.is_important);
                // Refetch email data
                window.location.reload();
              } catch (err) {
                console.error('Error marking email as important:', err);
              }
            }}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Star className={`w-5 h-5 ${email.is_important ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
          </button>
          <button
            onClick={async () => {
              try {
                await emailApi.archiveEmail(email.id, !email.is_archived);
                // Refetch email data
                window.location.reload();
              } catch (err) {
                console.error('Error archiving email:', err);
              }
            }}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Archive className={`w-5 h-5 ${email.is_archived ? 'text-blue-500' : 'text-gray-400'}`} />
          </button>
          <button
            onClick={async () => {
              if (confirm('이메일을 삭제하시겠습니까?')) {
                try {
                  await emailApi.deleteEmail(email.id);
                  router.push('/inbox');
                } catch (err) {
                  console.error('Error deleting email:', err);
                }
              }
            }}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Trash2 className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{email.subject || '(제목 없음)'}</h1>
          <div className="space-y-2 text-sm text-gray-600">
            <p><span className="font-medium">From:</span> {email.sender}</p>
            <p><span className="font-medium">To:</span> {email.recipient}</p>
            <p><span className="font-medium">Date:</span> {
              email.email_date && !isNaN(new Date(email.email_date).getTime()) && 
              new Date(email.email_date).getFullYear() >= 1970 && 
              new Date(email.email_date).getFullYear() <= 2100
                ? format(new Date(email.email_date), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })
                : '날짜 정보 없음'
            }</p>
            <p><span className="font-medium">Account:</span> Gmail</p>
          </div>
        </div>

        {email.has_attachments && email.attachments && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">📎 첨부파일 ({email.attachment_count})</h3>
            <div className="space-y-2">
              {email.attachments.map((attachment, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-white rounded">
                  <span className="text-sm text-gray-700">{attachment.filename}</span>
                  <button
                    onClick={async () => {
                      try {
                        await emailApi.downloadAttachment(email.id, idx, attachment.filename);
                      } catch (err) {
                        console.error('Error downloading attachment:', err);
                        alert('첨부파일 다운로드 중 오류가 발생했습니다.');
                      }
                    }}
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    다운로드
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {email.is_processed && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">🤖 AI 분석 결과</h3>
            {email.summary && (
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-1">📝 요약:</p>
                <p className="text-sm text-gray-600">{email.summary}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {email.importance_level && (
                <div>
                  <span className="font-medium text-gray-700">⭐ 중요도:</span>
                  <span className="ml-2 text-gray-600">
                    {email.importance_level} {email.importance_score && `(${email.importance_score.toFixed(2)})`}
                  </span>
                </div>
              )}
              {email.classification && (
                <>
                  <div>
                    <span className="font-medium text-gray-700">🏷️ 분류:</span>
                    <span className="ml-2 text-gray-600">{email.classification.category || 'N/A'}</span>
                  </div>
                  {email.classification.tags && email.classification.tags.length > 0 && (
                    <div className="col-span-2">
                      <span className="font-medium text-gray-700">🏷️ 태그:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {email.classification.tags.map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              {email.sentiment && (
                <div>
                  <span className="font-medium text-gray-700">😊 감정:</span>
                  <span className="ml-2 text-gray-600">{email.sentiment}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="prose max-w-none">
          <h3 className="text-lg font-medium text-gray-900 mb-3">이메일 본문</h3>
          {email.body_html ? (
            <div
              dangerouslySetInnerHTML={{ __html: email.body_html }}
              className="text-gray-700"
            />
          ) : (
            <pre className="whitespace-pre-wrap text-gray-700 font-sans">{email.body_text}</pre>
          )}
        </div>
      </div>

      {/* 규칙 생성 다이얼로그 */}
      {showCreateRuleDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">스마트 필터 규칙 생성</h2>
              <button
                onClick={() => setShowCreateRuleDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  규칙 이름
                </label>
                <input
                  type="text"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="예: 스팸 메일 삭제"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  유사도 임계값: {similarityThreshold.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={similarityThreshold}
                  onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>낮음 (더 유사한 메일만)</span>
                  <span>높음 (덜 유사한 메일도 포함)</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  이 값보다 유사한 메일이 자동으로 차단됩니다. (낮을수록 더 유사한 메일만 차단)
                </p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>참고:</strong> 이 이메일과 유사한 메일이 자동으로 차단됩니다.
                  규칙은 즉시 활성화되며, 언제든지 규칙 관리 페이지에서 수정하거나 비활성화할 수 있습니다.
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowCreateRuleDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleCreateRule}
                disabled={isCreatingRule || !ruleName.trim()}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCreatingRule ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    생성 중...
                  </>
                ) : (
                  '규칙 생성'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

