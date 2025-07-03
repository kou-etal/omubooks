import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { axiosInstance } from '../api/axiosInstance';
import { PrivateMessage } from '../components/PrivateMessage';
import { MessageHistory } from '../components/MessageHistory';
import AppLayout from '../components/AppLayout'

export const UserChatPage = () => {
  const { targetUserId } = useParams();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axiosInstance.get('/api/user');
        setCurrentUserId(response.data.id); // userID
      } catch (err) {
         if (err.response?.status === 401) {
        alert('ログインしてください');
      }
      else{
      console.error('失敗', err);
    }
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (!currentUserId) {
    return <div>ログインユーザーが取得できませんでした</div>;
  }

  return (
   <AppLayout>
  {/* 全体を囲む */}
  <div className="max-w-2xl w-full mx-auto px-4">
        <MessageHistory
          currentUserId={currentUserId}
          targetUserId={targetUserId}
        />
        <PrivateMessage
          currentUserId={currentUserId}
          targetUserId={targetUserId}
        />

  </div>
</AppLayout>


  );
};
