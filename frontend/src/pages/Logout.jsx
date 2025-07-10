import { useState ,useEffect} from 'react';
import { Link } from 'react-router-dom'
import axios from 'axios';
import { axiosInstance } from '../api/axiosInstance';
//import {api} from '../utils/api.js';
export function Logout(){
const [message, setMessage] = useState("");

    useEffect(() => {
        const logoutUser = async () => {
            try {
                await axiosInstance.get('/sanctum/csrf-cookie', { withCredentials: true });
                const res = await axiosInstance.post('/logout', {}, { withCredentials: true }
            );
                setMessage(res.data.message);
            } catch (err) {
                console.error('ログアウトできませんでした', err.response?.data);
                setMessage('Log out failed.');
            }
        };

        logoutUser();
    }, []);

return(
    <div>
    <p>{message}</p>
    <Link to="/">Top</Link>
    </div>
);
}

