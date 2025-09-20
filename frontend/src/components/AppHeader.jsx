// src/components/AppHeader.jsx
import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { axiosInstance } from '../api/axiosInstance';
import { Button } from '@/components/ui/button';
import { AdminLink } from '@/components/AdminLink';
import { Bell } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';

export default function AppHeader() {
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  // notifications
  const [notiOpen, setNotiOpen] = useState(false);
  const [notis, setNotis] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotis, setLoadingNotis] = useState(false);

  const unreadRef = useRef(0); // 閉包ずれ防止
  useEffect(() => { unreadRef.current = unreadCount; }, [unreadCount]);

  const idleHitsRef = useRef(0); // 変化なしの連続回数 0→1→2（=20→40→60s）
  const timerRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  // util
  const timeAgo = (iso) => {
    const d = new Date(iso);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)}秒前`;
    if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
    return `${Math.floor(diff / 86400)}日前`;
  };

  const fetchSession = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/api/session', { withCredentials: true });
      const data = res?.data;
      setUser(data?.authenticated ? (data.user || null) : null);
    } catch {
      setUser(null);
    }
  }, []);

  // 通知レスポンス正規化（{items, unread_count} or {data, meta.unread_count} どちらでもOK）
  const normalizeNotiList = (payload) => {
    const list = Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(payload?.data)
      ? payload.data
      : [];
    return list.map((n) => {
      const data = n.data ?? {
        kind: n.kind ?? null,
        title: n.title ?? '',
        body: n.body ?? '',
        action_url: n.action_url ?? null,
        meta: n.meta ?? null,
      };
      return {
        id: n.id,
        data,
        read_at: n.read_at ?? null,
        created_at: n.created_at,
      };
    });
  };

  // 一覧取得（モーダル開いた時のみ）
  const fetchNotifications = useCallback(async () => {
    try {
      setLoadingNotis(true);
      const res = await axiosInstance.get('/api/me/notifications', { withCredentials: true });
      setNotis(normalizeNotiList(res?.data));
      // バックエンドどちらの形でも拾う
      const uc = Number(res?.data?.unread_count ?? res?.data?.meta?.unread_count ?? 0);
      setUnreadCount(uc);
    } finally {
      setLoadingNotis(false);
    }
  }, []);

  // モーダルを開く → 一覧取得 → 既読化（ベルのバッジは即時0に）
  const openNotis = async () => {
    setNotiOpen(true);
    await fetchNotifications();
    try {
      await axiosInstance.get('/sanctum/csrf-cookie', { withCredentials: true });
      await axiosInstance.post('/api/me/notifications/read-all', {}, { withCredentials: true });
      setUnreadCount(0); // バッジは即時クリア
      idleHitsRef.current = 0; // バックオフもリセット
    } catch {
      /* noop */
    }
  };

  // ヘッダー初期化
  useEffect(() => {
    fetchSession();
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.pathname, fetchSession]);

  // 軽量ポーリング：未読件数だけ（表示中20s、非表示90s。変化なしで20→40→60sにバックオフ）
  useEffect(() => {
    if (!user) return;
    let stopped = false;

    const intervalMs = () => {
      if (document.hidden) return 90000; // バックグラウンド
      if (idleHitsRef.current === 0) return 20000;
      if (idleHitsRef.current === 1) return 40000;
      return 60000;
    };

    const tick = async () => {
      try {
        const res = await axiosInstance.get('/api/me/notifications', {
          withCredentials: true,
          // 件数は不要なので最低限だけ（per_page=1でOK）
          params: { per_page: 1 },
        });
        const next = Number(res?.data?.unread_count ?? res?.data?.meta?.unread_count ?? 0);
        const changed = next !== unreadRef.current;
        setUnreadCount(next);
        idleHitsRef.current = changed ? 0 : Math.min(idleHitsRef.current + 1, 2);
      } catch {
        // エラー時は穏やかにバックオフ
        idleHitsRef.current = Math.min(idleHitsRef.current + 1, 2);
      } finally {
        if (!stopped) {
          timerRef.current = setTimeout(tick, intervalMs());
        }
      }
    };

    const onVis = () => {
      // タブ復帰で即リセットして次tickを早める
      idleHitsRef.current = 0;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(tick, 200); // ちょい待って即チェック
      }
    };

    document.addEventListener('visibilitychange', onVis);
    tick();

    return () => {
      stopped = true;
      document.removeEventListener('visibilitychange', onVis);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user]);

  // ルート遷移時にも一発だけ未読数を軽く更新（体感向上）
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await axiosInstance.get('/api/me/notifications', {
          withCredentials: true,
          params: { per_page: 1 },
        });
        setUnreadCount(Number(res?.data?.unread_count ?? res?.data?.meta?.unread_count ?? 0));
        idleHitsRef.current = 0; // 遷移直後はリセット
      } catch {}
    })();
  }, [location.pathname, user]);

  const isLoggedIn = !!user;

  const logout = async () => {
    try {
      await axiosInstance.get('/sanctum/csrf-cookie', { withCredentials: true });
      await axiosInstance.post('/logout', {}, { withCredentials: true });
      setUser(null);
      navigate('/');
    } catch {
      navigate('/');
    }
  };

  return (
    <header
      className={[
        'fixed inset-x-0 top-0 z-50 h-16 md:h-20',
        'bg-white/60 supports-[backdrop-filter]:backdrop-blur-md border-b border-white/40',
        scrolled ? 'bg-white/85 shadow-md' : 'shadow-none',
        'flex items-center justify-between px-4 sm:px-6 md:px-8 text-blue-900 transition'
      ].join(' ')}
      role="navigation"
      aria-label="Global"
    >
      {/* 左：ロゴ */}
      <Link to="/" className="text-2xl md:text-3xl font-extrabold hover:text-blue-700">
        TextbookMarket
      </Link>

      {/* 右：ナビ */}
      <nav className="flex items-center gap-2 md:gap-4">
        <Button asChild variant="ghost" className="text-base md:text-lg font-medium hover:text-blue-600 hover:underline">
          <Link to="/">Home</Link>
        </Button>

        <Button asChild variant="ghost" className="text-base md:text-lg font-medium hover:text-blue-600 hover:underline">
          <Link to="/listings">List</Link>
        </Button>

        <AdminLink />

        {!isLoggedIn ? (
          <>
            <Button asChild variant="ghost" className="text-base md:text-lg font-medium hover:text-blue-600 hover:underline">
              <Link to="/register">Sign up</Link>
            </Button>
            <Button asChild variant="ghost" className="text-base md:text-lg font-medium hover:text-blue-600 hover:underline">
              <Link to="/login">Log in</Link>
            </Button>
          </>
        ) : (
          <>
            <Button asChild variant="ghost" className="text-base md:text-lg font-medium hover:text-blue-600 hover:underline">
              <Link to="/listings/new">出品</Link>
            </Button>
            <Button asChild variant="ghost" className="text-base md:text-lg font-medium hover:text-blue-600 hover:underline">
              <Link to="/listings/me">商品編集</Link>
            </Button>
            <Button asChild variant="ghost" className="text-base md:text-lg font-medium hover:text-blue-600 hover:underline">
              <Link to="/trades">取引中</Link>
            </Button>
            <Button asChild variant="ghost" className="text-base md:text-lg font-medium hover:text-blue-600 hover:underline">
              <Link to="/profile/edit">プロフィール編集</Link>
            </Button>

            {/* ▼ ベル（ログアウトの左） */}
            <button
              type="button"
              onClick={openNotis}
              className="relative p-2 rounded-lg hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label={`通知を開く${unreadCount ? `（未読 ${unreadCount}）` : ''}`}
            >
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[11px] leading-5 text-center font-semibold"
                  aria-label={`未読 ${unreadCount}`}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            <Button onClick={logout} variant="ghost" className="text-base md:text-lg font-medium hover:text-blue-600 hover:underline">
              ログアウト
            </Button>
          </>
        )}
      </nav>

      {/* ▼ 通知モーダル */}
      <Dialog open={notiOpen} onOpenChange={setNotiOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>通知</DialogTitle>
            <DialogDescription>管理者のお知らせ・購入/取引の更新が表示されます。</DialogDescription>
          </DialogHeader>

          {/* 中身 */}
          <div className="max-h-[60vh] overflow-y-auto space-y-2">
            {loadingNotis ? (
              <div className="py-8 text-center text-sm text-gray-500">読み込み中...</div>
            ) : notis.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">通知はありません。</div>
            ) : (
              notis.map((n) => {
                const title = n?.data?.title || 'お知らせ';
                const body  = n?.data?.body  || '';
                const url   = n?.data?.action_url || null;

                const ItemInner = (
                  <div className="w-full text-left">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-[15px] text-gray-900">{title}</div>
                      <div className="text-[11px] text-gray-500 shrink-0">{timeAgo(n.created_at)}</div>
                    </div>
                    {body && <div className="mt-1 text-[13px] text-gray-700 whitespace-pre-wrap">{body}</div>}
                    {url && (
                      <div className="mt-2">
                        <span className="inline-block text-xs px-2 py-0.5 rounded-md border bg-white hover:bg-blue-50 text-blue-700">
                          くわしく見る
                        </span>
                      </div>
                    )}
                  </div>
                );

                return (
                  <Card key={n.id} className="p-3 border hover:border-blue-200 transition">
                    {url ? (
                      <button
                        type="button"
                        onClick={() => {
                          setNotiOpen(false);
                          if (/^https?:\/\//i.test(url)) {
                            window.location.href = url;
                          } else {
                            navigate(url);
                          }
                        }}
                        className="w-full text-left"
                      >
                        {ItemInner}
                      </button>
                    ) : (
                      ItemInner
                    )}
                  </Card>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
