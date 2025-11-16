'use client';

import { Inbox, Star, Folder, Bot, Settings, Shield } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/inbox', icon: Inbox, label: 'Inbox' },
  { href: '/important', icon: Star, label: 'Important' },
  { href: '/folders', icon: Folder, label: 'Folders' },
  { href: '/ai/processing', icon: Bot, label: 'AI Processing' },
  { href: '/settings/rules', icon: Shield, label: '스마트 필터' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 h-full">
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Settings는 정확히 /settings일 때만 활성화 (하위 경로 제외)
            let isActive: boolean;
            if (item.href === '/settings') {
              isActive = pathname === '/settings';
            } else {
              isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            }
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

