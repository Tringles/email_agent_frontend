'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { emailApi } from '@/lib/api/email';
import { EmailCard } from '@/components/email/EmailCard';
import { Star } from 'lucide-react';

export default function ImportantPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['importantEmails', page],
    queryFn: () =>
      emailApi.getEmails({
        page,
        page_size: 20,
        is_important: true,
      }),
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-2">
        <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
        <h1 className="text-2xl font-bold text-gray-900">⭐ Important</h1>
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
                중요 표시된 이메일이 없습니다.
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

