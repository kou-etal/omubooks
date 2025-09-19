import React, { useMemo, useRef, useState, useEffect } from 'react';
import { axiosInstance } from '../api/axiosInstance';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import AppLayout from '../components/AppLayout';
import { useNavigate } from 'react-router-dom';

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

/**
 * 出品フォーム（multipart）
 * 送信: title, course_name, price, description?, images[] (<=3), tag_* , has_writing, status(active|draft)
 */
export default function ListingCreateForm({ apiBase = '/api', onCreated }) {
  const navigate = useNavigate();

  // 基本項目
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]); // File[]
  const [previews, setPreviews] = useState([]); // objectURL[]

  // タグ
  const [tagSubject, setTagSubject] = useState('none');
  const [tagField, setTagField] = useState('none');
  const [tagFaculty, setTagFaculty] = useState('none');
  const [hasWriting, setHasWriting] = useState('0'); // '1' or '0'

  // バリデーション類
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [titleError, setTitleError] = useState('');
  const [courseError, setCourseError] = useState('');
  const [priceError, setPriceError] = useState('');
  const [imageError, setImageError] = useState('');

  const fileInputRef = useRef(null);
  const MAX_FILES = 3;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ACCEPT = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  useEffect(() => {
    return () => previews.forEach((u) => URL.revokeObjectURL(u));
  }, [previews]);

  const validateTitle = (v) => {
    if (!v.trim()) return '必須項目です。';
    if (v.length > 255) return '255文字以内で入力してください。';
    return '';
  };
  const validateCourse = (v) => {
    if (!v.trim()) return '必須項目です。';
    if (v.length > 255) return '255文字以内で入力してください。';
    return '';
  };
  const validatePrice = (v) => {
    const n = Number(v);
    if (!v.trim()) return '必須項目です。';
    if (Number.isNaN(n)) return '数値を入力してください。';
    if (!Number.isInteger(n)) return '整数で入力してください。';
    if (n < 100) return '100円以上で入力してください。';
    if (n > 1_000_000) return '100万円以下で入力してください。';
    return '';
  };

  const canSubmit = useMemo(() => {
    return (
      !validateTitle(title) &&
      !validateCourse(course) &&
      !validatePrice(price) &&
      !loading
    );
  }, [title, course, price, loading]);

  const handleFiles = (fileList) => {
    const incoming = Array.from(fileList || []);
    const next = [...images];

    for (const f of incoming) {
      if (next.length >= MAX_FILES) break;
      if (!ACCEPT.includes(f.type)) {
        setImageError('画像は jpg / png / webp のみ対応です。');
        continue;
      }
      if (f.size > MAX_FILE_SIZE) {
        setImageError('画像は 5MB 以下にしてください。');
        continue;
      }
      next.push(f);
    }
    const urls = next.map((f) => URL.createObjectURL(f));
    setImages(next);
    setPreviews(urls);
  };

  const removeImage = (idx) => {
    const next = images.slice();
    next.splice(idx, 1);
    setImages(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  };

  // 共通送信関数：status = 'active' | 'draft'
  const submitListing = async (status = 'active') => {
    setErrors({});
    setImageError('');

    const tErr = validateTitle(title); setTitleError(tErr);
    const cErr = validateCourse(course); setCourseError(cErr);
    const pErr = validatePrice(price); setPriceError(pErr);
    if (tErr || cErr || pErr) return;

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', title.trim());
      fd.append('course_name', course.trim());
      fd.append('price', String(Math.floor(Number(price))));
      if (description.trim()) fd.append('description', description.trim());

      // ▼ ステータス（公開 or 下書き）
      fd.append('status', status);

      // ▼ タグ
      fd.append('tag_subject', tagSubject);
      fd.append('tag_field', tagField);
      fd.append('tag_faculty', tagFaculty);
      fd.append('has_writing', hasWriting); // '1' or '0'

      images.forEach((f) => fd.append('images[]', f));

      const res = await axiosInstance.post(`${apiBase}/listings`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      // リセット
      setTitle(''); setCourse(''); setPrice('');
      setDescription(''); setImages([]); setPreviews([]);
      setTagSubject('none'); setTagField('none'); setTagFaculty('none'); setHasWriting('0');

      if (typeof onCreated === 'function') onCreated(res?.data?.data || res?.data);

      // 下書き保存 → マイ出品へ / 公開 → 一覧へ
      if (status === 'draft') {
        navigate('/my/listings');
      } else {
        navigate('/listings');
      }
    } catch (err) {
      if (err.response?.status === 422 && err.response.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        alert('出品に失敗しました。時間をおいて再度お試しください。');
        console.error('listing create failed', err);
      }
    } finally {
      setLoading(false);
    }
  };

  // 送信（公開）
  const onSubmit = (e) => { e.preventDefault(); submitListing('active'); };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto mt-10 mb-16 px-6">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-900">教科書を出品</h1>

        <Card className="shadow-md border border-blue-100">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={onSubmit} className="space-y-6" aria-label="listing create form">
              {/* 教科書名 */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  教科書名 <span className="text-red-500">*</span>
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => { const v = e.target.value; setTitle(v); setTitleError(validateTitle(v)); }}
                  placeholder="例）線形代数入門 第3版"
                  required
                />
                {(titleError || (errors.title && errors.title[0])) && (
                  <p className="text-red-500 text-sm mt-1">{titleError || errors.title[0]}</p>
                )}
              </div>

              {/* 講義名 */}
              <div>
                <label htmlFor="course" className="block text-sm font-medium mb-1">
                  講義名 <span className="text-red-500">*</span>
                </label>
                <Input
                  id="course"
                  value={course}
                  onChange={(e) => { const v = e.target.value; setCourse(v); setCourseError(validateCourse(v)); }}
                  placeholder="例）線形代数（A群）"
                  required
                />
                {(courseError || (errors.course_name && errors.course_name[0])) && (
                  <p className="text-red-500 text-sm mt-1">{courseError || errors.course_name[0]}</p>
                )}
              </div>

              {/* 価格 */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium mb-1">
                  価格（円） <span className="text-red-500">*</span>
                </label>
                <Input
                  id="price"
                  type="number"
                  inputMode="numeric"
                  min={100}
                  max={1000000}
                  step={100}
                  value={price}
                  onChange={(e) => { const v = e.target.value; setPrice(v); setPriceError(validatePrice(v)); }}
                  placeholder="例）1500"
                  required
                />
                {(priceError || (errors.price && errors.price[0])) && (
                  <p className="text-red-500 text-sm mt-1">{priceError || errors.price[0]}</p>
                )}
              </div>

              {/* タグ群 */}
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
                <label htmlFor="desc" className="block text-sm font-medium mb-1">説明（任意）</label>
                <Textarea
                  id="desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="書き込み有り/付録欠品 など"
                  className="h-36 resize-y"
                />
                <div className="text-xs text-gray-400 text-right">{description.length}/2000</div>
              </div>

              {/* 画像 */}
              <div>
                <label className="block text-sm font-medium mb-1">画像（最大3枚, 5MBまで）</label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPT.join(',')}
                  multiple
                  onChange={(e) => handleFiles(e.target.files)}
                />
                {(imageError ||
                  (errors['images.0'] && errors['images.0'][0]) ||
                  (errors.images && errors.images[0])) && (
                  <p className="text-red-500 text-sm mt-1">
                    {imageError || errors['images.0']?.[0] || errors.images?.[0]}
                  </p>
                )}
                {previews.length > 0 && (
                  <ul className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {previews.map((src, i) => (
                      <li key={i} className="relative group">
                        <img
                          src={src}
                          alt={`preview-${i}`}
                          className="w-full h-28 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 hidden group-hover:flex items-center px-2 py-1 text-xs rounded-md bg-black/60 text-white"
                        >
                          削除
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* アクション：公開 / 下書き */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  type="submit"
                  className="w-full bg-blue-700 hover:bg-blue-800"
                  disabled={loading || !canSubmit}
                  // submit は active
                >
                  {loading ? '送信中...' : '出品する'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={loading || !canSubmit}
                  onClick={() => submitListing('draft')}
                >
                  下書きに保存
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-xs text-gray-400 text-center mt-4">
          * 画像・タグは後から編集できます。
        </p>
      </div>
    </AppLayout>
  );
}

ListingCreateForm.defaultProps = { apiBase: '/api', onCreated: undefined };
