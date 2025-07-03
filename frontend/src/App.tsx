import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {RegisterForm} from './pages/RegisterForm';
import {LogoutTest} from './pages/LogoutTest';
import {LoginFormTest} from './pages/LoginFormTest';
import {TestApiButton} from './pages/TestApiButton';
import {ProductDetails} from './pages/ProductDetails';
import {CartList} from './pages/CartList';
import {DashBoard} from './pages/DashBoard';
import {UserData} from './pages/UserData';
import {GroupMessage} from './pages/GroupMessage';
import {UserChatPage} from './pages/UserChatPage';
import {User} from './pages/User';
import {UserFollow} from './pages/UserFollow';
import {ProfileEdit} from './pages/ProfileEdit';
import {PostForm} from './pages/PostForm';
import {PostList} from './pages/PostList';
import {FollowingPostList} from './pages/FollowingPostList';
import {VerifyEmail} from './pages/VerifyEmail';
import { MyGroupList } from './pages/MyGroupList';
import { GroupChatPage } from './pages/GroupChatPage';
import { GroupManager } from './pages/GroupManager';


export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PostList/>} />
        <Route path="/products/:id" element={<ProductDetails/>} />
        <Route path="/cart" element={<CartList/>} />
        <Route path="/register" element={<RegisterForm/>} />
        <Route path="/dashboard" element={<VerifyEmail />} />
        <Route path="/email/verify/:id/:hash" element={<VerifyEmail />} />
        <Route path="/login" element={<LoginFormTest/>} />
        <Route path="/logout" element={<LogoutTest/>} />
        <Route path="/user" element={<TestApiButton/>} />
        <Route path="/users" element={<User/>} />
        <Route path="/post" element={<PostForm/>} />
        <Route path="/postlist" element={<PostList/>} />
        <Route path="/followingpostlist" element={<FollowingPostList/>} />
        <Route path="/edit" element={<ProfileEdit/>} />
        <Route path="/follow" element={<UserFollow/>} />
        <Route path="/chat" element={<GroupMessage/>} />
        <Route path="/admin/creategroup" element={< GroupManager/>} />
        <Route path="/my-groups" element={<MyGroupList />} />
        <Route path="/group-chat/:groupId" element={<GroupChatPage />} />
        <Route path="/privatechat/:targetUserId" element={<UserChatPage/>} />
        <Route path="/admin/dashboard" element={<DashBoard/>} />
        <Route path="/admin/users" element={<UserData/>} />
        </Routes>
    </BrowserRouter>
  );
}
//<<Route path="/" element={<RegisterForm />} />

