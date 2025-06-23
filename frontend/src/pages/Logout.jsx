import { useState ,useEffect} from 'react';
import { Link } from 'react-router-dom'
import axios from 'axios';
//import {api} from '../utils/api.js';
export function Logout(){
const [message, setMessage] = useState("");

    useEffect(() => {
        const logoutUser = async () => {
            try {
                await axios.get('https://mysns.test/sanctum/csrf-cookie', { withCredentials: true });
                const res = await axios.post('https://mysns.test/logout', {}, { withCredentials: true }
            );
                setMessage(res.data.message);
            } catch (err) {
                console.error('ログアウトできませんでした', err.response?.data);
                setMessage('ログアウトできませんでした');
            }
        };

        logoutUser();
    }, []);

return(
    <div>
    <p>{message}</p>
    <Link to="/">トップページ</Link>
    </div>
);
}

