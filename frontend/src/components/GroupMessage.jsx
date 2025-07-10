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
 <div className="w-full flex flex-col max-w-2xl mx-auto h-screen relative">
      {/* メッセージ表示部 */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50">
        <h2 className="text-xl font-bold mb-2">Group Chat</h2>

        {messages.map((msg, idx) => {
          const isSelf = msg.user_id === currentUserId;
          return (
            <div key={idx} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
              <span className="text-xs text-gray-500 mb-1">
                {isSelf ? 'You' : `User${msg.user_id}`}
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

      {/* 入力フォーム（下固定） */}
      <form
        onSubmit={handleSubmit}
        className="w-full flex gap-2 border-t bg-white p-4 sticky bottom-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your message"
          className="border p-2 flex-1 rounded"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 rounded">
          送信
        </button>
      </form>
    </div>
  );
};
