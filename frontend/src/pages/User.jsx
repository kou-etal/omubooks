import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { axiosInstance } from '../api/axiosInstance';
import AppLayout from '../components/AppLayout'

export function User() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchData = async () => {
  try {
    const res = await axiosInstance.get('/api/followings/users');
    setUsers(res.data);
  } catch (err) {
    if (err.response?.status === 401) {
      alert('Please log in.');
    } else {
      console.error('ユーザー取得失敗:', err);
    }
  } finally {
    setLoading(false);
  }
};

    fetchData();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex justify-center text-center items-center">
     <p className="text-3xl font-light tracking-widest uppercase text-gray-500 animate-pulse">Loading...</p>
    </div>
  );

  return (
    <AppLayout>
   <div className="w-full px-4">
    <div className="max-w-screen-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Direct Message</h1>
      <div className="h-px bg-gray-300 mb-16" />
      {users.length === 0 ? (
        <p className="text-center text-gray-500">	You’re not following anyone yet.</p>
      ) : (
        <ul className="grid grid-cols-3 gap-4">
          {users.map(user => (
            <li key={user.id} className="border p-4">
              <h2 className="font-semibold">
                <Link to={`/privatechat/${user.id}`}>{user.name}</Link>
              </h2>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
    </AppLayout>
      );
}
