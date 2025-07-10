import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {AdminLink} from '../components/AdminLink';
import { axiosInstance } from '../api/axiosInstance';

export function UserData() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get('/api/users');
        setUsers(res.data.userData);
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
      <h1 className="text-2xl font-bold mb-4">User List</h1>
      <div className="h-px bg-gray-300 mb-16"/>
<ul className="grid grid-cols-3 gap-4">
  {users.map(user => (
    <li key={user.id} className="border p-4">
      <h2 className="font-semibold">{user.name}</h2>
      <p>Follow</p>
      <p>Unfollow</p>
    </li>
  ))}
</ul>
    </div>
  );
}

