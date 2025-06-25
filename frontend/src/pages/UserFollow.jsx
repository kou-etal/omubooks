import { useEffect, useState } from 'react';
import { axiosInstance } from '../api/axiosInstance';
import AppLayout from '../components/AppLayout';

export function UserFollow() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followedUserIds, setFollowedUserIds] = useState([]);
  const [search, setSearch] = useState(''); // 🔍 追加

  useEffect(() => {
    axiosInstance.get('/api/followings')
      .then(res => setFollowedUserIds(res.data))
      .catch(err => console.error('フォロー一覧取得失敗', err));
  }, []);

  useEffect(() => {
    axiosInstance.get('/api/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error('ユーザー取得失敗', err))
      .finally(() => setLoading(false));
  }, []);

  const handleFollow = async (userId) => {
    try {
      await axiosInstance.post(`/api/follow/${userId}`);
      setFollowedUserIds(prev => [...prev, userId]);
    } catch (err) {
      console.error('フォロー失敗', err);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await axiosInstance.delete(`/api/unfollow/${userId}`);
      setFollowedUserIds(prev => prev.filter(id => id !== userId));
    } catch (err) {
      console.error('アンフォロー失敗', err);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex justify-center text-center items-center">
  <p className="text-3xl font-light tracking-widest uppercase text-gray-500 animate-pulse">読み込み中...</p>
  </div>
  );

  // 🔍 フィルタリング（部分一致）
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
    <div className="p-4 w-full max-w-4xl mx-auto">
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="ユーザー名で検索"
        className="border p-2 mb-4 w-full"
      />

      <ul className="space-y-4">
        {filteredUsers.map(user => (
          <li key={user.id} className="border p-4 rounded shadow">
            <h2 className="font-semibold">{user.name}</h2>
            {followedUserIds.includes(user.id) ? (
              <button onClick={() => handleUnfollow(user.id)} className="text-red-500">
                フォロー解除
              </button>
            ) : (
              <button onClick={() => handleFollow(user.id)} className="text-blue-500">
                フォロー
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
    </AppLayout>
  );
}
/*import { useEffect, useState } from 'react';
import { axiosInstance } from '../api/axiosInstance';

export function UserFollow() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followedUserIds, setFollowedUserIds] = useState([]);


  useEffect(() => {
  axiosInstance.get('/api/followings')
    .then(res => {
      setFollowedUserIds(res.data); // ex: [2, 5, 9]
    })
    .catch(err => {
      console.error('フォロー一覧取得失敗', err);
    });
}, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get('https://myapp.test/api/users');
        setUsers(res.data.userData);
      } catch (error) {
        console.error('データ取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

const handleFollow = async (userId) => {
    try {
      await axiosInstance.post(`/api/follow/${userId}`);
      setFollowedUserIds(prev => [...prev, userId]);
    } catch (err) {
      console.error('フォロー失敗', err);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await axiosInstance.delete(`/api/unfollow/${userId}`);
      setFollowedUserIds(prev => prev.filter(id => id !== userId));
    } catch (err) {
      console.error('アンフォロー失敗', err);
    }
  };

 if (loading) return (
    <div className="min-h-screen flex justify-center text-center items-center">
  <p className="text-3xl font-light tracking-widest uppercase text-gray-500 animate-pulse">読み込み中...</p>
  </div>
);

  return (
  <div>
    <ul>
      {users.map(user => (
        <li key={user.id} className="border p-4">
          <h2 className="font-semibold">{user.name}</h2>
          {followedUserIds.includes(user.id) ? (
            <button
              onClick={() => handleUnfollow(user.id)}
              className="text-red-500"
            >
              フォロー解除
            </button>
          ) : (
            <button
              onClick={() => handleFollow(user.id)}
              className="text-blue-500"
            >
              フォロー
            </button>
          )}
        </li>
      ))}
    </ul>
  </div>
);


}*/