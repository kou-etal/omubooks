import { useEffect, useState } from 'react';
import { axiosInstance } from '../api/axiosInstance';
import AppLayout from '../components/AppLayout'
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ja';

dayjs.extend(relativeTime);
dayjs.locale('en');


export function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = () => {
    axiosInstance.get('/api/posts')
      .then(res => {
        setPosts(res.data);
         setLoading(false);
      })
      .catch(err => console.error('取得失敗', err));
  };

  const toggleLike = async (postId) => {
    try {
      await axiosInstance.post(`/api/posts/${postId}/like`);
      // 再取得（or ローカル更新でもOK）
      fetchPosts();
       } catch (err) {
      console.error('いいね失敗', err);
    }
  };

   if (loading) return (
    <div className="min-h-screen flex justify-center text-center items-center">
      <p className="text-3xl font-light tracking-widest uppercase text-gray-500 animate-pulse">Loading...</p>
    </div>
  );


  return (

<AppLayout>
  <div className="w-full max-w-2xl mx-auto space-y-6 p-4">
    <h2 className="text-2xl font-bold mb-4">Post List</h2>
    <div className="h-px bg-gray-300 mb-16" />

    {posts.map(post => (
      <div key={post.id} className="border rounded p-4 shadow-sm">
        {/* ユーザー情報 */}
        <div className="flex items-center mb-2">
          <img
            src={post.user.profile_image}
            alt="profile"
            className="w-10 h-10 rounded-full object-cover mr-2"
          />
          <span className="font-semibold">{post.user.name}</span>
        </div>

        {/* 本文 */}
        <p className="mb-2">{post.body}</p>

        {/* 画像 */}
        {post.images.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {post.images.map(img => (
              <img
                key={img.id}
                src={img.path}
                alt="images"
                className="w-32 h-32 object-cover rounded"
              />
            ))}
          </div>
        )}

        {/* いいね */}
        <div className="flex items-center text-sm text-gray-600">
          <button
            onClick={() => toggleLike(post.id)}
            className="text-2xl mr-2"
          >
            {post.liked_by_me ? '❤️' : '♡'}
          </button>
          <span className="mr-4">{post.likes_count}</span>
          <span>{dayjs(post.created_at).fromNow()}</span>
        </div>
      </div>
    ))}
  </div>
</AppLayout>


  );
}

/*import { useEffect, useState } from 'react';
import { axiosInstance } from '../api/axiosInstance';
import AppLayout from '../components/AppLayout'

export function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = () => {
    axiosInstance.get('/api/posts')
      .then(res => {
        setPosts(res.data);
         setLoading(false);
      })
      .catch(err => console.error('取得失敗', err));
  };

  const toggleLike = async (postId) => {
    try {
      await axiosInstance.post(`/api/posts/${postId}/like`);
      // 再取得（or ローカル更新でもOK）
      fetchPosts();
    } catch (err) {
      console.error('いいね失敗', err);
    }
  };

   if (loading) return (
    <div className="min-h-screen flex justify-center text-center items-center">
      <p className="text-3xl font-light tracking-widest uppercase text-gray-500 animate-pulse">読み込み中...</p>
    </div>
  );


  return (
    <AppLayout>
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      <h2 className="text-2xl font-bold mb-4">投稿一覧</h2>
       <div className="h-px bg-gray-300 mb-16" />

      {posts.map(post => (
        <div key={post.id} className="border rounded p-4 shadow-sm">
          {/* ユーザー情報 *//*}
          <div className="flex items-center mb-2">
            <img
              src={post.user.profile_image}
              alt="プロフィール画像"
              className="w-10 h-10 rounded-full object-cover mr-2"
            />
            <span className="font-semibold">{post.user.name}</span>
          </div>

          {/* 本文 *//*}
          <p className="mb-2">{post.body}</p>

          {/* 画像 *//*}
          {post.images.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {post.images.map(img => (
                <img
                  key={img.id}
                  src={img.path}
                  alt="投稿画像"
                  className="w-32 h-32 object-cover rounded"
                />
              ))}
            </div>
          )}

          {/* いいねボタンと数 *//*}
          <div className="flex items-center">
            <button
              onClick={() => toggleLike(post.id)}
              className="text-2xl mr-2"
            >
              {post.liked_by_me ? '❤️' : '♡'}
            </button>
            <span>{post.likes_count}</span>
          </div>
        </div>
      ))}
    </div>
    </AppLayout>
  );
}*/