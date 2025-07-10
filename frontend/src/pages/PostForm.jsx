import { useState } from 'react';
import { axiosInstance } from '../api/axiosInstance';
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppLayout from '../components/AppLayout';

export function PostForm() {
  const [text, setText] = useState('');
  const [imageFiles, setImageFiles] = useState([]); // 配列に変更（複数画像対応）

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files).slice(0, 4); // 最大3枚まで
    setImageFiles(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('text', text);
    imageFiles.forEach(file => {
      formData.append('images[]', file); // Laravel側で images[] で受け取る
    });

    try {
      await axiosInstance.post('/api/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setText('');
      setImageFiles([]);
      alert('Post submitted successfully.');
    } catch (err) {
      if (err.response?.status === 401) {
        alert('Please log in.');
      } else {
        console.error('Failed to submit post.', err);
      }
    }
  };

  return (
    <AppLayout>
      <Card className="max-w-4xl w-full mt-20 mb-8 shadow-md">
        <CardContent className="p-8 space-y-6">
          <h2 className="text-2xl font-bold">New Post</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Please enter your post content."
              rows={4}
              className="resize-none"
            />

            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              multiple // ✅ これが重要
            />

            <Button type="submit" className="w-full">
              Post
            </Button>
          </form>

          {/* プレビューなど追加したければここに表示 */}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
/*import { useState } from 'react';
import { axiosInstance } from '../api/axiosInstance';
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AppLayout from '../components/AppLayout'

export function PostForm() {
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]); // 単一画像対応
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('text', text);
    if (imageFile) formData.append('images[]', imageFile); // Laravel側が配列受けなので[]必須

    try {
      await axiosInstance.post('/api/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setText('');
      setImageFile(null);
      alert('投稿完了！');
    } catch (err) {
      if (err.response?.status === 401) {
        alert('ログインしてください');
      }
      else{
      console.error('投稿失敗', err);
    }
  }
  };

  return (
    <>
    <AppLayout>
 <Card className="max-w-4xl w-full mt-20 mb-8 shadow-md">
  <CardContent className="p-8 space-y-6">
    <h2 className="text-2xl font-bold">新規投稿</h2>

    <form onSubmit={handleSubmit} className="space-y-6">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="投稿内容を入力してください"
        rows={4}
        className="resize-none"
      />

      <Input type="file" accept="image/*" onChange={handleImageChange} />

      <Button type="submit" className="w-full">
        投稿する
      </Button>
    </form>
  </CardContent>
</Card>
 </AppLayout>
</>
  );
}
*/