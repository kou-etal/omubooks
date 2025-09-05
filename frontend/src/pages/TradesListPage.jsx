import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { axiosInstance } from '../api/axiosInstance'; // ← API呼び出し用
import AppLayout  from '../components/AppLayout';  // ← Appレイアウト
import { Card, CardContent } from '@/components/ui/card'; // shadcn/ui のCard
import { Button } from '@/components/ui/button'; // shadcn/ui のButton

export function TradesListPage({ apiBase = '/api' }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true); setError('');
        const res = await axiosInstance.get(`${apiBase}/trades`, { withCredentials: true });
        if (!mounted) return;
        setItems(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (err) {
        console.error('trades fetch failed', err);
        setError('取引一覧の取得に失敗しました。');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const priceFmt = (n) => new Intl.NumberFormat('ja-JP').format(Number(n || 0));

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto mt-10 mb-20 px-6">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-900">取引一覧</h1>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <Card key={i} className="h-56 animate-pulse bg-gray-100" />)}
          </div>
        ) : error ? (
          <div className="text-red-600 text-sm">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-gray-600 text-sm">取引はありません。</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((t) => (
              <Card key={t.id} className="overflow-hidden border border-blue-100">
                <div className="h-36 bg-gray-50">
                  {t.listing?.images?.length ? (
                    <img src={t.listing.images[0]} alt={t.listing.title} className="w-full h-36 object-cover" />
                  ) : (
                    <div className="w-full h-36 flex items-center justify-center text-gray-400 text-sm">No Image</div>
                  )}
                </div>
                <CardContent className="p-4 space-y-1">
                  <div className="text-sm font-semibold text-blue-900 line-clamp-2">{t.listing?.title}</div>
                  <div className="text-xs text-gray-600">¥ {priceFmt(t.price)} / {t.status}</div>
                  <div className="pt-2">
                    <Link to={`/trades/${t.id}/messages`} className="block">
                      <Button className="w-full bg-blue-700 hover:bg-blue-800">DMを開く</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}


