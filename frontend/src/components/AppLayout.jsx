import React from 'react';
import AppHeader from './AppHeader';
import Footer from './Footer';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ヘッダー */}
      <AppHeader />

      {/* メイン */}
      <main className="flex-1 pt-20 md:pt-24 px-4 sm:px-6 md:px-8">
        {children}
      </main>

      {/* フッター */}
      <Footer />
    </div>
  );
}
