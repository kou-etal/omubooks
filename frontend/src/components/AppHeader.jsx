import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { axiosInstance } from '../api/axiosInstance';
import { Button } from '@/components/ui/button';

/**
 * ヘッダー（あなたのスタイル / axios + shadcn）
 * - セッション: GET /api/session { authenticated: boolean, user?: {...} }
 * - 未ログイン: Home, List, Sign up, Log in
 * - ログイン:   Home, List, 出品, ログアウト
 */
export default function AppHeader() {
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const controller = new AbortController();

    // セッション取得
    axiosInstance
      .get('/api/session', { signal: controller.signal })
      .then((res) => {
        const data = res?.data;
        if (data && data.authenticated) setUser(data.user || null);
        else setUser(null);
      })
      .catch(() => setUser(null));

    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      controller.abort();
      window.removeEventListener('scroll', onScroll);
    };
  }, [location.pathname]);

  const isLoggedIn = !!user;

  const logout = async () => {
    try {
      await axiosInstance.get('/sanctum/csrf-cookie', { withCredentials: true });
      await axiosInstance.post('/logout', {}, { withCredentials: true });
      setUser(null);
      navigate('/');
    } catch (e) {
      console.error('logout failed', e?.response?.data || e);
      // フォールバック: とりあえずトップへ
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
            <Button onClick={logout} variant="ghost" className="text-base md:text-lg font-medium hover:text-blue-600 hover:underline">
              ログアウト
            </Button>
          </>
        )}
      </nav>
    </header>
  );
}
