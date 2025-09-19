// src/pages/ListingEditPage.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { axiosInstance } from '../api/axiosInstance';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import AppLayout from '../components/AppLayout';

const SUBJECTS = [
  { value: 'liberal_arts', label: '一般教養' },
  { value: 'basic_education', label: '基礎教育科目' },
  { value: 'specialized', label: '専門科目' },
  { value: 'other', label: 'その他' },
  { value: 'none', label: 'なし' },
];

const FIELDS = [
  { value: 'math', label: '数学' },
  { value: 'physics', label: '物理' },
  { value: 'chemistry', label: '化学' },
  { value: 'biology', label: '生物' },
  { value: 'english', label: '英語' },
  { value: 'other', label: 'その他' },
  { value: 'none', label: 'なし' },
];

const FACULTIES = [
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

const STATUS_LABELS = { active: '公開中', draft: '下書き', hidden: '非公開', sold: '売却済' };

export default function ListingEditPage({ apiBase = '/api' }) {
  const { id } = useParams();
  const navigate = useNavigate();

  // 基本
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [initialStatus, setInitialStatus] = useState('active'); // ← 初期ステータス保持

  // タグ
  const [tagSubject, setTagSubject] = useState('none');
  const [tagField, setTagField] = useState('none');
  const [tagFaculty, setTagFaculty] = useState('none');
  const [hasWriting, setHasWriting] = useState('0'); // '1' | '0'

  // 画像
  const [images, setImages] = useState([]);               // File[]
  const [existingImages, setExistingImages] = useState([]); // string[]
  const [previews, setPreviews] = useState([]);           // objectURL[]

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [imageError, setImageError] = useState('');

  const fileInputRef = useRef(null);
  const MAX_FILES = 3;
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const ACCEPT = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  const isSold = initialStatus === 'sold';

  // 初期読込（GET）
  useEffect(() => {
    (async () => {
      try {
        setLoadingInitial(true);
        const res = await axiosInstance.get(`${apiBase}/listings/${id}`, { withCredentials: true });
        const d = res.data?.data || res.data;

        setTitle(d.title || '');
        setCourse(d.course_name || '');
        setPrice(String(d.price ?? ''));
        setDescription(d.description || '');
        setStatus(d.status || 'active');
        setInitialStatus(d.status || 'active');

        const t = d.tags || {};
        setTagSubject(t.subject ?? d.tag_subject ?? 'none');
        setTagField(t.field ?? d.tag_field ?? 'none');
        setTagFaculty(t.faculty ?? d.tag_faculty ?? 'none');
        setHasWriting((t.has_writing ?? d.has_writing) ? '1' : '0');

        setExistingImages(Array.isArray(d.images) ? d.images : []);
      } catch (e) {
        console.error(e);
        alert('出品の取得に失敗しました。');
        navigate('/listings/me');
        return;
      } finally {
        setLoadingInitial(false);
      }
    })();

    return () => previews.forEach((u) => URL.revokeObjectURL(u));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const validatePrice = (v) => {
    const n = Number(v);
    if (!v.trim()) return '必須';
    if (Number.isNaN(n) || !Number.isInteger(n)) return '整数';
    if (n < 100) return '100以上';
    if (n > 1_000_000) return '100万円以下';
    return '';
  };

  const canSubmit = useMemo(
    () => title.trim() && course.trim() && !validatePrice(price) && !submitting,
    [title, course, price, submitting]
  );

  const handleFiles = (fileList) => {
    setImageError('');
    const incoming = Array.from(fileList || []);
    const next = [];
    for (const f of incoming) {
      if (next.length >= MAX_FILES) break;
      if (!ACCEPT.includes(f.type)) { setImageError('jpg/png/webp のみ'); continue; }
      if (f.size > MAX_FILE_SIZE) { setImageError('画像は5MB以下'); continue; }
      next.push(f);
    }
    const urls = next.map((f) => URL.createObjectURL(f));
    setImages(next);
    setPreviews(urls);
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append('title', title.trim());
    fd.append('course_name', course.trim());
    fd.append('price', String(Math.floor(Number(price))));
    fd.append('description', description || '');
    // 売却済みならサーバへ常に 'sold' を送る（改ざん防止 & 一貫性）
    fd.append('status', isSold ? 'sold' : status);
    fd.append('tag_subject', tagSubject);
    fd.append('tag_field', tagField);
    fd.append('tag_faculty', tagFaculty);
    fd.append('has_writing', hasWriting);
    if (images.length > 0) images.forEach((f) => fd.append('images[]', f));
    return fd;
  };

  // 保存（POST + _method=PATCH で 405 回避）
  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      const fd = buildFormData();
      fd.append('_method', 'PATCH');
      await axiosInstance.post(`${apiBase}/listings/${id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      navigate('/listings/me');
    } catch (err) {
      if (err.response?.status === 422 && err.response.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        alert('更新に失敗しました。');
        console.error(err);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const saveLabel = useMemo(
    () => (isSold ? '保存' : `保存（${STATUS_LABELS[status] ?? status}）`),
    [isSold, status]
  );

  if (loadingInitial) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto mt-10 px-6">
          <Card className="h-64 animate-pulse bg-gray-100" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto mt-10 mb-16 px-6">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-900">出品を編集</h1>

        <Card className="shadow-md border border-blue-100">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={onSubmit} className="space-y-6" aria-label="listing edit form">
              {/* タイトル / 講義名 / 価格 */}
              <div>
                <label className="block text-sm font-medium mb-1">教科書名</label>
                <Input value={title} onChange={(e)=>setTitle(e.target.value)} required />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title[0]}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">講義名</label>
                <Input value={course} onChange={(e)=>setCourse(e.target.value)} required />
                {errors.course_name && <p className="text-red-500 text-sm mt-1">{errors.course_name[0]}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">価格（円）</label>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={100}
                  max={1000000}
                  step={100}
                  value={price}
                  onChange={(e)=>setPrice(e.target.value)}
                  required
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price[0]}</p>}
              </div>

              {/* ステータス（売却済みは固定で編集不可） */}
              <div>
                <label className="block text-sm font-medium mb-1">ステータス</label>

                {isSold ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-gray-800">
                      {STATUS_LABELS.sold}
                    </span>
                    <span className="text-xs text-gray-500">（売却済みは変更できません）</span>
                  </div>
                ) : (
                  <select
                    className="w-full border rounded-md px-3 py-2"
                    value={status}
                    onChange={(e)=>setStatus(e.target.value)}
                  >
                    {['active','draft','hidden'].map(s => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                )}

                {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status[0]}</p>}
              </div>

              {/* タグ */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">科目</label>
                  <select className="w-full border rounded-md px-3 py-2"
                          value={tagSubject} onChange={(e)=>setTagSubject(e.target.value)}>
                    {SUBJECTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  {errors.tag_subject && <p className="text-red-500 text-sm mt-1">{errors.tag_subject[0]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">分野</label>
                  <select className="w-full border rounded-md px-3 py-2"
                          value={tagField} onChange={(e)=>setTagField(e.target.value)}>
                    {FIELDS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  {errors.tag_field && <p className="text-red-500 text-sm mt-1">{errors.tag_field[0]}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">学部</label>
                  <select className="w-full border rounded-md px-3 py-2"
                          value={tagFaculty} onChange={(e)=>setTagFaculty(e.target.value)}>
                    {FACULTIES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  {errors.tag_faculty && <p className="text-red-500 text-sm mt-1">{errors.tag_faculty[0]}</p>}
                </div>
                <div className="sm:col-span-2">
                  <span className="block text-sm font-medium mb-1">書き込みの有無</span>
                  <div className="flex gap-6 items-center">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="radio" name="has_writing" value="1"
                             checked={hasWriting==='1'} onChange={()=>setHasWriting('1')} />
                      あり
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="radio" name="has_writing" value="0"
                             checked={hasWriting==='0'} onChange={()=>setHasWriting('0')} />
                      なし
                    </label>
                  </div>
                </div>
              </div>

              {/* 説明 */}
              <div>
                <label className="block text-sm font-medium mb-1">説明（任意）</label>
                <Textarea value={description} onChange={(e)=>setDescription(e.target.value)} className="h-36 resize-y" />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description[0]}</p>}
              </div>

              {/* 画像 */}
              <div>
                <label className="block text-sm font-medium mb-1">画像（最大3枚, 5MB）</label>
                {existingImages.length > 0 && (
                  <ul className="mb-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {existingImages.map((src, i)=>(
                      <li key={i}><img src={src} alt={`existing-${i}`} className="w-full h-28 object-cover rounded-lg border" /></li>
                    ))}
                  </ul>
                )}
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPT.join(',')}
                  multiple
                  onChange={(e) => handleFiles(e.target.files)}
                />
                <p className="text-xs text-gray-500 mt-1">※ 新しい画像をアップすると、既存の画像は置き換えられます。</p>
                {imageError && <p className="text-red-500 text-sm mt-1">{imageError}</p>}
                {previews.length > 0 && (
                  <ul className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {previews.map((src, i) => (
                      <li key={i}><img src={src} alt={`preview-${i}`} className="w-full h-28 object-cover rounded-lg border" /></li>
                    ))}
                  </ul>
                )}
              </div>

              {/* アクション */}
              <div className="pt-2 flex gap-3">
                <Button type="submit" className="bg-blue-700 hover:bg-blue-800" disabled={!canSubmit || submitting}>
                  {submitting ? '保存中...' : saveLabel}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/listings/me')}>
                  キャンセル
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

