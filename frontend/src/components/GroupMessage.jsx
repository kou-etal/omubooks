import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { axiosInstance } from '../api/axiosInstance';
import echo from '../echo';

export const GroupMessage = ({ currentUserId, groupId })  => {
  //const { groupId } = useParams();  /group-chat/:groupId から取得
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    // 初期メッセージ取得
    axiosInstance.get(`/api/group-messages/${groupId}`)
      .then(res => setMessages(res.data))
      .catch(err => console.error('履歴取得失敗', err));
  }, [groupId]);

  useEffect(() => {
    const channelName = `group-chat.${groupId}`;

    echo.private(channelName)
      .listen('.GroupMessageSent', (e) => {
        console.log('受信イベント:', e);
        setMessages(prev => [...prev, {
          user_id: e.userId,
          message: e.message
        }]);
      });

    return () => {
      echo.leave(channelName);
    };
  }, [groupId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/api/group-messages/send', {
        group_id: groupId,
        message: input,
      });
      setInput('');
    } catch (err) {
      console.error('送信失敗', err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">グループチャット</h2>

      <ul className="mb-4 space-y-2">
        {messages.map((msg, idx) => (
          <li key={idx} className="bg-gray-100 rounded p-2">
            <strong>{msg.user_id === currentUserId ? 'あなた' : `ユーザー${msg.user_id}`}</strong>: {msg.message}
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="メッセージを入力"
          className="border p-2 flex-1"
        />
        <button type="submit" className="bg-blue-500 text-white px-4">送信</button>
      </form>
    </div>
  );
};
