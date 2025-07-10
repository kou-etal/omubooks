import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { axiosInstance } from '../api/axiosInstance';
import AppLayout from '../components/AppLayout'

export function MyGroupList() {
  const [groups, setGroups] = useState([]);
   const [loading, setLoading] = useState(true);

  useEffect(() => {
  axiosInstance.get('/api/my-groups')
    .then(res => {
      setGroups(res.data);
      setLoading(false);
    })
    .catch(err => {
      if (err.response?.status === 401) {
        alert('Please login.');
      } else {
        console.error('グループ取得失敗:', err);
      }
      setLoading(false); // エラー時でも読み込み中を解除
    });
}, []);
 if (loading) return (
    <div className="min-h-screen flex justify-center text-center items-center">
      <p className="text-3xl font-light tracking-widest uppercase text-gray-500 animate-pulse">Loading...</p>
    </div>
  );
  return (
   <AppLayout>
  <div className="w-full max-w-2xl px-4 py-12">
    <h2 className="text-2xl font-bold mb-6 text-center">Your Groups</h2>
    <div className="h-px bg-gray-300 mb-8" />

    {groups.length === 0 ? (
      <p className="text-center text-gray-500">You haven’t joined any groups yet.</p>
    ) : (
      <ul className="space-y-4">
        {groups.map(group => (
          <li
            key={group.id}
            className="border rounded px-4 py-3 shadow-sm hover:bg-gray-100 transition"
          >
            <Link
              to={`/group-chat/${group.id}`}
              className="text-blue-600 hover:underline font-medium"
            >
              {group.name}
               </Link>
          </li>
        ))}
      </ul>
    )}
  </div>
</AppLayout>


  );
}
