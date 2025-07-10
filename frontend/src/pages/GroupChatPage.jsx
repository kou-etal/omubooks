import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { axiosInstance } from '../api/axiosInstance';
import { GroupMessage } from '../components/GroupMessage';
import AppLayout from '../components/AppLayout'


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

  if (loading) return <div>Loading...</div>;
  if (!currentUserId) return <div>Failed to retrieve the logged-in user.</div>;

  return (
      <AppLayout>
    <div className="w-full">
      <GroupMessage
        currentUserId={currentUserId}
        groupId={groupId}
      />
    </div>
    </AppLayout>
  );
};
