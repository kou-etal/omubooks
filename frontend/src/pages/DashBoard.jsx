import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { Card, CardContent } from "@/components/ui/card";

export function DashBoard() {
  const menuItems = [
    {
      title: "Identity Verification Requests",
      description: "Review and approve pending identity verification submissions.",
      to: "/admin/verify"
    },
    {
      title: "Campaign Submission Reviews",
      description: "Review new crowdfunding campaign submissions before they go live.",
      to: "/admin/notify"
    },
    {
      title: "Payout Records",
      description: "View and manage payout requests for completed campaigns.",
      to: "/admin/pay"
    }
  ];

  return (
    <AppLayout>
      <div className="w-full max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-center text-blue-900 mb-12">
          Admin Panel
        </h1>

        {/* サムスン対策：横スク抑止のため子にmin-w-0を渡す */}
        <div className="grid gap-6">
          {menuItems.map((item, idx) => (
            <Link
              key={idx}
              to={item.to}
              aria-label={item.title}
              className="block min-w-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-lg"
            >
              {/* hover拡大はLinkではなくCardに付けてはみ出し防止 */}
              <Card className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-lg transition-all duration-200 transform-gpu hover:scale-[1.02] overflow-hidden">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold break-words">{item.title}</h2>
                  <p className="text-sm text-blue-100 mt-2 break-words">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
