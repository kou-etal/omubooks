import { useEffect, useState } from 'react';
import { axiosInstance } from '../api/axiosInstance';

export const MessageHistory = ({ currentUserId, targetUserId }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!targetUserId) return;

    axiosInstance.get(`/api/messages/${targetUserId}`)
      .then(res => setMessages(res.data))
      .catch(err => console.error('履歴取得失敗', err));
  }, [targetUserId]);

  return (
    <div>
      <h3>チャット履歴</h3>
      <ul>
        {messages.map((msg, idx) => (
          <li key={idx}>
            <strong>
              {msg.from_user_id === currentUserId ? '自分' : `ユーザー${msg.from_user_id}`}
            </strong>
            ：{msg.message}
          </li>
        ))}
      </ul>
    </div>
  );
};


