'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { userProfile, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const menuItems = [
    { path: '/dashboard', label: 'لوحة التحكم', icon: '📊' },
    { path: '/transfers', label: 'التحويلات', icon: '💸' },
    { path: '/activities', label: 'النشاطات', icon: '📝' },
    ...(userProfile?.role === 'admin'
      ? [{ path: '/admin', label: 'لوحة المشرف', icon: '⚙️' }]
      : []),
  ];

  const handleMenuClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="w-72 bg-white shadow-lg h-screen flex flex-col">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-gray-800">صندوق العائلة</h2>
        <div className="mt-4">
          <p className="text-sm text-gray-600">مرحباً،</p>
          <p className="font-medium text-gray-800">{userProfile?.name}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            onClick={handleMenuClick}
            className={`flex items-center px-6 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors ${
              isActive(item.path)
                ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600'
                : ''
            }`}
          >
            <span className="ml-3 text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-6 border-t">
        <button
          onClick={async () => {
            await logout();
            if (onClose) onClose();
          }}
          className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
        >
          <span className="ml-3">🚪</span>
          <span className="font-medium">تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
}