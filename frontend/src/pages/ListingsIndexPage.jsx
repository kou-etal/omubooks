import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { axiosInstance } from '../api/axiosInstance';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AppLayout from '../components/AppLayout';

const SUBJECTS = [
  { value: '', label: 'すべて' },
  { value: 'liberal_arts', label: '一般教養' },
  { value: 'basic_education', label: '基礎教育科目' },
  { value: 'specialized', label: '専門科目' },
  { value: 'other', label: 'その他' },
  { value: 'none', label: 'なし' },
];

const FIELDS = [
  { value: '', label: 'すべて' },
  { value: 'math', label: '数学' },
  { value: 'physics', label: '物理' },
  { value: 'chemistry', label: '化学' },
  { value: 'biology', label: '生物' },
  { value: 'english', label: '英語' },
  { value: 'other', label: 'その他' },
  { value: 'none', label: 'なし' },
];

const FACULTIES = [
  { value: '', label: 'すべて' },
  { value: 'modern_system_science', label: '現代システム科学' },
  { value: 'law', label: '法学部' },
  { value: 'commerce', label: '商学部' },
  { value: 'engineering', label: '工学部' },
  { value: 'veterinary', label: '獣医学部' },
  { value: 'medicine', label: '医学部' },
  { value: 'human_life_science', label: '生活科学部' },
  { value: 'letters', label: '文学部' },
  { value: 'economics', label: '経済学部' },
  { value: 'science', label: '理学部' },
  { value: 'agriculture', label: '農学部' },
  { value: 'nursing', label: '看護学部' },
  { value: 'other', label: 'その他' },
  { value: 'none', label: 'なし' },
];

function TagBadge({ children }) {
  return (
    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-black text-white">
      {children}
    </span>
  );
}

