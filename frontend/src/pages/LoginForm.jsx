import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AppLayout from '../components/AppLayout';
import { axiosInstance } from '../api/axiosInstance';
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
    await axiosInstance.get('/sanctum/csrf-cookie',{
                withCredentials: true
            });
    const res=await axiosInstance.post("/login", {
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
   <AppLayout>
  <Card className="max-w-4xl w-full mt-20 mb-8 shadow-md">
    <CardContent className="p-8 space-y-6">
      <h2 className="text-2xl font-bold">Log in</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
        />

        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />

        <Button type="submit" className="w-full">
          Log in
        </Button>
      </form>
    </CardContent>
  </Card>
</AppLayout>

  );

}
