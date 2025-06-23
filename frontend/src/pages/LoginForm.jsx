import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
    await axios.get('https://mysns.test/sanctum/csrf-cookie',{
                withCredentials: true
            });
    const res=await axios.post("https://mysns.test/login", {
    email,
    password,
    password_confirmation: password
    
  },
  {
                withCredentials: true
            }
  )
    setMessage(res.data.message);
    setTimeout(()=>{
      navigate('/')
    },1000)
  }catch (err) {
      console.error('ログイン失敗', err.response?.data)
  }
};

  return (
    <div>
    <form onSubmit={handleSubmit}>
      <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="メールアドレス"/>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="パスワード"/>
      <button type="submit">ログイン</button>
    </form>
    </div>
  );

}
