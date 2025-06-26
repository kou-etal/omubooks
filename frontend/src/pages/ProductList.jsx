import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {AdminLink} from '../components/AdminLink';
import axios from 'axios';
import { axiosInstance } from '../api/axiosInstance';
import AppLayout from '../components/AppLayout'

export function ProductList() {
  const [products, setProducts] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get('/api/products');
        setProducts(res.data.products);
        /*setWeather(res.data.weather);*/
      } catch (error) {
        console.error('データ取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex justify-center text-center items-center">
  <p className="text-3xl font-light tracking-widest uppercase text-gray-500 animate-pulse">読み込み中...</p>
  </div>
);

  return (
    <AppLayout>
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">商品一覧</h1>
      <div className="h-px bg-gray-300 mb-16"/>
<ul className="grid grid-cols-3 gap-4">
  {products.map(product => (
    <li key={product.id} className="border p-4">
      <h2 className="font-semibold"><Link to={`/products/${product.id}`}>{product.name}</Link></h2>
      <p className="text-gray-700">￥{product.price}</p>
    </li>
  ))}
</ul>
    </div>
    </AppLayout>
  );
}

 /* <p className="mb-4">天気: {weather.weather[0].description} / 気温: {weather.main.temp}°C</p>*/
/*<Link to="/edit">プロフィール</Link>
   <Link to="/register">新規登録</Link>
   <Link to="/login">ログイン</Link>
   <Link to="/logout">ログアウト</Link>
   <Link to="/post">投稿</Link>
   <Link to="/postlist">投稿一覧</Link>
   <Link to="/followingpostlist">フォローユーザー投稿一覧</Link>
   <Link to="/cart">カート</Link>
   <Link to="/follow">フォロー機能</Link>
   <Link to="/chat">チャット</Link>
   <Link to="/my-groups">グループチャット</Link>
   <Link to="/users">個人チャット</Link>
   <AdminLink></AdminLink>*/