import { Link } from 'react-router-dom';
export function DashBoard(){

    return(
<div>
   <Link to="/admin/users">ユーザー一覧</Link>
   <Link to="/login">ログイン</Link>
   <Link to="/logout">ログアウト</Link>
   <Link to="/cart">カート</Link>
</div>
    );
}