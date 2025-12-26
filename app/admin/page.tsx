import { verifySession } from '@/lib/auth/session';
import { logout } from '@/app/login/actions';

export default async function AdminPage() {
  const session = await verifySession();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <p><strong>User ID:</strong> {session.userId}</p>
        <p><strong>Role:</strong> {session.role}</p>
      </div>

      <form action={logout}>
        <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          Logout
        </button>
      </form>
    </div>
  );
}
