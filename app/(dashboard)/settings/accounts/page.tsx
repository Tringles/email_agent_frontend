'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { emailAccountApi } from '@/lib/api/emailAccount';
import { useAuthStore } from '@/lib/store/authStore';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CheckCircle, XCircle, AlertCircle, Plus, Settings, Trash2 } from 'lucide-react';

export default function AccountsPage() {
  const { user } = useAuthStore();
  const [showNaverForm, setShowNaverForm] = useState(false);
  const [naverEmail, setNaverEmail] = useState('');
  const [naverPassword, setNaverPassword] = useState('');
  const [isConnectingNaver, setIsConnectingNaver] = useState(false);
  
  const { data: accounts = [], isLoading, refetch } = useQuery({
    queryKey: ['emailAccounts'],
    queryFn: async () => {
      try {
        return await emailAccountApi.getAccounts();
      } catch (error) {
        console.error('Error fetching email accounts:', error);
        return [];
      }
    },
  });

  const handleConnectGmail = async () => {
    try {
      if (!user) {
        alert('로그인이 필요합니다.');
        return;
      }
      // 백엔드가 redirect_url을 JSON으로 반환하므로 그 URL로 리다이렉트
      await emailAccountApi.getGmailConnectUrl();
    } catch (error) {
      console.error('Gmail connection error:', error);
      alert('Gmail 계정 연결에 실패했습니다.');
    }
  };

  const handleDisconnect = async (id: number) => {
    if (!confirm('정말 이 계정 연결을 해제하시겠습니까?')) return;
    
    try {
      await emailAccountApi.disconnectAccount(id);
      refetch();
    } catch (error) {
      console.error('Disconnect error:', error);
      alert('계정 연결 해제에 실패했습니다.');
    }
  };

  const handleConnectNaver = async () => {
    if (!naverEmail || !naverPassword) {
      alert('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    if (!naverEmail.includes('@naver.com')) {
      alert('네이버 이메일 주소(@naver.com)를 입력해주세요.');
      return;
    }

    setIsConnectingNaver(true);
    try {
      await emailAccountApi.connectNaverAccount(naverEmail, naverPassword);
      alert('네이버 계정이 성공적으로 연결되었습니다.');
      setShowNaverForm(false);
      setNaverEmail('');
      setNaverPassword('');
      refetch();
    } catch (error: any) {
      console.error('Naver connection error:', error);
      const errorMessage = error.response?.data?.detail || error.message || '네이버 계정 연결에 실패했습니다.';
      alert(errorMessage);
    } finally {
      setIsConnectingNaver(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">⚙️ 설정 > 이메일 계정</h1>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      )}

      {accounts && (
        <>
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">연결된 계정</h2>
            <div className="space-y-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="bg-white border border-gray-200 rounded-lg p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">📧</span>
                        <span className="text-lg font-medium text-gray-900">
                          {account.email_address}
                        </span>
                        {account.is_active ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            연결됨
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600">
                            <XCircle className="w-4 h-4" />
                            비활성
                          </span>
                        )}
                      </div>
                      <div className="ml-11 space-y-1 text-sm text-gray-600">
                        <p>
                          {account.provider_type === 'gmail' ? 'Gmail' : 'Naver'} |{' '}
                          {account.is_active ? '✅ 연결됨' : '❌ 연결 오류'}
                        </p>
                        {account.last_fetch_at && (
                          <p>
                            마지막 동기화:{' '}
                            {formatDistanceToNow(new Date(account.last_fetch_at), {
                              addSuffix: true,
                              locale: ko,
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Settings className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDisconnect(account.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">새 계정 연결</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium text-gray-900 mb-2">🔵 Gmail 계정 연결</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Google OAuth를 통해 Gmail 계정을 연결합니다
                </p>
                <button
                  onClick={handleConnectGmail}
                  className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  연결하기
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium text-gray-900 mb-2">🟢 Naver 계정 연결</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Naver IMAP을 통해 계정을 연결합니다
                </p>
                {!showNaverForm ? (
                  <button
                    onClick={() => setShowNaverForm(true)}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    연결하기
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        이메일 주소
                      </label>
                      <input
                        type="email"
                        value={naverEmail}
                        onChange={(e) => setNaverEmail(e.target.value)}
                        placeholder="example@naver.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        비밀번호
                      </label>
                      <input
                        type="password"
                        value={naverPassword}
                        onChange={(e) => setNaverPassword(e.target.value)}
                        placeholder="비밀번호 또는 앱 비밀번호"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        보안을 위해 앱 비밀번호 사용을 권장합니다
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleConnectNaver}
                        disabled={isConnectingNaver}
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isConnectingNaver ? '연결 중...' : '연결하기'}
                      </button>
                      <button
                        onClick={() => {
                          setShowNaverForm(false);
                          setNaverEmail('');
                          setNaverPassword('');
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

