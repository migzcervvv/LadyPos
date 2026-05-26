// src/features/profile/ProfilePage.jsx
import { useAuth } from "../../../shared/hooks/AuthContext.jsx";
import { ProfileCard } from "../components/ProfileCard.jsx";
import { SecurityCard } from "../components/SecurityCard.jsx";
import { AdminUserTable } from "../components/AdminUserTable.jsx";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <div
      className="min-h-screen px-4 py-6"
      style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold">Account</h1>
            <p
              className="text-sm mt-0.5"
              style={{ color: "var(--color-muted)" }}
            >
              Manage your account settings and security
            </p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Profile & Security */}
        <div className="max-w-3xl mx-auto space-y-6">
          <ProfileCard />
          <SecurityCard />
        </div>

        {/* Admin section */}
        {user.role === "admin" && (
          <div className="mt-10 max-w-6xl">
            <AdminUserTable />
          </div>
        )}
      </div>
    </div>
  );
}
