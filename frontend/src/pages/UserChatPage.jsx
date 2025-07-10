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
        alert('Please log in.');
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
    return <div>Loading...</div>;
  }

  if (!currentUserId) {
    return <div>Failed to retrieve the logged-in user.

</div>;
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
