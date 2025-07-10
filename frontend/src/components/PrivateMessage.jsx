import { useParams ,Link} from 'react-router-dom';
import { useEffect, useState } from 'react';
import {axiosInstance} from '../api/axiosInstance';
import axios from 'axios';
import echo from '../echo'
import Pusher from 'pusher-js';

export const PrivateMessage=({ currentUserId, targetUserId })=>{
   /* const {currentUserId} =props;
    const {targetUserId} = useParams();*/console.log(currentUserId);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    const user1 = Math.min(currentUserId, targetUserId);
    const user2 = Math.max(currentUserId, targetUserId);


 useEffect(() => {
  const channelName = `private-chat.${user1}.${user2}`;

  axiosInstance.get('/sanctum/csrf-cookie',{
    withCredentials: true,
  }).then(() => {
    echo.private(channelName)
      .listen('.PrivateMessageSent', (e) => {
         console.log('イベント受信:', e);
        setMessages((prev) => [
      ...prev,
      {
        message: e.message,
        from_user_id: e.from_user_id,
        to_user_id: e.to_user_id,
      },
    ]);
      });
  });

  return () => {
    echo.leave(channelName);
  };
}, [user1, user2]);



    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axiosInstance.post('/api/send-private-message',{input,targetUserId});
            if (res.status === 200) {
                setInput('');
            }
        } catch (err) {
            console.error('送信失敗', err);
        }
    };


 return (
<div className="flex flex-col h-screen w-full max-w-2xl mx-auto">
  
  {/* チャット本体全体をスクロール対象にする */}
  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50">
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

  {/* 入力フォーム：ここは親の h-screen に sticky させる */}
  <div className="sticky bottom-0 bg-white z-10 border-t">
    <form onSubmit={handleSubmit} className="px-4 py-3 flex gap-2 max-w-2xl mx-auto">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter your message"
        className="flex-1 border rounded px-3 py-2 text-sm"
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
        Send
      </button>
    </form>
  </div>
</div>




    );
}
/*
    return (
        <div>
            <h2>Chat with User {targetUserId}</h2>
            <ul>
                {messages.map((msg, idx) => (
                    <li key={idx}>{msg}</li>
                ))}
            </ul>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="メッセージを入力"
                />
                <button type="submit">送信</button>
            </form>
        </div>
    );
}*/

 /* axios.post('https://myapp.test/my-broadcast-auth', {
  channel_name: 'private-chat.1.2',
  socket_id: '1234.5678',
}, {
  withCredentials: true,
  headers: {
    'X-XSRF-TOKEN': decodeURIComponent(
      document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1] || ''
    ),
  }
})
.then(res => console.log('OK', res))
.catch(err => console.error('NG', err.response));
        });*/

    /*echo.private(`chat.${currentUserId}`)
      .listen('.PrivateMessageSent', (e) => {
        setMessages((prev) => [...prev, e.message]);
      });
  });

  return () => {
    echo.leave(`chat.${currentUserId}`);
  };
}, [currentUserId]);*/