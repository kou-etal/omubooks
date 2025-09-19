import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../api/axiosInstance';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AppLayout from '../components/AppLayout';

const STATUSES = [
  { value: 'all', label: 'すべて' },
  { value: 'active', label: '公開中' },
  { value: 'draft', label: '下書き' },
  { value: 'hidden', label: '非公開' },
  { value: 'sold', label: '売却済' },
];

function StatusBadge({ status }) {
  const map = {
    active: 'bg-green-100 text-green-800 border-green-200',
    draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    hidden: 'bg-gray-100 text-gray-700 border-gray-200',
    sold: 'bg-blue-100 text-blue-800 border-blue-200',
  };
  return (
    <span className={`inline-block text-[11px] px-2 py-0.5 rounded-full border ${map[status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
      {status === 'active' ? '公開中' :
       status === 'draft' ? '下書き' :
       status === 'hidden' ? '非公開' :
       status === 'sold' ? '売却済' : status}
    </span>
  );
}

export default function MyListingsPage({ apiBase = '/api' }) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [perPage, setPerPage] = useState(20);
  const [page, setPage] = useState(1);

  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => { fetchMyList(1, perPage, q, status); /* eslint-disable-next-line */ }, []);
  useEffect(() => { fetchMyList(1, perPage, q, status); /* eslint-disable-next-line */ }, [status, perPage]);

  const fetchMyList = async (p, pp, term, st) => {
    try {
      setLoading(true); setError('');
      const res = await axiosInstance.get(`${apiBase}/my/listings`, {
        params: {
          q: term || undefined,
          status: st || 'all',
          per_page: pp, page: p,
        },
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
    } catch (e) {
      console.error(e);
      setError('一覧の取得に失敗しました。');
      setItems([]); setMeta({ current_page: 1, last_page: 1, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    await fetchMyList(1, perPage, q, status);
    inputRef.current?.blur();
  };

  const priceFmt = (n) => new Intl.NumberFormat('ja-JP').format(Number(n || 0));
  const canPrev = meta.current_page > 1;
  const canNext = meta.current_page < meta.last_page;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto mt-10 mb-16 px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold mb-6 text-blue-900">自分の出品</h1>
          <Button className="bg-blue-700 hover:bg-blue-800" onClick={() => navigate('/listings/new')}>
            新規出品
          </Button>
        </div>

        {/* ステータスフィルタ */}
        <div className="flex flex-wrap gap-2 mb-4">
          {STATUSES.map(s => (
            <button
              key={s.value}
              type="button"
              onClick={() => setStatus(s.value)}
              className={`px-3 py-1 text-sm rounded-full border ${
                status === s.value ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-gray-700 border-gray-300'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* 検索 */}
        <form onSubmit={onSubmit} className="mb-4">
          <div className="flex gap-3">
            <Input
              ref={inputRef}
              value={q}
              onChange={(e)=> setQ(e.target.value)}
              placeholder="タイトル・講義名で検索"
            />
            <Button type="submit" variant="outline">検索</Button>
          </div>
        </form>

        <div className="text-sm text-gray-600 mb-3">全 {meta.total} 件</div>

        {/* グリッド */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="aspect-square animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : error ? (
          <div className="text-red-600 text-sm">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-gray-600 text-sm">出品がありません。</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((it) => (
              <Card key={it.id} className="overflow-hidden border">
                <div className="relative bg-gray-50 aspect-square">
                  {it.images?.length ? (
                    <img src={it.images[0]} alt={it.title} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center text-gray-400 text-sm">No Image</div>
                  )}
                  <div className="absolute top-2 left-2">
                    <StatusBadge status={it.status} />
                  </div>
                </div>
                <CardContent className="px-2 py-2">
                  <div className="text-[13px] text-black leading-tight line-clamp-2 clamp-2">{it.title}</div>
                  <div className="mt-1">
                    <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                      ¥ {priceFmt(it.price)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <Link to={`/listings/${it.id}/edit`}>
                      <Button variant="outline" className="w-full">編集</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ページネーション */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <Button variant="outline" disabled={!canPrev} onClick={() => canPrev && fetchMyList(page - 1, perPage, q, status)}>
            前へ
          </Button>
          <span className="text-sm text-gray-600">{meta.current_page} / {meta.last_page}</span>
          <Button variant="outline" disabled={!canNext} onClick={() => canNext && fetchMyList(page + 1, perPage, q, status)}>
            次へ
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
