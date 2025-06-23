import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { axiosInstance } from '../api/axiosInstance';

export function MyGroupList() {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    axiosInstance.get('/api/my-groups')
      .then(res => setGroups(res.data))
      .catch(err => console.error('グループ取得失敗:', err));
  }, []);

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">参加中のグループ</h2>
      <ul className="space-y-2">
        {groups.map(group => (
          <li key={group.id} className="border rounded p-3 shadow-sm hover:bg-gray-100">
            <Link to={`/group-chat/${group.id}`} className="text-blue-600 hover:underline">
              {group.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
