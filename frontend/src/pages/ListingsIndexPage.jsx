import React, { useEffect, useMemo, useRef, useState } from 'react';
import { axiosInstance } from '../api/axiosInstance';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AppLayout from '../components/AppLayout';
import { useNavigate } from 'react-router-dom';

/**
 * 一覧 + 検索ページ（axios / あなたのスタイル）
 * - API: GET /api/listings?q=...&per_page=...&page=...
 * - サジェスト: GET /api/listings/suggest?q=...
 * - 詳細へ: /listings/:id
 */
export default function ListingsIndexPage({ apiBase = '/api' }) {
  const navigate = useNavigate();

  // 検索フォーム状態
  const [q, setQ] = useState('');
  const [suggests, setSuggests] = useState({ books: [], courses: [] });
  const [showSuggest, setShowSuggest] = useState(false);
  const [loadingSuggest, setLoadingSuggest] = useState(false);

  // 一覧状態
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });

  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // 初回ロード
  useEffect(() => { fetchList(1, perPage, q); }, []);

  // q変更時：サジェスト（デバウンス）
  useEffect(() => {
    if (!q || q.trim().length < 2) { setSuggests({ books: [], courses: [] }); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      getSuggest(q).catch(() => {});
    }, 250);
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [q]);

  const getSuggest = async (term) => {
    try {
      setLoadingSuggest(true);
      const res = await axiosInstance.get(`${apiBase}/listings/suggest`, {
        params: { q: term }, withCredentials: true,
      });
      setSuggests({ books: res.data.books || [], courses: res.data.courses || [] });
      setShowSuggest(true);
    } finally {
      setLoadingSuggest(false);
    }
  };

  const fetchList = async (p = 1, pp = perPage, term = q) => {
    try {
      setLoading(true); setError('');
      const res = await axiosInstance.get(`${apiBase}/listings`, {
        params: { q: term || undefined, per_page: pp, page: p }, withCredentials: true,
      });
      const data = res.data;
      setItems(Array.isArray(data?.data) ? data.data : []);
      // Laravel Resource の pagination を想定
      const m = data?.meta || {};
      setMeta({
        current_page: m.current_page ?? p,
        last_page: m.last_page ?? 1,
        total: m.total ?? (Array.isArray(data?.data) ? data.data.length : 0),
      });
      setPage(m.current_page ?? p);
    } catch (err) {
      console.error('list fetch failed', err);
      setError('一覧の取得に失敗しました。時間をおいて再度お試しください。');
      setItems([]);
      setMeta({ current_page: 1, last_page: 1, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    await fetchList(1, perPage, q);
    setShowSuggest(false);
  };

  const onSelectSuggest = (term) => {
    setQ(term);
    fetchList(1, perPage, term);
    setShowSuggest(false);
    inputRef.current?.blur();
  };

  const priceFmt = (n) => new Intl.NumberFormat('ja-JP').format(Number(n || 0));

  const canPrev = meta.current_page > 1;
  const canNext = meta.current_page < meta.last_page;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto mt-10 mb-16 px-6">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-900">教科書一覧</h1>

        {/* 検索フォーム */}
        <form onSubmit={onSubmit} className="relative mb-6">
          <div className="flex gap-3">
            <Input
              ref={inputRef}
              value={q}
              onChange={(e)=> setQ(e.target.value)}
              placeholder="教科書名・講義名で検索"
              aria-label="search listings"
            />
            <Button type="submit" className="shrink-0 bg-blue-700 hover:bg-blue-800">検索</Button>
          </div>

          {/* サジェスト */}
          {showSuggest && (suggests.books.length > 0 || suggests.courses.length > 0) && (
            <div className="absolute z-20 mt-2 w-full rounded-xl border bg-white shadow-lg p-3">
              {loadingSuggest && <div className="text-xs text-gray-500 px-2 py-1">候補を読み込み中...</div>}

              {suggests.books.length > 0 && (
                <div className="mb-2">
                  <div className="text-xs text-gray-500 px-2">教科書名</div>
                  <ul>
                    {suggests.books.map((b, i)=> (
                      <li key={`b-${i}`} className="px-2 py-1 hover:bg-blue-50 cursor-pointer rounded-md" onClick={()=> onSelectSuggest(b)}>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {suggests.courses.length > 0 && (
                <div>
                  <div className="text-xs text-gray-500 px-2">講義名</div>
                  <ul>
                    {suggests.courses.map((c, i)=> (
                      <li key={`c-${i}`} className="px-2 py-1 hover:bg-blue-50 cursor-pointer rounded-md" onClick={()=> onSelectSuggest(c)}>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </form>

        {/* 件数とページサイズ */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
          <div>全 {meta.total} 件</div>
          <div className="flex items-center gap-2">
            <span>表示件数</span>
            <select
              className="rounded-md border border-gray-300 px-2 py-1"
              value={perPage}
              onChange={(e)=> { const v = Number(e.target.value); setPerPage(v); fetchList(1, v, q); }}
            >
              {[10,20,30,40].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        {/* 一覧 */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-64 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : error ? (
          <div className="text-red-600 text-sm">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-gray-600 text-sm">該当する出品は見つかりませんでした。</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((it) => (
              <Card key={it.id} className="overflow-hidden border border-blue-100 hover:shadow-md transition">
                <div className="h-40 bg-gray-50">
                  {it.images?.length ? (
                    <img src={it.images[0]} alt={it.title} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 flex items-center justify-center text-gray-400 text-sm">No Image</div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="text-sm text-blue-900 font-semibold line-clamp-2">{it.title}</div>
                  <div className="text-xs text-gray-600 line-clamp-1 mt-1">{it.course_name}</div>
                  <div className="mt-2 font-bold text-lg">¥ {priceFmt(it.price)}</div>

                  {it.seller && (
                    <div className="mt-2 text-xs text-gray-500">
                      出品者: {it.seller.name}（取引 {it.seller.deals_count ?? 0} ）
                    </div>
                  )}

                  <div className="mt-3">
                    <Button className="w-full bg-blue-700 hover:bg-blue-800" onClick={() => navigate(`/listings/${it.id}`)}>詳細を見る</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ページネーション */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <Button variant="outline" disabled={!canPrev} onClick={() => canPrev && fetchList(page - 1, perPage, q)}>
            前へ
          </Button>
          <span className="text-sm text-gray-600">{meta.current_page} / {meta.last_page}</span>
          <Button variant="outline" disabled={!canNext} onClick={() => canNext && fetchList(page + 1, perPage, q)}>
            次へ
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
