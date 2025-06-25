import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
export function DashBoard(){

    return(
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 pb-2 pl-2">
          管理者ページ
        </h1>

        <div className="pl-4">
          <Link
            to="/admin/creategroup"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded shadow"
          >
            グループ作成
          </Link>
        </div>
      </div>
    </AppLayout>
    );
}