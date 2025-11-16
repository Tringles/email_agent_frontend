'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { User, Mail, Bot, Bell, Shield, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">⚙️ 설정</h1>

      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">👤 프로필</h2>
          </div>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium text-gray-700">이름:</span>{' '}
              {user?.display_name || 'N/A'}
            </p>
            <p>
              <span className="font-medium text-gray-700">이메일:</span>{' '}
              {user?.oauth_email}
            </p>
            <p>
              <span className="font-medium text-gray-700">로그인:</span>{' '}
              {user?.oauth_provider === 'google' ? 'Google' : 'Naver'}
            </p>
          </div>
          <button className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            프로필 수정
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">📧 이메일 계정</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">연결된 계정을 관리합니다.</p>
          <Link
            href="/settings/accounts"
            className="inline-block px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            계정 관리
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bot className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">🤖 AI 설정</h2>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm text-gray-700">자동 요약 활성화</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm text-gray-700">중요도 자동 분류</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm text-gray-700">자동 액션 실행</span>
            </label>
          </div>
          <Link
            href="/settings/rules"
            className="inline-block mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            규칙 관리
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">🔔 알림 설정</h2>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm text-gray-700">중요 이메일 알림</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm text-gray-700">AI 처리 완료 알림</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-sm text-gray-700">일반 이메일 알림</span>
            </label>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">🔒 보안</h2>
          </div>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
              비밀번호 변경 (SSO 사용 시 비활성화)
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
              2단계 인증
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
              로그인 기록
            </button>
          </div>
        </div>

        <div className="bg-white border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Trash2 className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold text-red-600">🗑️ 계정 삭제</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
          </p>
          <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
            계정 삭제
          </button>
        </div>
      </div>
    </div>
  );
}

