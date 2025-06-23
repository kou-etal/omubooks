import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ナビゲーションバー */}
      <nav className="h-14 bg-white border-b flex items-center justify-around px-4">
        <Link to="/" className="text-sm font-medium">
          🏠 ホーム
        </Link>

        <Link to="/post" className="text-sm font-medium">
          ➕ 投稿
        </Link>

        {/* 💬 チャットドロップダウン */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-sm font-medium">
              💬 チャット ▼
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link to="/chat">全体チャット</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/users">個人チャット</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/my-groups">グループチャット</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 👤 プロフィールドロップダウン */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-sm font-medium">
              👤 プロフィール ▼
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link to="/edit">プロフィール編集</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/follow">フォロー一覧</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/logout">ログアウト</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>

      {/* ページごとの中身 */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
