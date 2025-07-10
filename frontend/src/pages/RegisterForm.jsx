import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {axiosInstance} from '../api/axiosInstance';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AppLayout from '../components/AppLayout';

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try{
    await axiosInstance.get('/sanctum/csrf-cookie');
    const res=await axiosInstance.post("/api/register", {
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
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
  }
};

  return (
  <AppLayout>
  <div className="flex justify-center py-16 px-4">
    <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-center">Sign Up</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="User name"
          className="w-full border p-2 rounded bg-blue-100"
        />
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="w-full border p-2 rounded bg-blue-100"
        />
                {errors.email && <p className="text-red-500 text-sm">{errors.email[0]}</p>}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full border p-2 rounded bg-blue-100"
        />
            {errors.password && <p className="text-red-500 text-sm">{errors.password[0]}</p>}
        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
        >
          Register
        </button>
      </form>

      {message && <p className="text-green-600 text-center">{message}</p>}
    </div>
  </div>
</AppLayout>

  );

}
