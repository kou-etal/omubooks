import { Link } from "react-router-dom";

export default function MobileMenu() {
  return (
    <nav className="bg-slate-800 text-white flex flex-wrap justify-around items-center py-2 border-b shadow-sm">
      <Link to="/" className="text-xs px-2 py-1">🏠</Link>
      <Link to="/post" className="text-xs px-2 py-1">➕</Link>
      <Link to="/follow" className="text-xs px-2 py-1">🔍</Link>
      <Link to="/users" className="text-xs px-2 py-1">💬</Link>
      <Link to="/my-groups" className="text-xs px-2 py-1">👥</Link>
      <Link to="/edit" className="text-xs px-2 py-1">✏️</Link>
      <Link to="/login" className="text-xs px-2 py-1">🚪</Link>
    </nav>
  );
}