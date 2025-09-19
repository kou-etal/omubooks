// src/pages/TradeReviewCreatePage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { axiosInstance } from '../api/axiosInstance';
import AppLayout from '../components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TradeReviewCreatePage({ apiBase = '/api' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trade, setTrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true); setError('');
        // 取引を取得（completed/both_completedの確認用）
        const res = await axiosInstance.get(`${apiBase}/trades/${id}`, { withCredentials: true });
        if (!mounted) return;
        setTrade(res.data?.data ?? res.data); // Resourceかどうか両対応
      } catch (err) {
        console.error('trade fetch failed', err);
        setError('取引情報の取得に失敗しました。');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

const canSubmit = !!trade?.both_completed && !trade?.i_reviewed && !posting;
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      setPosting(true); setError('');
      await axiosInstance.post(`${apiBase}/trades/${id}/reviews`, { score, comment }, { withCredentials: true });
      alert('レビューを投稿しました。相手が投稿すると公開されます。');
      navigate(`/trades/${id}/messages`);
    } catch (err) {
      console.error('review post failed', err);
      const msg = err?.response?.data?.message || 'レビューの投稿に失敗しました。';
      setError(msg);
    } finally {
      setPosting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto mt-10 mb-20 px-6">
        <h1 className="text-2xl font-bold text-blue-900 mb-4">レビューを投稿</h1>

        {loading ? (
          <Card className="h-40 animate-pulse bg-gray-100" />
        ) : error ? (
          <div className="text-red-600 text-sm">{error}</div>
        ) : (
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="text-sm text-gray-700">
                取引: #{trade?.id}（{trade?.listing?.title ?? '—'}）<br />
                進捗: 購入者{trade?.buyer_completed ? '✅' : '⬜'} / 出品者{trade?.seller_completed ? '✅' : '⬜'}
              </div>

              {!trade?.both_completed && (
                <div className="text-xs text-amber-600">
                  双方が「取引完了」を押すと評価できます。相手の完了をお待ちください。
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="text-sm block mb-1">スコア（1〜5）</label>
                  <select
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                  >
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-sm block mb-1">コメント（任意）</label>
                  <textarea
                    className="w-full border rounded px-3 py-2 text-sm min-h-[120px]"
                    maxLength={2000}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="取引の感想や相手の良かった点など"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={!canSubmit}>
                    {posting ? '送信中...' : '投稿する'}
                  </Button>
                  <Link to={`/trades/${id}/messages`}>
                    <Button type="button" variant="outline">戻る</Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
