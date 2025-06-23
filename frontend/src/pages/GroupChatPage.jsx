import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { axiosInstance } from '../api/axiosInstance';
import { GroupMessage } from '../components/GroupMessage';


export const GroupChatPage = () => {
  const { groupId } = useParams(); // URLのパラメータからgroupId取得
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axiosInstance.get('/api/user');
        setCurrentUserId(response.data.id);
      } catch (error) {
        console.error('ユーザー情報取得失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  if (loading) return <div>読み込み中...</div>;
  if (!currentUserId) return <div>ログインユーザーが取得できませんでした</div>;

  return (
    <div>
      <GroupMessage
        currentUserId={currentUserId}
        groupId={groupId}
      />
    </div>
  );
};
