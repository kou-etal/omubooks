import React, { useEffect, useState } from 'react';
import echo from '../echo';

export function ChatComponent(){
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        echo.channel('chat')
            .listen('.MessageSent', (e) => {
                setMessages((prev) => [...prev, e.message]);
            });

        return () => {
            echo.leave('chat');
        };
    }, []);

    return (
        <div>
            <h2>Chat Messages</h2>
            <ul>
                {messages.map((msg, idx) => (
                    <li key={idx}>{msg}</li>
                ))}
            </ul>
        </div>
    );
};

