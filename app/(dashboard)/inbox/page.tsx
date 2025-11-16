'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { emailApi } from '@/lib/api/email';
import { EmailCard } from '@/components/email/EmailCard';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function InboxPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['emails', page, filter, searchQuery],
    queryFn: async () => {
      try {
        const params: any = {
          page,
          page_size: 20,
        };

        // Apply filters
        if (filter === 'unread') {
          params.is_read = false;
        } else if (filter === 'important') {
          params.is_important = true;
        } else if (filter === 'deleted') {
          params.is_deleted = true;
        } else if (filter !== 'all') {
          params.status = filter;
        }

        // Apply search
        if (searchQuery) {
          params.search = searchQuery;
        }

        return await emailApi.getEmails(params);
      } catch (err: any) {
        console.error('Error fetching emails:', err);
        throw err;
      }
    },
  });

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await emailApi.syncEmails();
      alert('이메일 동기화가 시작되었습니다. 잠시 후 새로고침해주세요.');
      // 잠시 후 이메일 목록 새로고침
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['emails'] });
      }, 2000);
    } catch (error: any) {
      console.error('Sync error:', error);
      alert(error.response?.data?.detail || '이메일 동기화에 실패했습니다.');
    } finally {
      setIsSyncing(false);
    }
  };

  const filters = [
    { id: 'all', label: '전체' },
    { id: 'unread', label: '읽지 않음' },
    { id: 'important', label: '중요' },
    { id: 'processed', label: 'AI 처리됨' },
    { id: 'pending', label: '미처리' },
    { id: 'deleted', label: '삭제됨' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">📧 Inbox</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
              />
            </div>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? '동기화 중...' : '동기화'}
            </button>
            <button
              onClick={() => router.push('/settings/accounts')}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              계정 연결
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-red-600">이메일을 불러오는 중 오류가 발생했습니다.</p>
        </div>
      )}

      {data && (
        <>
          <div className="bg-white rounded-lg border border-gray-200">
            {data.items.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                이메일이 없습니다.
              </div>
            ) : (
              data.items.map((email) => <EmailCard key={email.id} email={email} />)
            )}
          </div>

          {data.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                이전
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                {page} / {data.total_pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                disabled={page === data.total_pages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

