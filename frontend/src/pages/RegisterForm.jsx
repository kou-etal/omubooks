import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {axiosInstance} from '../api/axiosInstance';

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
    await axiosInstance.get('https://mysns.test/sanctum/csrf-cookie');
    const res=await axiosInstance.post("https://mysns.test/api/register", {
    name,
    email,
    password,
    password_confirmation: password
  }
  )
    setMessage(res.data.message);
    console.log(res.data.message);
  }catch (err) {
      console.error('登録失敗:', err.response?.data)
  }
};

  return (
    <div>
    <h1>テスト</h1>
    <form onSubmit={handleSubmit}>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="ユーザーネーム"/>
      <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="メールアドレス"/>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="パスワード"/>
      <button type="submit">登録</button>
    </form>
     {/* ← ここでメッセージ表示！ */}
    {message && <p style={{ color: 'green' }}>{message}</p>}
    </div>
  );

}
