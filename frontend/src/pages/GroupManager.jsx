import { useEffect, useState } from 'react';
import { axiosInstance } from '../api/axiosInstance';

export function GroupManager() {
  const [groupName, setGroupName] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [createdGroupId, setCreatedGroupId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // ユーザー一覧を取得
  useEffect(() => {
    axiosInstance.get('/api/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error('ユーザー取得失敗', err));
  }, []);

  // チェックボックスの変更
  const handleUserToggle = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // グループ作成＆ユーザー追加
  const handleCreateGroup = async () => {
    try {
      const groupRes = await axiosInstance.post('/api/groups', { name: groupName });
      const groupId = groupRes.data.group.id;
      setCreatedGroupId(groupId);

      // 選択されたユーザーをグループに追加
      for (const userId of selectedUsers) {
        await axiosInstance.post(`/api/groups/${groupId}/add-user`, { user_id: userId });
      }

      setSuccessMessage(`「${groupName}」グループを作成し、${selectedUsers.length}人を追加しました`);
      setGroupName('');
      setSelectedUsers([]);
    } catch (err) {
      console.error('グループ作成またはユーザー追加失敗', err);
      alert('失敗しました');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">グループ作成</h2>

      <input
        type="text"
        placeholder="グループ名"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        className="border p-2 w-full mb-4"
      />

      <h3 className="font-semibold mb-2">ユーザーを選択:</h3>
      <div className="space-y-2 max-h-60 overflow-y-auto border p-2 rounded">
        {users.map(user => (
          <label key={user.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedUsers.includes(user.id)}
              onChange={() => handleUserToggle(user.id)}
            />
            <span>{user.name}</span>
          </label>
        ))}
      </div>

      <button
        onClick={handleCreateGroup}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        グループ作成
      </button>

      {successMessage && (
        <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}
    </div>
  );
}
