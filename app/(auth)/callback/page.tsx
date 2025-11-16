'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/authStore';
import { apiClient } from '@/lib/api/client';

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const { setUser, setToken, checkAuth } = useAuthStore();

  useEffect(() => {
    // Check if token is in URL (from backend redirect)
    const token = searchParams.get('token');
    const userId = searchParams.get('user_id');
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Handle error from backend
    if (error) {
      setError(decodeURIComponent(error));
      return;
    }

    // If token is in URL, use it directly (backend redirected here)
    // SECURITY: Token in URL is a security risk, but we handle it by:
    // 1. Immediately extracting and storing it
    // 2. Removing it from URL and browser history
    if (token && userId) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Token received from URL redirect');
      }
      
      // Store token immediately
      setToken(token);
      
      // Get user info from URL params
      const email = searchParams.get('email') || '';
      const displayName = searchParams.get('display_name') || null;
      const profileImageUrl = searchParams.get('profile_image_url') || null;
      
      // Create user object from URL params
      const user = {
        id: parseInt(userId),
        oauth_provider: 'google' as const,
        oauth_email: email,
        display_name: displayName,
        profile_image_url: profileImageUrl,
        is_active: true,
        created_at: new Date().toISOString(),
      };
      
      setUser(user);
      
      // SECURITY: Remove token from URL and browser history
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('token');
      newUrl.searchParams.delete('user_id');
      newUrl.searchParams.delete('email');
      newUrl.searchParams.delete('display_name');
      newUrl.searchParams.delete('profile_image_url');
      window.history.replaceState({}, '', newUrl.toString());
      
      // Verify token is saved and redirect
      setTimeout(() => {
        const authState = useAuthStore.getState();
        
        if (authState.isAuthenticated) {
          router.push('/inbox');
        } else {
          setError('인증 상태 설정에 실패했습니다.');
        }
      }, 100);
      return;
    }

    // Handle OAuth code (if callback comes with code instead of token)
    if (code) {
      const handleCallback = async () => {
        try {
          const tokenData = await authApi.handleGoogleCallback(code);
          
          if (tokenData.access_token) {
            setToken(tokenData.access_token);
            
            if (tokenData.user) {
              setUser(tokenData.user);
            } else {
              checkAuth();
            }
            
            // Remove code from URL for security
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('code');
            newUrl.searchParams.delete('state');
            window.history.replaceState({}, '', newUrl.toString());
            
            setTimeout(() => {
              const authState = useAuthStore.getState();
              
              if (authState.isAuthenticated) {
                router.push('/inbox');
              } else {
                setError('인증 상태 설정에 실패했습니다.');
              }
            }, 300);
          } else {
            setError('토큰을 받아오지 못했습니다.');
          }
        } catch (err: any) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Callback error:', err);
          }
          setError(err.response?.data?.detail || '로그인 처리 중 오류가 발생했습니다.');
        }
      };

      handleCallback();
      return;
    }

    // No token or code
    setError('인증 정보가 없습니다.');
  }, [searchParams, router, setToken, setUser, checkAuth]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">오류 발생</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-gray-600">로그인 처리 중...</p>
      </div>
    </div>
  );
}

