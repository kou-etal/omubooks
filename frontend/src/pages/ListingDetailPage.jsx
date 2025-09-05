import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { axiosInstance } from '../api/axiosInstance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

/** ------------------------------------------------------
 *  1) ListingDetailPage（購入→DMへ遷移／運営の自動メッセージはサーバ側）
 *  - GET  /api/listings/:id
 *  - POST /api/trades { listing_id }
 *  - 成功時: /trades/:tradeId/messages へ遷移
 * ------------------------------------------------------ */
export function ListingDetailPage({ apiBase = '/api' }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buying, setBuying] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true); setError('');
        const res = await axiosInstance.get(`${apiBase}/listings/${id}`, { withCredentials: true });
        if (!mounted) return;
        setItem(res.data?.data || res.data);
      } catch (err) {
        console.error('detail fetch failed', err);
        setError('出品情報の取得に失敗しました。');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const images = useMemo(() => Array.isArray(item?.images) ? item.images : [], [item]);
  const mainImage = images[activeIdx] || null;
  const priceFmt = (n) => new Intl.NumberFormat('ja-JP').format(Number(n || 0));
  const canBuy = useMemo(() => !!item && (!item.status || item.status === 'active'), [item]);

  const onBuy = async () => {
    if (!item) return;
    setBuying(true);
    try {
      const res = await axiosInstance.post(`${apiBase}/trades`, { listing_id: item.id }, { withCredentials: true });
      const trade = res.data?.data || res.data;
      // サーバ側で運営の8%請求メッセージが自動送信済み（TradesController@store）
      if (trade?.id) navigate(`/trades/${trade.id}/messages`);
      else navigate('/trades');
    } catch (err) {
      console.error('purchase failed', err);
      const msg = err.response?.data?.message || '購入処理に失敗しました。';
      alert(msg);
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto mt-10 mb-16 px-6">
          <Card className="h-64 animate-pulse bg-gray-100" />
        </div>
      </AppLayout>
    );
  }

  if (error || !item) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto mt-10 mb-16 px-6 text-red-600">{error || 'データが見つかりませんでした。'}</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto mt-10 mb-20 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 画像ギャラリー */}
          <div>
            <Card className="overflow-hidden border border-blue-100">
              <div className="bg-gray-50">
                {mainImage ? (
                  <img src={mainImage} alt={item.title} className="w-full h-80 object-cover" />
                ) : (
                  <div className="w-full h-80 flex items-center justify-center text-gray-400">No Image</div>
                )}
              </div>
              {images.length > 1 && (
                <CardContent className="p-3">
                  <ul className="grid grid-cols-5 gap-2">
                    {images.map((src, i) => (
                      <li key={i}>
                        <button
                          type="button"
                          className={`block w-full h-16 rounded-md overflow-hidden border ${i===activeIdx? 'border-blue-500' : 'border-transparent'}`}
                          onClick={() => setActiveIdx(i)}
                        >
                          <img src={src} alt={`thumb-${i}`} className="w-full h-16 object-cover" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              )}
            </Card>
          </div>

          {/* 概要 + 購入 */}
          <div>
            <Card className="border border-blue-100">
              <CardContent className="p-6 space-y-4">
                <h1 className="text-2xl font-bold text-blue-900">{item.title}</h1>
                <div className="text-sm text-gray-600">講義名：{item.course_name}</div>
                <div className="text-2xl font-extrabold">¥ {priceFmt(item.price)}</div>

                {item.seller && (
                  <div className="mt-2 flex items-center gap-3 p-3 rounded-lg bg-blue-50">
                    <img
                      src={item.seller.avatar_url || item.seller.profile_image || 'https://placehold.co/48x48?text=%20'}
                      alt="avatar"
                      className="w-12 h-12 rounded-full object-cover border"
                    />
                    <div className="text-sm">
                      <div className="font-semibold text-blue-900">{item.seller.name}</div>
                      <div className="text-gray-600">取引 {item.seller.deals_count ?? 0}・評価 {item.seller.rating_avg ?? 0}</div>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <Button className="w-full bg-blue-700 hover:bg-blue-800" disabled={!canBuy || buying} onClick={onBuy}>
                    {canBuy ? (buying ? '購入処理中...' : '購入してDMへ進む') : '購入不可'}
                  </Button>
                  {!canBuy && (<div className="text-xs text-gray-500 mt-2">この商品は現在購入できません。</div>)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 下段：説明 */}
        <div className="mt-8">
          <Card className="border border-blue-100">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-3 text-blue-900">説明</h2>
              {item.description ? (
                <p className="leading-7 text-gray-800 whitespace-pre-wrap">{item.description}</p>
              ) : (
                <p className="text-gray-500">説明はありません。</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
