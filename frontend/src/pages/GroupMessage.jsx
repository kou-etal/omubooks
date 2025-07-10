import {SendMessage} from '../components/SendMessage';
import {ChatComponent} from '../components/ChatComponent';

export const GroupMessage = () => {
    return (
        <div>
            <h1>Real-time chat</h1>
            <SendMessage />
            <ChatComponent />
        </div>
    );
};
