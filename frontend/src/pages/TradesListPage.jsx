import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../api/axiosInstance';
import AppLayout from '../components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function TradesListPage({ apiBase = '/api' }) {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState('active'); // 'active' | 'history'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [postingId, setPostingId] = useState(null);
  const navigate = useNavigate();

  const fetchList = async (group = tab) => {
    setLoading(true); setError('');
    try {
      const res = await axiosInstance.get(`${apiBase}/trades`, {
        params: { status_group: group, per_page: 50 },
        withCredentials: true
      });
      setItems(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error('trades fetch failed', err);
      setError('取引一覧の取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList('active'); }, []);      // 初期は進行中
  useEffect(() => { fetchList(tab); }, [tab]);        // タブ切替で再取得

  const priceFmt = (n) => new Intl.NumberFormat('ja-JP').format(Number(n || 0));

  const onClickComplete = async (t) => {
    try {
      setPostingId(t.id);
      const res = await axiosInstance.post(`${apiBase}/trades/${t.id}/complete`, {}, { withCredentials: true });
      const updated = res?.data?.trade ?? null;
      // カード更新
      setItems((prev) => prev.map((x) => (x.id === t.id ? { ...x, ...updated } : x)));

      // completed になったら「進行中」タブからは消す
      if ((updated?.status || t.status) === 'completed' && tab === 'active') {
        setItems((prev) => prev.filter((x) => x.id !== t.id));
      }
    } catch (err) {
      console.error('complete failed', err);
      alert('取引完了フラグの設定に失敗しました。');
    } finally {
      setPostingId(null);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto mt-10 mb-20 px-6">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-900">取引一覧</h1>

        {/* タブ */}
        <div className="flex gap-2 justify-center mb-6">
          <Button variant={tab==='active'?'default':'outline'} onClick={()=>setTab('active')}>進行中</Button>
          <Button variant={tab==='history'?'default':'outline'} onClick={()=>setTab('history')}>履歴</Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <Card key={i} className="h-56 animate-pulse bg-gray-100" />)}
          </div>
        ) : error ? (
          <div className="text-red-600 text-sm">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-gray-600 text-sm text-center">
            {tab==='active' ? '進行中の取引はありません。' : '履歴はありません。'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((t) => {
              const disableComplete = t.i_completed || t.status === 'completed' || postingId === t.id;
              const canReview = !!t.both_completed && !t.i_reviewed;

              return (
                <Card key={t.id} className="overflow-hidden border border-blue-100">
                  <div className="h-36 bg-gray-50">
                    {t.listing?.images?.length ? (
                      <img src={t.listing.images[0]} alt={t.listing.title} className="w-full h-36 object-cover" />
                    ) : (
                      <div className="w-full h-36 flex items-center justify-center text-gray-400 text-sm">No Image</div>
                    )}
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <div className="text-sm font-semibold text-blue-900 line-clamp-2">{t.listing?.title}</div>
                    <div className="text-xs text-gray-600">¥ {priceFmt(t.price)} / {t.status}</div>

                    <div className="text-[11px] text-gray-500">
                      {t.campaign_message ? `🎉 ${t.campaign_message}` : null}
                      <div className="mt-1">
                        進捗: 購入者{t.buyer_completed ? '✅' : '⬜'} / 出品者{t.seller_completed ? '✅' : '⬜'}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Link to={`/trades/${t.id}/messages`} className="block">
                        <Button className="w-full bg-blue-700 hover:bg-blue-800">DMを開く</Button>
                      </Link>
                      <Button
                        className="w-full"
                        variant={t.i_completed ? 'secondary' : 'default'}
                        disabled={disableComplete}
                        onClick={() => onClickComplete(t)}
                      >
                        {t.i_completed ? '完了済み' : (postingId === t.id ? '更新中...' : '取引完了')}
                      </Button>
                    </div>

                    <Button
                      className="w-full mt-2"
                      variant="outline"
                      disabled={!canReview}
                      onClick={() => navigate(`/trades/${t.id}/review`)}
                      title={!canReview ? '双方が完了し、未レビューのときだけ評価できます' : ''}
                    >
                      評価する
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}



