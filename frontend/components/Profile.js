"use client";
import { useAuthStore } from "@/store/useAuthStore";

export default function Profile({ onEdit, onLogout }) {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-40 h-2 bg-purple-100 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-gradient-to-r from-purple-400 via-purple-600 to-blue-400 animate-pulse rounded-full w-3/4"></div>
        </div>
        <span className="text-purple-700 font-semibold text-lg tracking-wide">
          Loading your profile...
        </span>
      </div>
    );
  }

  if (!user && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500 text-xl">
        Please log in to view your profile.
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="rounded-3xl bg-white shadow-xl p-10 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-purple-200 blur-3xl opacity-30 rounded-full pointer-events-none"></div>
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-blue-200 blur-3xl opacity-30 rounded-full pointer-events-none"></div>

      <div className="relative z-1 flex flex-col items-center text-center space-y-6">
        {/* Avatar */}
        <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center shadow-md border-4 border-white ring-2 ring-purple-100">
          <span className="text-5xl font-bold text-purple-700">
            {user.fullName?.[0]?.toUpperCase() ||
              user.email?.[0]?.toUpperCase() ||
              "U"}
          </span>
        </div>

        {/* Name */}
        <h2 className="text-3xl font-bold text-gray-800">
          {user.fullName || "Unnamed User"}
        </h2>

        {/* Email */}
        <p className="text-md text-gray-600">
          <strong>Email:</strong> {user.email}
        </p>

        {/* Joined Date */}
        <p className="text-sm text-gray-400">
          <strong>Joined:</strong>{" "}
          {user.createdAt
            ? new Date(user.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "N/A"}
        </p>

        {/* Buttons */}
        <div className="flex gap-4 mt-4">
          <button
            onClick={onEdit}
            className="bg-purple-600 text-white px-6 py-2 rounded-xl font-semibold shadow hover:bg-purple-700 transition"
          >
            Edit Profile
          </button>
          <button
            onClick={onLogout}
            className="bg-red-100 text-red-600 px-6 py-2 rounded-xl font-semibold hover:bg-red-200 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
