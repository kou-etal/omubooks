// src/pages/AdminBroadcastPage.jsx
import { useState } from 'react';
import { axiosInstance } from '../api/axiosInstance';
import AppLayout from '../components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function AdminBroadcastPage({ apiBase = '/api' }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [metaJson, setMetaJson] = useState(''); // 任意 JSON
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');

    let meta = undefined;
    if (metaJson.trim()) {
      try { meta = JSON.parse(metaJson); }
      catch { setErr('meta は JSON で入力してください'); return; }
    }

    try {
      setSubmitting(true);
      await axiosInstance.post(`${apiBase}/admin/notifications/broadcast`, {
        title: title.trim(),
        body: body.trim() || undefined,
        action_url: actionUrl.trim() || undefined,
        meta,
      }, { withCredentials: true });

      setMsg('全ユーザーへ送信しました。');
      setTitle(''); setBody(''); setActionUrl(''); setMetaJson('');
    } catch (e) {
      setErr(e?.response?.data?.message || '送信に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = title.trim() && !submitting;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto mt-10 mb-16 px-6">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-900">全体通知の送信</h1>

        <Card className="border border-blue-100 shadow-sm">
          <CardContent className="p-6 space-y-5">
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1">タイトル（必須）</label>
                <Input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="例）メンテナンスのお知らせ" required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">本文（任意）</label>
                <Textarea value={body} onChange={(e)=>setBody(e.target.value)} className="h-36" placeholder="本文を入力" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">リンク（任意）</label>
                <Input value={actionUrl} onChange={(e)=>setActionUrl(e.target.value)} placeholder="/trades や https://..." />
                <p className="text-xs text-gray-500 mt-1">相対パスで SPA 内遷移、または外部URL。</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">meta（任意 JSON）</label>
                <Textarea value={metaJson} onChange={(e)=>setMetaJson(e.target.value)} className="h-28" placeholder='{"foo":"bar"}' />
              </div>

              {msg && <div className="text-green-700 text-sm">{msg}</div>}
              {err && <div className="text-red-600 text-sm">{err}</div>}

              <div className="pt-2">
                <Button type="submit" disabled={!canSubmit} className="bg-blue-700 hover:bg-blue-800">
                  {submitting ? '送信中...' : '全体へ送信'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
