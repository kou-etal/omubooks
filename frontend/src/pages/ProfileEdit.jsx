import { useEffect, useState } from 'react';
import { axiosInstance } from '../api/axiosInstance';

export function ProfileEdit() {
  const [profile, setProfile] = useState({ name: '', bio: '', profile_image: '' });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    axiosInstance.get('/api/profile')
      .then(res => setProfile(res.data))
      .catch(err => console.error('取得失敗', err));
  }, []);

  const handleChange = e => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = e => {
    setImageFile(e.target.files[0]);
  };

 const handleImageUpload = async () => {
  if (!imageFile) return;
  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    //アップロード
    await axiosInstance.post('/api/profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    //再取得
    const res = await axiosInstance.get('/api/profile');
    setProfile(res.data);

    console.log('アップロード成功:', res.data);
  } catch (err) {
    console.error('画像アップロード失敗', err);
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/api/profile', profile);
      alert('プロフィール更新完了！');
    } catch (err) {
      console.error('更新失敗', err);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">プロフィール編集</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>画像選択:</label>
          <input type="file" onChange={handleImageChange} />
          <button type="button" onClick={handleImageUpload} className="ml-2 bg-gray-300 px-2 py-1">アップロード</button>
        </div>
        <div>
          <label>名前:</label>
          <input name="name" value={profile.name} onChange={handleChange} className="border w-full" />
        </div>
        <div>
          <label>自己紹介:</label>
          <textarea name="bio" value={profile.bio} onChange={handleChange} className="border w-full" />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">保存</button>
      </form>

     {profile.profile_image && (
  <div className="mt-4">
    <p>現在の画像：</p>
    <img
      src={profile.profile_image}
      alt="プロフィール画像"
      className="w-32 h-32 rounded-full object-cover"
    />
  </div>
)}
    </div>
  );
}