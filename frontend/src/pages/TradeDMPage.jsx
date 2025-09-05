
import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { axiosInstance } from '../api/axiosInstance';      // API呼び出し用
import AppLayout  from '../components/AppLayout';       // レイアウト
import { Card, CardContent } from '@/components/ui/card';  // shadcn/ui のCard
import { Button } from '@/components/ui/button';           // shadcn/ui のButton
import { Textarea } from '@/components/ui/textarea';       // shadcn/ui のTextarea
import { Input } from '@/components/ui/input';             // shadcn/ui のInput

export function TradeDMPage({ apiBase = '/api' }) {
  const { id } = useParams(); // tradeId
  const bottomRef = useRef(null);

  const [trade, setTrade] = useState(null);
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [body, setBody] = useState('');
  const [files, setFiles] = useState([]); // File[]
  const [error, setError] = useState('');

  const POLL_MS = 5000; // 5秒ごと

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [tRes, mRes] = await Promise.all([
          axiosInstance.get(`${apiBase}/trades/${id}`, { withCredentials: true }),
          axiosInstance.get(`${apiBase}/trades/${id}/messages`, { params: { page: 1, per_page: 30 }, withCredentials: true })
        ]);
        if (!mounted) return;
        setTrade(tRes.data?.data || tRes.data);
        const d = mRes.data;
        const arr = Array.isArray(d?.data) ? d.data.slice().reverse() : [];
        setMessages(arr);
        setPage(d?.meta?.current_page || 1);
        setLastPage(d?.meta?.last_page || 1);
      } catch (err) {
        console.error('dm init failed', err);
        setError('DMの取得に失敗しました。');
      } finally {
        if (mounted) setLoading(false);
        scrollToBottom();
      }
    })();

    // ポーリング
    const timer = setInterval(() => { refreshMessages(); }, POLL_MS);
    return () => { mounted = false; clearInterval(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const refreshMessages = async () => {
    try {
      const res = await axiosInstance.get(`${apiBase}/trades/${id}/messages`, { params: { page: lastPage, per_page: 30 }, withCredentials: true });
      const d = res.data;
      const arr = Array.isArray(d?.data) ? d.data.slice().reverse() : [];
      setMessages(arr);
      setPage(d?.meta?.current_page || 1);
      setLastPage(d?.meta?.last_page || 1);
      scrollToBottom();
    } catch (err) { /* noop */ }
  };

  const onSend = async (e) => {
    e.preventDefault();
    if (!body.trim() && files.length === 0) return;
    setSending(true);
    try {
      const fd = new FormData();
      if (body.trim()) fd.append('body', body.trim());
      files.forEach((f) => fd.append('images[]', f));
      await axiosInstance.post(`${apiBase}/trades/${id}/messages`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true,
      });
      setBody(''); setFiles([]);
      await refreshMessages();
    } catch (err) {
      alert(err.response?.data?.message || '送信に失敗しました。');
    } finally {
      setSending(false);
    }
  };

  const onPickFiles = (e) => {
    const MAX = 3; const ACCEPT = ['image/jpeg','image/jpg','image/png','image/webp']; const SIZE = 5*1024*1024;
    const incoming = Array.from(e.target.files || []);
    const next = [...files];
    for (const f of incoming) {
      if (next.length >= MAX) break;
      if (!ACCEPT.includes(f.type)) continue;
      if (f.size > SIZE) continue;
      next.push(f);
    }
    setFiles(next);
    e.target.value = '';
  };

  const scrollToBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 0);
  };

  const meId = trade?.buyer?.id === trade?.seller?.id ? null : null; // フロントではID比較よりも from/to 表示で十分

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto mt-10 mb-20 px-6">
          <Card className="h-64 animate-pulse bg-gray-100" />
        </div>
      </AppLayout>
    );
  }

  if (error || !trade) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto mt-10 mb-16 px-6 text-red-600">{error || 'この取引は表示できません。'}</div>
      </AppLayout>
    );
  }

  const headerCounterparty = trade?.buyer && trade?.seller ? (
    <div className="flex items-center gap-3">
      <img src={(trade.seller?.profile_image)||'https://placehold.co/40x40?text=%20'} alt="avatar" className="w-10 h-10 rounded-full border object-cover" />
      <div className="text-sm">
        <div className="font-semibold text-blue-900">{trade.seller?.name} / {trade.buyer?.name}</div>
        <div className="text-gray-600 text-xs">価格 ¥{new Intl.NumberFormat('ja-JP').format(trade.price)} / ステータス {trade.status}</div>
      </div>
    </div>
  ) : null;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto mt-6 mb-20 px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-blue-900">DM（取引ID: {trade.id}）</h1>
          <Link to="/trades"><Button variant="outline">取引一覧へ</Button></Link>
        </div>

        <Card className="border border-blue-100">
          <CardContent className="p-4">
            {/* 相手情報 */}
            {headerCounterparty}

            {/* メッセージ一覧 */}
            <div className="mt-4 h-[60vh] overflow-y-auto rounded-md border bg-white p-3">
              {messages.length === 0 ? (
                <div className="text-sm text-gray-500">メッセージはまだありません。購入直後に運営から手数料の案内が届きます。</div>
              ) : (
                <ul className="space-y-3">
                  {messages.map((m) => (
                    <li key={m.id} className="flex flex-col">
                      <div className={`text-xs mb-1 ${m.is_system ? 'text-amber-700' : 'text-gray-500'}`}>
                        {m.is_system ? '【運営】' : (m.from?.name || 'ユーザー')}・{new Date(m.created_at).toLocaleString()}
                      </div>
                      {m.body && (
                        <div className={`whitespace-pre-wrap rounded-xl px-3 py-2 ${m.is_system ? 'bg-amber-50 border border-amber-200' : 'bg-blue-50 border border-blue-100'}`}>
                          {m.body}
                        </div>
                      )}
                      {Array.isArray(m.attachments) && m.attachments.length > 0 && (
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {m.attachments.map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noreferrer" className="block">
                              <img src={url} alt={`att-${m.id}-${i}`} className="w-full h-32 object-cover rounded-md border" />
                            </a>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                  <div ref={bottomRef} />
                </ul>
              )}
            </div>

            {/* 送信フォーム */}
            <form onSubmit={onSend} className="mt-4 space-y-3">
              <Textarea value={body} onChange={(e)=> setBody(e.target.value)} placeholder="メッセージを入力（支払い完了など）" className="min-h-[90px]" />
              <div className="flex items-center justify-between gap-3">
                <Input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" multiple onChange={onPickFiles} />
                <Button type="submit" disabled={sending || (!body.trim() && files.length===0)} className="bg-blue-700 hover:bg-blue-800">
                  {sending ? '送信中...' : '送信'}
                </Button>
              </div>
              {files.length > 0 && (
                <div className="text-xs text-gray-600">添付: {files.map((f)=> f.name).join(', ')}</div>
              )}
              </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}