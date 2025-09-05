import React, { useMemo, useRef, useState, useEffect } from 'react';
import { axiosInstance } from '../api/axiosInstance';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import AppLayout from '../components/AppLayout';
import { useNavigate } from 'react-router-dom';

/**
 * 出品フォーム（axios版 / あなたのコードスタイル / JSX）
 * - POST /api/listings に multipart/form-data で送信
 * - 必須: title, course_name, price
 * - 任意: description, images[]（最大3枚: jpg/png/webp 5MB）
 * - 成功時: onCreated?.(listing) を呼び、navigate('/')（必要なら変更）
 */
export default function ListingCreateForm({ apiBase = '/api', onCreated }) {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]); // File[] 最大3

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [titleError, setTitleError] = useState('');
  const [courseError, setCourseError] = useState('');
  const [priceError, setPriceError] = useState('');
  const [imageError, setImageError] = useState('');

  const [previews, setPreviews] = useState([]); // objectURL[]
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

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setImageError('');

    // 即時バリデーション
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
      images.forEach((f) => fd.append('images[]', f));

      const res = await axiosInstance.post(`${apiBase}/listings`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      const data = res?.data;

      // リセット
      setTitle('');
      setCourse('');
      setPrice('');
      setDescription('');
      setImages([]);
      setPreviews([]);

      // 成功コールバック（任意）
      if (typeof onCreated === 'function') {
        onCreated(data?.data || data);
      }

      // 遷移（必要なら `/listings/${id}` に変更）
      navigate('/');
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
                  onChange={(e) => {
                    const v = e.target.value;
                    setTitle(v);
                    setTitleError(validateTitle(v));
                  }}
                  placeholder="例）線形代数入門 第3版"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">最大255文字。</p>
                {(titleError || (errors.title && errors.title[0])) && (
                  <p className="text-red-500 text-sm mt-1">
                    {titleError || errors.title[0]}
                  </p>
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
                  onChange={(e) => {
                    const v = e.target.value;
                    setCourse(v);
                    setCourseError(validateCourse(v));
                  }}
                  placeholder="例）線形代数（A群）"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">最大255文字。</p>
                {(courseError || (errors.course_name && errors.course_name[0])) && (
                  <p className="text-red-500 text-sm mt-1">
                    {courseError || errors.course_name[0]}
                  </p>
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
                  onChange={(e) => {
                    const v = e.target.value;
                    setPrice(v);
                    setPriceError(validatePrice(v));
                  }}
                  placeholder="例）1500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">100〜1,000,000円、整数。</p>
                {(priceError || (errors.price && errors.price[0])) && (
                  <p className="text-red-500 text-sm mt-1">
                    {priceError || errors.price[0]}
                  </p>
                )}
              </div>

              {/* 説明 */}
              <div>
                <label htmlFor="desc" className="block text-sm font-medium mb-1">
                  説明（任意）
                </label>
                <Textarea
                  id="desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="書き込み有り/マーカー少し/カバーあり など"
                  className="h-36 resize-y"
                />
                <div className="text-xs text-gray-400 text-right">
                  {description.length}/2000
                </div>
              </div>

              {/* 画像 */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  画像（最大3枚, 5MBまで）
                </label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPT.join(',')}
                  multiple
                  onChange={(e) => handleFiles(e.target.files)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  対応: jpg / png / webp ・ 最大3枚
                </p>
                {(imageError ||
                  (errors['images.0'] && errors['images.0'][0]) ||
                  (errors.images && errors.images[0])) && (
                  <p className="text-red-500 text-sm mt-1">
                    {imageError ||
                      (errors['images.0'] && errors['images.0'][0]) ||
                      (errors.images && errors.images[0])}
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

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full bg-blue-700 hover:bg-blue-800"
                  disabled={loading || !canSubmit}
                >
                  {loading ? '送信中...' : '出品する'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-xs text-gray-400 text-center mt-4">
          * 送信後にDMが自動生成され、運営から手数料の案内が届きます。
        </p>
      </div>
    </AppLayout>
  );
}

/* JSX用のデフォルト（型なし環境でも onCreated 未指定を許可） */
ListingCreateForm.defaultProps = {
  apiBase: '/api',
  onCreated: undefined,
};
