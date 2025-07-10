import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { axiosInstance } from '../api/axiosInstance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '../components/AppLayout';

export function LogoutTest() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const logoutUser = async () => {
      try {
        await axiosInstance.post('/logout');
        setMessage('Log out successful.');
      } catch (err) {
        console.error('ログアウト失敗', err.response?.data);
        setMessage('Logout failed.');
      }
    };

    logoutUser();
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-xl shadow-md">
        <CardContent className="p-8 space-y-6 text-center">
          <h2 className="text-2xl font-bold">{message}</h2>
          <Button asChild className="w-full">
            <Link to="/">Top</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
