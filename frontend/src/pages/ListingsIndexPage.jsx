import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { axiosInstance } from '../api/axiosInstance';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AppLayout from '../components/AppLayout';

export default function ListingsIndexPage({ apiBase = '/api' }) {
  // 検索フォーム
  const [q, setQ] = useState('');
  const [suggests, setSuggests] = useState({ books: [], courses: [] });
  const [showSuggest, setShowSuggest] = useState(false);
  const [loadingSuggest, setLoadingSuggest] = useState(false);

  // 一覧
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

  // サジェスト（デバウンス）
  useEffect(() => {
    if (!q || q.trim().length < 2) { setSuggests({ books: [], courses: [] }); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { getSuggest(q).catch(() => {}); }, 250);
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
        params: { q: term || undefined, per_page: pp, page: p },
        withCredentials: true,
      });
      const data = res.data;
      setItems(Array.isArray(data?.data) ? data.data : []);
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

        {/* 一覧（メルカリ風カード：画像→タイトル→価格タグ） */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="aspect-square animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : error ? (
          <div className="text-red-600 text-sm">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-gray-600 text-sm">該当する出品は見つかりませんでした。</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((it) => (
              <Link key={it.id} to={`/listings/${it.id}`} className="block group">
                <Card className="overflow-hidden border hover:shadow-md transition">
                  {/* 画像（正方形） */}
                  <div className="relative bg-gray-50 aspect-square">
                    {it.images?.length ? (
                      <img
                        src={it.images[0]}
                        alt={it.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        No Image
                      </div>
                    )}

                    {/* 講義名タグ（左上・黒/白文字） */}
                    {it.course_name ? (
                      <span className="absolute top-2 left-2 rounded px-1.5 py-0.5 text-[10px] font-medium bg-black text-white">
                        {it.course_name}
                      </span>
                    ) : null}
                  </div>

                  {/* テキスト部：余白最小、タイトル細字の黒、下に価格タグ */}
                  <CardContent className="">
                    {/* タイトル（2行省略） */}
                    <div className="text-[13px] text-black font-normal leading-tight line-clamp-2 clamp-2">
                      {it.title}
                    </div>

                    {/* 価格タグ（小さめのピル型） */}
                    <div className="mt-1">
                      <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                        ¥ {priceFmt(it.price)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
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

