import { useEffect, useState } from 'react';
import { axiosInstance } from '../api/axiosInstance';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import AppLayout from '../components/AppLayout';

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
   <AppLayout>
 <Card className="max-w-4xl w-full mt-20 mb-8 shadow-md">
  <CardContent className="p-8 space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">プロフィール編集</h2>
      {profile.profile_image && (
        <img
          src={profile.profile_image}
          alt="プロフィール画像"
          className="w-20 h-20 rounded-full object-cover"
        />
      )}
    </div>
    
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>画像選択:</Label>
        <Input type="file" onChange={handleImageChange} />
        <Button
          type="button"
          onClick={handleImageUpload}
          className="mt-1"
          variant="secondary"
        >
          アップロード
        </Button>
      </div>
      <div>
        <Label>名前:</Label>
        <Input name="name" value={profile.name} onChange={handleChange} />
      </div>
      <div>
        <Label>自己紹介:</Label>
        <Textarea name="bio" value={profile.bio} onChange={handleChange} />
      </div>
      <Button type="submit" className="w-full">
        保存
      </Button>
    </form>
  </CardContent>
</Card>
</AppLayout>
  );
}