import { useState } from 'react';
import {axiosInstance} from '../api/axiosInstance';

export function SendMessage(){
    const [message, setMessage] = useState("");
    const handleSubmit= async (e) => {
    e.preventDefault();
    try {
    await axiosInstance.post('/api/send-message', {message});
    } catch (err) {
      console.error('送信失敗', err.response?.data);
    }
  };


return(
    <div>
    <form onSubmit={handleSubmit}>
        <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="message" />
        <button type="submit">Send</button>
        </form>
    </div>
);
};
