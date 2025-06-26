import { useParams ,Link} from 'react-router-dom';
import { useEffect, useState } from 'react';
import {CartAddButton} from '../components/CartAddButton';
import axios from 'axios';
import { axiosInstance } from '../api/axiosInstance';



export function ProductDetails(){
   const { id } = useParams();
   const [product, setProduct] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(`/api/products/${id}`);
        setProduct(res.data.product);
      } catch (error) {
        console.error('データ取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex justify-center text-center items-center">
  <p className="text-3xl font-light tracking-widest uppercase text-gray-500 animate-pulse">読み込み中...</p>
  </div>
);

return (
    <div>
    <h1>{product.name}</h1>
    <p>{product.price}</p>
    <CartAddButton productId={product.id} />
    </div>
)

}
 