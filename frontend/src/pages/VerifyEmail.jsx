import { APP_URL } from '../components/config';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../api/axiosInstance';
import AppLayout from '../components/AppLayout';

export function VerifyEmail() {
  const { id, hash } = useParams();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("Verifying...");
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      try {
        const queryString = searchParams.toString();
        const baseUrl = import.meta.env.VITE_APP_URL;
        const url = `${APP_URL}/api/email/verify/${id}/${hash}?${queryString}`;
        const res = await axiosInstance.get(url, { withCredentials: true });
        setMessage(res.data.message);
         setTimeout(()=>{
      navigate('/')
    },1000)
      } catch (e) {
        setMessage("Authentication failed.");
         }
    };
    verify();
  }, []);

return (
  <AppLayout>
    <div className="flex justify-center items-center h-[60vh]">
      <div className="bg-gray-100 text-gray-800 text-xl font-medium px-6 py-4 rounded shadow-sm border border-gray-300">        {message || 'Authentication completed successfully.'}
      </div>
    </div>
  </AppLayout>
);
}
