import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import {AdminLink} from './AdminLink';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">

      <nav className="h-14 bg-slate-800 text-white border-b flex items-center justify-around px-4">
        <Link to="/" className="text-sm font-medium">
          🏠 ホーム
        </Link>

        <Link to="/post" className="text-sm font-medium">
          ➕ 投稿
        </Link>

        <Link to="/follow" className="text-sm font-medium">
        🔍 ユーザー検索
        </Link>

        <AdminLink></AdminLink>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-sm font-medium">
              💬 チャット ▼
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-blue-700 text-white">
            <DropdownMenuItem asChild>
              <Link to="/users" className="hover:bg-gray-700">個人チャット</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/my-groups" className="hover:bg-gray-700">グループチャット</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-sm font-medium">
              👤 プロフィール ▼
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-blue-700 text-white">
            <DropdownMenuItem asChild>
            <Link to="/register" className="hover:bg-blue-700">新規登録</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
            <Link to="/login" className="hover:bg-blue-700">ログイン</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/edit" className="hover:bg-blue-700">プロフィール編集</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/follow" className="hover:bg-blue-700">フォロー一覧</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/logout" className="hover:bg-blue-700">ログアウト</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>

      <main className="flex-1 flex justify-center items-start">{children}</main>
      <footer className="text-center text-sm text-gray-500 py-4 border-t">
    © {new Date().getFullYear()} MySNS. All rights reserved.
  </footer>
    </div>
  );
}

