/**
 * 共通レイアウトコンポーネント
 */

import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">
              🚃 青春18切符ランダム旅行
            </h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>
            © 2025 青春18切符ランダム旅行ジェネレーター |{' '}
            <Link to="/terms" className="text-blue-600 hover:underline">
              利用規約
            </Link>{' '}
            |{' '}
            <Link to="/privacy" className="text-blue-600 hover:underline">
              プライバシーポリシー
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
