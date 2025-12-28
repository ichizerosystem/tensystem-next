import Link from "next/link";
import { requireUser } from "@/lib/auth/rbac";
import { logout } from "@/app/login/actions";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await requireUser();

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="mx-auto max-w-6xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <aside className="md:col-span-1 bg-white rounded-lg shadow p-4 space-y-2">
                        <div className="font-bold text-lg mb-2">管理</div>

                        <Link className="block px-3 py-2 rounded hover:bg-gray-100" href="/admin">
                            ダッシュボード
                        </Link>
                        <Link className="block px-3 py-2 rounded hover:bg-gray-100" href="/admin/clients">
                            利用者
                        </Link>
                        <Link className="block px-3 py-2 rounded hover:bg-gray-100" href="/admin/service-days">
                            実績
                        </Link>
                        <Link className="block px-3 py-2 rounded hover:bg-gray-100" href="/admin/reports/monthly">
                            月次集計
                        </Link>
                        <Link className="block px-3 py-2 rounded hover:bg-gray-100" href="/kiosk">
                            kiosk
                        </Link>

                        <div className="pt-2 border-t">
                            <form action={logout}>
                                <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-red-600">
                                    Logout
                                </button>
                            </form>
                        </div>
                    </aside>

                    <main className="md:col-span-4">{children}</main>
                </div>
            </div>
        </div>
    );
}
