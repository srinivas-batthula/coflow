"use client";
import Profile from "@/components/Profile";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const handleEdit = useCallback(() => {
    alert("Edit profile coming soon!");
  }, []);

  const handleLogout = useCallback(() => {
    toast.success("You’ve been logged out.");
    logout();
    router.push("/");
  }, [logout, router]);

  return (
    <div className="h-[calc(100vh-88px)] bg-[#f2e9ff] flex items-center justify-center px-4">
      <div className="w-full max-w-3xl">
        <Profile onEdit={handleEdit} onLogout={handleLogout} />
      </div>
    </div>
  );
}
