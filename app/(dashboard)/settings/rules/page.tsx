'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { rulesApi, UserRule } from '@/lib/api/rules';
import { Trash2, Edit, ToggleLeft, ToggleRight, Plus, Loader2, Shield, X } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function RulesPage() {
  const queryClient = useQueryClient();
  const [editingRule, setEditingRule] = useState<UserRule | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const [filterType, setFilterType] = useState<string | undefined>(undefined);

  const { data: rules, isLoading } = useQuery({
    queryKey: ['rules', filterActive, filterType],
    queryFn: () => rulesApi.getRules({
      is_active: filterActive,
      rule_type: filterType as any,
    }),
  });

  const handleToggleActive = async (ruleId: number) => {
    try {
      await rulesApi.toggleRuleActive(ruleId);
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    } catch (error: any) {
      console.error('Error toggling rule:', error);
      alert(error.response?.data?.detail || error.message || '규칙 상태 변경 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (ruleId: number) => {
    if (!confirm('이 규칙을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await rulesApi.deleteRule(ruleId);
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      alert('규칙이 삭제되었습니다.');
    } catch (error: any) {
      console.error('Error deleting rule:', error);
      alert(error.response?.data?.detail || error.message || '규칙 삭제 중 오류가 발생했습니다.');
    }
  };

  const clearFilters = () => {
    setFilterActive(undefined);
    setFilterType(undefined);
  };

  const getRuleTypeLabel = (type: string) => {
    switch (type) {
      case 'similarity_based':
        return '유사도 기반';
      case 'metadata_based':
        return '메타데이터 기반';
      case 'classification_based':
        return '분류 기반';
      default:
        return type;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'delete':
        return '삭제';
      case 'archive':
        return '아카이브';
      case 'tag':
        return '태그';
      case 'move':
        return '이동';
      case 'mark_read':
        return '읽음 표시';
      case 'mark_important':
        return '중요 표시';
      default:
        return action;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">스마트 필터 규칙</h1>
          <p className="text-sm text-gray-600 mt-1">
            유사한 메일을 자동으로 차단하고 처리하는 스마트 필터 규칙을 관리합니다.
          </p>
        </div>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          규칙 생성
        </button>
      </div>

      {/* 필터 옵션 */}
      <div className="mb-4 flex items-center gap-4 bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">상태:</label>
          <select
            value={filterActive === undefined ? 'all' : filterActive ? 'active' : 'inactive'}
            onChange={(e) => {
              const value = e.target.value;
              setFilterActive(value === 'all' ? undefined : value === 'active');
            }}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">전체</option>
            <option value="active">활성화</option>
            <option value="inactive">비활성화</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">타입:</label>
          <select
            value={filterType || 'all'}
            onChange={(e) => setFilterType(e.target.value === 'all' ? undefined : e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">전체</option>
            <option value="similarity_based">유사도 기반</option>
            <option value="metadata_based">메타데이터 기반</option>
            <option value="classification_based">분류 기반</option>
          </select>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-sm text-gray-600">
            총 {rules?.length || 0}개의 규칙
          </span>
          {(filterActive !== undefined || filterType !== undefined) && (
            <button
              onClick={clearFilters}
              className="text-sm text-primary-600 hover:text-primary-700 underline"
            >
              필터 초기화
            </button>
          )}
        </div>
      </div>

      {rules && rules.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">등록된 스마트 필터 규칙이 없습니다.</p>
          <p className="text-sm text-gray-500">
            이메일 상세 페이지에서 "유사 메일 차단" 버튼을 사용하여 규칙을 생성할 수 있습니다.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {rules?.map((rule) => (
            <div
              key={rule.id}
              className={`bg-white rounded-lg border p-6 ${
                rule.is_active ? 'border-gray-200' : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{rule.rule_name}</h3>
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                      {getRuleTypeLabel(rule.rule_type)}
                    </span>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                      {getActionLabel(rule.action)}
                    </span>
                    {!rule.is_active && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded-full">
                        비활성화
                      </span>
                    )}
                  </div>

                  {rule.description && (
                    <p className="text-sm text-gray-600 mb-3">{rule.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    {rule.rule_type === 'similarity_based' && (
                      <>
                        {rule.reference_email_id && (
                          <div>
                            <span className="font-medium">예시 이메일 ID:</span>{' '}
                            {rule.reference_email_id}
                          </div>
                        )}
                        {rule.similarity_threshold !== undefined && (
                          <div>
                            <span className="font-medium">유사도 임계값:</span>{' '}
                            {rule.similarity_threshold.toFixed(2)}
                          </div>
                        )}
                      </>
                    )}

                    {rule.rule_type === 'metadata_based' && (
                      <>
                        {rule.sender_filter && (
                          <div>
                            <span className="font-medium">발신자:</span> {rule.sender_filter}
                          </div>
                        )}
                        {rule.subject_keywords && rule.subject_keywords.length > 0 && (
                          <div>
                            <span className="font-medium">제목 키워드:</span>{' '}
                            {rule.subject_keywords.join(', ')}
                          </div>
                        )}
                        {rule.category_filter && (
                          <div>
                            <span className="font-medium">카테고리:</span> {rule.category_filter}
                          </div>
                        )}
                      </>
                    )}

                    {rule.rule_type === 'classification_based' && (
                      <>
                        {rule.classification_category && (
                          <div>
                            <span className="font-medium">카테고리:</span>{' '}
                            {rule.classification_category}
                          </div>
                        )}
                        {rule.classification_tags && rule.classification_tags.length > 0 && (
                          <div>
                            <span className="font-medium">태그:</span>{' '}
                            {rule.classification_tags.join(', ')}
                          </div>
                        )}
                      </>
                    )}

                    <div>
                      <span className="font-medium">우선순위:</span> {rule.priority}
                    </div>
                    <div>
                      <span className="font-medium">생성일:</span>{' '}
                      {format(new Date(rule.created_at), 'yyyy-MM-dd HH:mm', { locale: ko })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleToggleActive(rule.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title={rule.is_active ? '비활성화' : '활성화'}
                  >
                    {rule.is_active ? (
                      <ToggleRight className="w-5 h-5 text-green-500" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => setEditingRule(rule)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="수정"
                  >
                    <Edit className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(rule.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="삭제"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 규칙 생성 다이얼로그 */}
      {showCreateDialog && (
        <CreateRuleDialog
          onClose={() => setShowCreateDialog(false)}
          onSuccess={() => {
            setShowCreateDialog(false);
            queryClient.invalidateQueries({ queryKey: ['rules'] });
          }}
        />
      )}
    </div>
  );
}

// 규칙 생성 다이얼로그 컴포넌트
function CreateRuleDialog({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [ruleType, setRuleType] = useState<'similarity_based' | 'metadata_based' | 'classification_based'>('metadata_based');
  const [ruleName, setRuleName] = useState('');
  const [action, setAction] = useState<'delete' | 'archive' | 'tag' | 'move' | 'mark_read' | 'mark_important'>('delete');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(100);
  const [isCreating, setIsCreating] = useState(false);

  // Similarity-based fields
  const [referenceEmailId, setReferenceEmailId] = useState('');
  const [similarityThreshold, setSimilarityThreshold] = useState(0.3);

  // Metadata-based fields
  const [senderFilter, setSenderFilter] = useState('');
  const [senderPattern, setSenderPattern] = useState('');
  const [subjectKeywords, setSubjectKeywords] = useState('');
  const [subjectPattern, setSubjectPattern] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [importanceLevelFilter, setImportanceLevelFilter] = useState('');
  const [folderFilter, setFolderFilter] = useState('');
  const [hasAttachmentsFilter, setHasAttachmentsFilter] = useState<boolean | undefined>(undefined);

  // Classification-based fields
  const [classificationCategory, setClassificationCategory] = useState('');
  const [classificationTags, setClassificationTags] = useState('');

  const handleSubmit = async () => {
    if (!ruleName.trim()) {
      alert('규칙 이름을 입력해주세요.');
      return;
    }

    // 타입별 필수 필드 검증
    if (ruleType === 'similarity_based') {
      if (!referenceEmailId.trim()) {
        alert('예시 이메일 ID를 입력해주세요.');
        return;
      }
    } else if (ruleType === 'metadata_based') {
      if (!senderFilter && !senderPattern && !subjectKeywords && !subjectPattern && !categoryFilter && !importanceLevelFilter && !folderFilter && hasAttachmentsFilter === undefined) {
        alert('최소 하나 이상의 메타데이터 필터를 입력해주세요.');
        return;
      }
    } else if (ruleType === 'classification_based') {
      if (!classificationCategory && !classificationTags.trim()) {
        alert('분류 카테고리 또는 태그를 입력해주세요.');
        return;
      }
    }

    setIsCreating(true);
    try {
      const ruleData: any = {
        rule_name: ruleName,
        rule_type: ruleType,
        action: action,
        description: description || undefined,
        priority: priority,
      };

      if (ruleType === 'similarity_based') {
        ruleData.reference_email_id = parseInt(referenceEmailId);
        ruleData.similarity_threshold = similarityThreshold;
      } else if (ruleType === 'metadata_based') {
        if (senderFilter) ruleData.sender_filter = senderFilter;
        if (senderPattern) ruleData.sender_pattern = senderPattern;
        if (subjectKeywords) ruleData.subject_keywords = subjectKeywords.split(',').map(s => s.trim()).filter(s => s);
        if (subjectPattern) ruleData.subject_pattern = subjectPattern;
        if (categoryFilter) ruleData.category_filter = categoryFilter;
        if (importanceLevelFilter) ruleData.importance_level_filter = importanceLevelFilter;
        if (folderFilter) ruleData.folder_filter = folderFilter;
        if (hasAttachmentsFilter !== undefined) ruleData.has_attachments_filter = hasAttachmentsFilter;
      } else if (ruleType === 'classification_based') {
        if (classificationCategory) ruleData.classification_category = classificationCategory;
        if (classificationTags) ruleData.classification_tags = classificationTags.split(',').map(s => s.trim()).filter(s => s);
      }

      await rulesApi.createRule(ruleData);
      alert('규칙이 생성되었습니다.');
      onSuccess();
    } catch (error: any) {
      console.error('Error creating rule:', error);
      alert(error.response?.data?.detail || error.message || '규칙 생성 중 오류가 발생했습니다.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">스마트 필터 규칙 생성</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* 규칙 타입 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              규칙 타입 <span className="text-red-500">*</span>
            </label>
            <select
              value={ruleType}
              onChange={(e) => setRuleType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="metadata_based">메타데이터 기반</option>
              <option value="classification_based">분류 기반</option>
              <option value="similarity_based">유사도 기반</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {ruleType === 'metadata_based' && '발신자, 제목, 카테고리 등 메타데이터로 필터링'}
              {ruleType === 'classification_based' && 'AI 분류 결과(카테고리, 태그)로 필터링'}
              {ruleType === 'similarity_based' && 'Vector DB 유사도 검색으로 필터링 (예시 이메일 필요)'}
            </p>
          </div>

          {/* 공통 필드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              규칙 이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              placeholder="예: 스팸 메일 차단"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              액션 <span className="text-red-500">*</span>
            </label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="delete">삭제</option>
              <option value="archive">아카이브</option>
              <option value="tag">태그</option>
              <option value="move">이동</option>
              <option value="mark_read">읽음 표시</option>
              <option value="mark_important">중요 표시</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="규칙에 대한 설명을 입력하세요"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              우선순위 (낮을수록 우선)
            </label>
            <input
              type="number"
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value) || 100)}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Similarity-based fields */}
          {ruleType === 'similarity_based' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  예시 이메일 ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={referenceEmailId}
                  onChange={(e) => setReferenceEmailId(e.target.value)}
                  placeholder="예시 이메일의 데이터베이스 ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  이메일 상세 페이지에서 "유사 메일 차단" 버튼을 사용하는 것을 권장합니다.
                </p>
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
              </div>
            </>
          )}

          {/* Metadata-based fields */}
          {ruleType === 'metadata_based' && (
            <>
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">메타데이터 필터</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      발신자 (정확 일치)
                    </label>
                    <input
                      type="text"
                      value={senderFilter}
                      onChange={(e) => setSenderFilter(e.target.value)}
                      placeholder="예: spam@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      발신자 패턴 (정규식)
                    </label>
                    <input
                      type="text"
                      value={senderPattern}
                      onChange={(e) => setSenderPattern(e.target.value)}
                      placeholder="예: .*@spam\\.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      제목 키워드 (쉼표로 구분)
                    </label>
                    <input
                      type="text"
                      value={subjectKeywords}
                      onChange={(e) => setSubjectKeywords(e.target.value)}
                      placeholder="예: 광고, 할인, 이벤트"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      제목 패턴 (정규식)
                    </label>
                    <input
                      type="text"
                      value={subjectPattern}
                      onChange={(e) => setSubjectPattern(e.target.value)}
                      placeholder="예: .*광고.*"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      카테고리
                    </label>
                    <input
                      type="text"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      placeholder="예: newsletter, spam"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      중요도 레벨
                    </label>
                    <select
                      value={importanceLevelFilter}
                      onChange={(e) => setImportanceLevelFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">선택 안 함</option>
                      <option value="low">낮음</option>
                      <option value="medium">보통</option>
                      <option value="high">높음</option>
                      <option value="urgent">긴급</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      폴더
                    </label>
                    <input
                      type="text"
                      value={folderFilter}
                      onChange={(e) => setFolderFilter(e.target.value)}
                      placeholder="예: Spam, Trash"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      첨부파일 여부
                    </label>
                    <select
                      value={hasAttachmentsFilter === undefined ? '' : hasAttachmentsFilter ? 'true' : 'false'}
                      onChange={(e) => setHasAttachmentsFilter(e.target.value === '' ? undefined : e.target.value === 'true')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">선택 안 함</option>
                      <option value="true">있음</option>
                      <option value="false">없음</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Classification-based fields */}
          {ruleType === 'classification_based' && (
            <>
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">분류 필터</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      분류 카테고리
                    </label>
                    <input
                      type="text"
                      value={classificationCategory}
                      onChange={(e) => setClassificationCategory(e.target.value)}
                      placeholder="예: newsletter, spam, work"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      분류 태그 (쉼표로 구분)
                    </label>
                    <input
                      type="text"
                      value={classificationTags}
                      onChange={(e) => setClassificationTags(e.target.value)}
                      placeholder="예: 광고, 뉴스레터, 알림"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={isCreating}
            className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCreating ? (
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
  );
}

