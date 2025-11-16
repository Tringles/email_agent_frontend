'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { emailApi } from '@/lib/api/email';
import { EmailCard } from '@/components/email/EmailCard';
import { useState } from 'react';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<string>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['search', query, page, filter],
    queryFn: () =>
      emailApi.getEmails({
        page,
        page_size: 20,
        search: query,
        ...(filter !== 'all' && { status: filter }),
      }),
    enabled: !!query,
  });

  const filters = [
    { id: 'all', label: '전체' },
    { id: 'title', label: '제목' },
    { id: 'body', label: '본문' },
    { id: 'sender', label: '발신자' },
    { id: 'summary', label: 'AI 요약' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        🔍 검색: &quot;{query}&quot;
      </h1>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
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
        {data && (
          <p className="text-sm text-gray-600">결과: {data.total}건</p>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      )}

      {data && (
        <>
          <div className="bg-white rounded-lg border border-gray-200">
            {data.items.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                검색 결과가 없습니다.
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

