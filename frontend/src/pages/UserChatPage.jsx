import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { axiosInstance } from '../api/axiosInstance';
import { PrivateMessage } from '../components/PrivateMessage';
import { MessageHistory } from '../components/MessageHistory';

export const UserChatPage = () => {
  const { targetUserId } = useParams();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axiosInstance.get('https://mysns.test/api/user');
        setCurrentUserId(response.data.id); // userID
      } catch (error) {
        console.error('ユーザー情報取得失敗:', error);
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
    <div>
    <MessageHistory
      currentUserId={currentUserId}
      targetUserId={targetUserId}
    />
    <PrivateMessage
      currentUserId={currentUserId}
      targetUserId={targetUserId}
    />
    </div>
  );
};
