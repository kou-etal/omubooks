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
<div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50 w-full max-w-2xl mx-auto">
  {messages.map((msg, idx) => {
    const isSelf = msg.from_user_id === currentUserId;
    return (
      <div key={idx} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
        <span className="text-xs text-gray-500 mb-1">
          {isSelf ? 'You' : `User${msg.from_user_id}`}
        </span>
        <div
          className={`max-w-md px-4 py-2 rounded-lg shadow text-sm break-words ${
            isSelf
              ? 'bg-blue-500 text-white self-end'
              : 'bg-gray-200 text-black self-start'
          }`}
        >
          {msg.message}
        </div>
      </div>
    );
  })}
</div>

  );
};


