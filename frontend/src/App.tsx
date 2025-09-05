import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RegisterForm from './pages/RegisterForm';

import LoginFormTest from './pages/LoginFormTest';

import LandingPage from './pages/LandingPage';
import ProfileEditPage from './pages/ProfileEditPage';
import ListingsIndexPage from './pages/ListingsIndexPage';
import ListingCreateForm from './pages/ListingCreateForm';
import {ListingDetailPage} from './pages/ListingDetailPage';
import {TradesListPage} from './pages/TradesListPage';
import {TradeDMPage} from './pages/TradeDMPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* ユーザー系 */}
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<LoginFormTest />} />
        <Route path="/profile/edit" element={<ProfileEditPage />} />

        {/* 出品関連 */}
        <Route path="/listings" element={<ListingsIndexPage />} />
        <Route path="/listings/new" element={<ListingCreateForm />} />
    
        <Route path="/listings/:id" element={<ListingDetailPage />} />

        {/* 取引・DM */}
        <Route path="/trades" element={<TradesListPage />} />
        <Route path="/trades/:id/messages" element={<TradeDMPage />} />

        {/* 404ページ */}
        <Route path="*" element={<NotFound />} />
        </Routes>
    </BrowserRouter>
  );
  function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-4xl font-bold text-blue-900 mb-4">404 Not Found</h1>
      <p className="text-gray-600">お探しのページは見つかりませんでした。</p>
    </div>
  );
}
}
//<<Route path="/" element={<RegisterForm />} />
/*<Route path="/" element={<PostList/>} />
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
        <Route path="/admin/users" element={<UserData/>} />*/
