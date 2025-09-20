import { useEffect, useState, useCallback } from 'react';
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

  const [notiOpen, setNotiOpen] = useState(false);
  const [notis, setNotis] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotis, setLoadingNotis] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

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

  const normalizeNotis = (payload) => {
    const list = Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(payload?.data)
      ? payload.data
      : [];

    return list.map((n) => {
      // API がフラット形でも吸収
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

  const fetchNotifications = useCallback(async () => {
    try {
      setLoadingNotis(true);
      const res = await axiosInstance.get('/api/me/notifications', { withCredentials: true });
      setNotis(normalizeNotis(res?.data));
      setUnreadCount(Number(res?.data?.unread_count ?? res?.data?.meta?.unread_count ?? 0));
    } finally {
      setLoadingNotis(false);
    }
  }, []);

  const openNotis = async () => {
    setNotiOpen(true);
    await fetchNotifications();
    try {
      // 419対策で一度 CSRF クッキーを踏む
      await axiosInstance.get('/sanctum/csrf-cookie', { withCredentials: true });
      await axiosInstance.post('/api/me/notifications/read-all', {}, { withCredentials: true });
      setUnreadCount(0); // バッジは即時クリア
    } catch {
      /* noop */
    }
  };

  useEffect(() => {
    fetchSession();
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.pathname, fetchSession]);

  // ルート遷移のたびに未読数だけ軽く更新
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await axiosInstance.get('/api/me/notifications', {
          withCredentials: true,
          params: { limit: 1 },
        });
        setUnreadCount(Number(res?.data?.unread_count ?? 0));
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
      <Link to="/" className="text-2xl md:text-3xl font-extrabold hover:text-blue-700">
        TextbookMarket
      </Link>

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

            {/* ログアウトの左にベル */}
            <button
              type="button"
              onClick={openNotis}
              className="relative p-2 rounded-lg hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label={`通知を開く${unreadCount ? `（未読 ${unreadCount}）` : ''}`}
            >
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[11px] leading-5 text-center font-semibold">
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

      {/* 通知モーダル */}
      <Dialog open={notiOpen} onOpenChange={setNotiOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>通知</DialogTitle>
            <DialogDescription>管理者のお知らせ・購入/取引の更新が表示されます。</DialogDescription>
          </DialogHeader>

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