export default function ListingsIndexPage({ apiBase = '/api' }) {
  // 検索フォーム
  const [q, setQ] = useState('');
  const [suggests, setSuggests] = useState({ books: [], courses: [] });
  const [showSuggest, setShowSuggest] = useState(false);
  const [loadingSuggest, setLoadingSuggest] = useState(false);

  // フィルタ（各グループ1つだけ選べるチェックボックス風UI）
  const [fSubject, setFSubject] = useState('');
  const [fField, setFField] = useState('');
  const [fFaculty, setFFaculty] = useState('');
  const [fWriting, setFWriting] = useState(''); // '', '1', '0'

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

  // フィルタ変更時に自動再取得
  useEffect(() => { fetchList(1, perPage, q); /* eslint-disable-next-line */ }, [fSubject, fField, fFaculty, fWriting, perPage]);

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
      const params = {
        q: term || undefined,
        per_page: pp,
        page: p,
        // ▼ フィルタ（値が空なら送らない）
        tag_subject: fSubject || undefined,
        tag_field:   fField   || undefined,
        tag_faculty: fFaculty || undefined,
        has_writing: fWriting === '' ? undefined : fWriting,
      };
      const res = await axiosInstance.get(`${apiBase}/listings`, { params, withCredentials: true });
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
      setItems([]); setMeta({ current_page: 1, last_page: 1, total: 0 });
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

  const toggleSingle = (current, nextValue, setter) => {
    setter(current === nextValue ? '' : nextValue);
  };

  const resetFilters = () => {
    setFSubject(''); setFField(''); setFFaculty(''); setFWriting('');
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto mt-10 mb-16 px-6">
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
                      <li key={`b-${i}`} className="px-2 py-1 hover:bg-blue-50 cursor-pointer rounded-md" onClick={()=> onSelectSuggest(b)}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}
              {suggests.courses.length > 0 && (
                <div>
                  <div className="text-xs text-gray-500 px-2">講義名</div>
                  <ul>
                    {suggests.courses.map((c, i)=> (
                      <li key={`c-${i}`} className="px-2 py-1 hover:bg-blue-50 cursor-pointer rounded-md" onClick={()=> onSelectSuggest(c)}>{c}</li>
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
              onChange={(e)=> { const v = Number(e.target.value); setPerPage(v); }}
            >
              {[10,20,30,40].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        {/* 2カラム：左=フィルタ / 右=カード */}
        <div className="grid grid-cols-12 gap-6">
          {/* 左：チェックボックス縦詰み */}
          <aside className="col-span-12 md:col-span-3 lg:col-span-3">
            <Card className="border">
              <CardContent className="p-4 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-800">絞り込み</h2>
                  <button type="button" onClick={resetFilters} className="text-xs text-blue-700 hover:underline">リセット</button>
                </div>

                {/* 科目 */}
                <div>
                  <div className="text-xs text-gray-500 mb-2">科目</div>
                  <ul className="space-y-1">
                    {SUBJECTS.map(o => (
                      <li key={o.value || 'all'}>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={fSubject === o.value}
                            onChange={() => toggleSingle(fSubject, o.value, setFSubject)}
                          />
                          {o.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 分野 */}
                <div>
                  <div className="text-xs text-gray-500 mb-2">分野</div>
                  <ul className="space-y-1">
                    {FIELDS.map(o => (
                      <li key={o.value || 'all'}>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={fField === o.value}
                            onChange={() => toggleSingle(fField, o.value, setFField)}
                          />
                          {o.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 学部 */}
                <div>
                  <div className="text-xs text-gray-500 mb-2">学部</div>
                  <ul className="max-h-48 overflow-auto pr-1 space-y-1">
                    {FACULTIES.map(o => (
                      <li key={o.value || 'all'}>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={fFaculty === o.value}
                            onChange={() => toggleSingle(fFaculty, o.value, setFFaculty)}
                          />
                          {o.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 書き込み */}
                <div>
                  <div className="text-xs text-gray-500 mb-2">書き込み</div>
                  <ul className="space-y-1">
                    {[
                      { value: '', label: 'すべて' },
                      { value: '1', label: 'あり' },
                      { value: '0', label: 'なし' },
                    ].map(o => (
                      <li key={o.value || 'all'}>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={fWriting === o.value}
                            onChange={() => toggleSingle(fWriting, o.value, setFWriting)}
                          />
                          {o.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  className="w-full bg-blue-700 hover:bg-blue-800"
                  onClick={() => fetchList(1, perPage, q)}
                >
                  適用
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* 右：カードグリッド */}
          <section className="col-span-12 md:col-span-9 lg:col-span-9">
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
                {items.map((it) => {
                  const tags = it.tags || {};
                  return (
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

                        {/* テキスト部：タイトル横に黒タグ、下に価格タグ */}
                        <CardContent className="px-2 py-2">
                          {/* タイトル */}
                          <div className="text-[13px] text-black font-normal leading-tight line-clamp-2 clamp-2">
                            {it.title}
                          </div>

                          {/* タグ列（黒い小バッジ） */}
                          <div className="mt-1 flex flex-wrap gap-1">
                            {tags.subject_label && <TagBadge>{tags.subject_label}</TagBadge>}
                            {tags.field_label && <TagBadge>{tags.field_label}</TagBadge>}
                            {tags.faculty_label && <TagBadge>{tags.faculty_label}</TagBadge>}
                            {typeof tags.has_writing === 'boolean' && (
                              <TagBadge>{tags.has_writing ? '書き込みあり' : '書き込みなし'}</TagBadge>
                            )}
                          </div>

                          {/* 価格タグ */}
                          <div className="mt-1">
                            <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                              ¥ {priceFmt(it.price)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* ページネーション */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <Button variant="outline" disabled={meta.current_page <= 1}
                      onClick={() => meta.current_page > 1 && fetchList(page - 1, perPage, q)}>
                前へ
              </Button>
              <span className="text-sm text-gray-600">{meta.current_page} / {meta.last_page}</span>
              <Button variant="outline" disabled={meta.current_page >= meta.last_page}
                      onClick={() => meta.current_page < meta.last_page && fetchList(page + 1, perPage, q)}>
                次へ
              </Button>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}


