import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {axiosInstance} from '../api/axiosInstance';

export function LoginFormTest() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.get('/sanctum/csrf-cookie');
      await axiosInstance.post('https://mysns.test/login', { email, password });
      setMessage('ログイン成功');
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      console.error('ログイン失敗', err.response?.data);
      setMessage('ログイン失敗');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="メールアドレス" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="パスワード" />
        <button type="submit">ログイン</button>
      </form>
      <p>{message}</p>
    </div>
  );
}
