
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../api/axiosInstance';

export function VerifyEmail() {
  const { id, hash } = useParams();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("確認中...");
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      try {
        const queryString = searchParams.toString();
        const url = `https://mysns.test/api/email/verify/${id}/${hash}?${queryString}`;
        const res = await axiosInstance.get(url, { withCredentials: true });
        setMessage(res.data.message);
         setTimeout(()=>{
      navigate('/')
    },1000)
      } catch (e) {
        setMessage("認証に失敗しました。");
      }
    };
    verify();
  }, []);

  return <h1>{message}</h1>;
}
