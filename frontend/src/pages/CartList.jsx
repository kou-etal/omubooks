import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'
import {axiosInstance} from '../api/axiosInstance';

export function CartList() {
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get('/api/cart');
        setCarts(res.data.cart);
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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">カート一覧</h1>
      <div className="h-px bg-gray-300 mb-16"/>
<ul className="grid grid-cols-3 gap-4">
  {carts.map(cart => (
    <li key={cart.id} className="border p-4">
      <p className="text-gray-700">{cart.name}</p>
      <p className="text-gray-700">{cart.quantity}</p>
      <p className="text-gray-700">￥{cart.price}</p>
    </li>
  ))}
</ul>
   <Link to="/">トップ</Link>
    </div>
  );
}
