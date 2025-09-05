import React, { useEffect, useMemo, useRef, useState } from 'react';
import AppLayout from '../components/AppLayout';
import { axiosInstance } from '../api/axiosInstance';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

/**
 * プロフィール編集（学科なし / axios + shadcn）
 * - 取得: GET  /api/me
 * - 更新: PATCH /api/me
 * - 画像: POST /api/me/avatar (multipart/form-data) → { profile_image }
 * - 表示: 評価/実績は読み取り専用
 */
export default function ProfileEditPage({ apiBase = '/api' }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [faculty, setFaculty] = useState('');
  const [paypayId, setPaypayId] = useState('');
  const [avatar, setAvatar] = useState('');

  const [avatarFile, setAvatarFile] = useState(null);
  const fileRef = useRef(null);

  // --- 学部のみ（暫定マスター） ---
  const FACULTIES = [
    { key: '工学部', label: '工学部' },
  { key: '理学部', label: '理学部' },
  { key: '文学部', label: '文学部' },
  { key: '法学部', label: '法学部' },
  { key: '経済学部', label: '経済学部' },
  { key: '商学部', label: '商学部' },
  { key: '医学部', label: '医学部' },
  { key: '看護学部', label: '看護学部' },
  { key: 'その他', label: 'その他' },
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true); setErrors({});
        await axiosInstance.get('/sanctum/csrf-cookie', { withCredentials: true });
        const res = await axiosInstance.get(`${apiBase}/me`, { withCredentials: true });
        if (!mounted) return;
        const u = res.data?.data || res.data || {};
        setName(u.name || '');
        setEmail(u.email || '');
        setBio(u.bio || '');
        setFaculty(u.faculty || '');
        setPaypayId(u.paypay_id || '');
        setAvatar(u.profile_image || '');
      } catch (err) {
        console.error('profile fetch failed', err);
        setErrors({ general: ['プロフィールの取得に失敗しました。'] });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [apiBase]);

  // PayPay ID 簡易バリデーション（英数-_ 4〜20）
  const paypayError = useMemo(() => {
    if (!paypayId) return '';
    const ok = /^[A-Za-z0-9_\-]{4,20}$/.test(paypayId);
    return ok ? '' : 'PayPay ID は英数字と-_で4〜20文字。';
  }, [paypayId]);

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true); setErrors({}); setMessage('');
    try {
      const payload = {
        name: name.trim(),
        // ※メール変更を許可しないなら email を送らない
        email: email.trim(),
        bio,
        faculty: faculty || null,
        paypay_id: paypayId || null,
      };
      const res = await axiosInstance.patch(`${apiBase}/me`, payload, { withCredentials: true });
      setMessage(res?.data?.message || 'プロフィールを更新しました');
    } catch (err) {
      const apiErrors = err?.response?.data?.errors;
      if (apiErrors) setErrors(apiErrors);
      else setErrors({ general: [err?.response?.data?.message || '更新に失敗しました。'] });
      console.error('profile update failed', err?.response?.data || err);
    } finally {
      setSaving(false);
    }
  };

  const onPickAvatar = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const ACCEPT = ['image/jpeg','image/jpg','image/png','image/webp'];
    if (!ACCEPT.includes(f.type)) {
      setErrors({ avatar: ['画像は jpg/png/webp のみ対応です。'] });
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setErrors({ avatar: ['画像は 5MB 以下にしてください。'] });
      return;
    }
    setAvatarFile(f);
  };

  const onUploadAvatar = async () => {
    if (!avatarFile) return;
    setUploading(true); setErrors({}); setMessage('');
    try {
      const fd = new FormData();
      fd.append('image', avatarFile);
      const res = await axiosInstance.post(`${apiBase}/me/avatar`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      const url = res?.data?.profile_image;
      if (url) setAvatar(url);
      setAvatarFile(null);
      setMessage('プロフィール画像を更新しました');
    } catch (err) {
      const apiErrors = err?.response?.data?.errors;
      if (apiErrors) setErrors(apiErrors);
      else setErrors({ avatar: [err?.response?.data?.message || '画像のアップロードに失敗しました。'] });
      console.error('avatar upload failed', err?.response?.data || err);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto mt-16 mb-20 px-6">
          <Card className="h-64 animate-pulse bg-gray-100" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto mt-10 mb-20 px-6">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-900">プロフィール編集</h1>

        <Card className="border border-blue-100">
          <CardContent className="p-6 space-y-6">
            {/* アバター */}
            <div className="flex items-center gap-4">
              <img
                src={avatar || 'https://placehold.co/96x96?text=%20'}
                alt="avatar"
                className="w-24 h-24 rounded-full object-cover border"
              />
              <div className="space-y-2">
                <Input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={onPickAvatar}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    disabled={!avatarFile || uploading}
                    onClick={onUploadAvatar}
                    className="bg-blue-700 hover:bg-blue-800"
                  >
                    {uploading ? 'アップロード中...' : '画像を更新'}
                  </Button>
                  {avatarFile && (
                    <Button type="button" variant="outline" onClick={() => setAvatarFile(null)}>
                      取り消し
                    </Button>
                  )}
                </div>
                {errors.avatar?.[0] && <p className="text-red-500 text-sm mt-1">{errors.avatar[0]}</p>}
              </div>
            </div>

            {/* 基本情報 */}
            <form onSubmit={onSave} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1">
                  ユーザー名 <span className="text-red-500">*</span>
                </label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
                {errors.name?.[0] && <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">メールアドレス</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                {errors.email?.[0] && <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>}
                <p className="text-xs text-gray-500 mt-1">※ 変更すると再認証が必要になる場合があります。</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">自己紹介</label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="h-32 resize-y"
                  maxLength={2000}
                />
                <div className="text-xs text-gray-400 text-right">{bio.length}/2000</div>
                {errors.bio?.[0] && <p className="text-red-500 text-sm mt-1">{errors.bio[0]}</p>}
              </div>

              {/* 学部のみ */}
              <div>
                <label className="block text-sm font-medium mb-1">学部</label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                >
                  <option value="">選択してください</option>
                  {FACULTIES.map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.label}
                    </option>
                  ))}
                </select>
                {errors.faculty?.[0] && <p className="text-red-500 text-sm mt-1">{errors.faculty[0]}</p>}
              </div>

              {/* PayPay ID */}
              <div>
                <label className="block text-sm font-medium mb-1">PayPay ID</label>
                <Input
                  value={paypayId}
                  onChange={(e) => setPaypayId(e.target.value)}
                  placeholder="例）paypay_taro"
                />
                {(paypayError || errors.paypay_id?.[0]) && (
                  <p className="text-red-500 text-sm mt-1">{paypayError || errors.paypay_id?.[0]}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  英数字と - _ が使用可（4〜20文字）。購入者へはDMでのみ表示されます。
                </p>
              </div>

              {/* 読み取り専用の指標（必要に応じて /api/me に値を追加） */}
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                <div className="rounded-lg border p-3 bg-gray-50">
                  評価：<span className="font-semibold">{errors.rating_avg ?? '—'}</span>
                </div>
                <div className="rounded-lg border p-3 bg-gray-50">
                  取引実績：<span className="font-semibold">{errors.deals_count ?? '—'}</span>
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800" disabled={saving}>
                  {saving ? '保存中...' : '保存する'}
                </Button>
              </div>

              {/* メッセージ・エラー */}
              {message && <p className="text-emerald-600 text-sm mt-2">{message}</p>}
              {errors.general?.[0] && <p className="text-red-600 text-sm mt-2">{errors.general[0]}</p>}
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
