import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {axiosInstance} from '../api/axiosInstance';

export const CartAddButton=(props) =>{
  const {productId}=props;
  const [quantity, setQuantity] = useState(1);
   const [message, setMessage] = useState("");
   const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleAddToCart = async () => {
    try {
      const res=await axiosInstance.post(`/api/cart/add/${productId}`, {quantity});
      setMessage('追加しました');
      setCart(res.data.cart);
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      console.error('カート追加エラー:', error);
      setMessage('失敗しました');
      setTimeout(() => navigate('/'), 1000);
    };
  };

  return (
    <div className="">
      <button onClick={decreaseQuantity}>-</button>
      <span>{quantity}</span>
      <button onClick={increaseQuantity}>+</button>
      <button onClick={handleAddToCart}>カートに追加</button>
      <p>{message}</p>
    </div>
  );
};
