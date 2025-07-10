import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { AdminLink } from "./AdminLink";
import MobileMenu from "./MobileMenu";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">

      {/* PC用ナビ（そのまま） */}
      <nav className="h-14 bg-slate-800 text-white border-b items-center justify-around px-4 hidden md:flex">
        <Link to="/" className="text-sm font-medium">🏠 Home</Link>
        <Link to="/post" className="text-sm font-medium">➕ Posts</Link>
        <Link to="/follow" className="text-sm font-medium">🔍 Search Users</Link>
        <AdminLink />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-sm font-medium">💬 Chat ▼</Button>
          </DropdownMenuTrigger>
           <DropdownMenuContent className="bg-blue-700 text-white">
            <DropdownMenuItem asChild>
              <Link to="/users" className="hover:bg-gray-700">Private Chat</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/my-groups" className="hover:bg-gray-700">Group Chat</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-sm font-medium">👤 Profile ▼</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-blue-700 text-white">
            <DropdownMenuItem asChild>
              <Link to="/register" className="hover:bg-blue-700">Sign up</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/login" className="hover:bg-blue-700">Log in</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/edit" className="hover:bg-blue-700">Edit profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/logout" className="hover:bg-blue-700">Log out</Link>
               </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>

      {/* スマホ用ナビ（上部に常時表示） */}
      <div className="md:hidden">
        <MobileMenu />
      </div>

      <main className="flex-1 flex justify-center items-start">
        {children}
      </main>

      <footer className="text-center text-sm text-gray-500 py-4 border-t">
        © {new Date().getFullYear()} MySNS. All rights reserved.
      </footer>
    </div>
  );
}

