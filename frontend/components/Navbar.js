import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { FaUserCircle } from "react-icons/fa";
import { useRef, useState, useEffect } from "react";

export default function Navbar() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);
  const modalRef = useRef();

  // Close modal on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <nav className="flex items-center justify-between px-10 py-5 bg-white shadow-md sticky top-0 z-10">
      <div
        onClick={() => router.push("/")}
        className="font-black text-3xl text-purple-700 tracking-tight cursor-pointer select-none"
        style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900 }}
      >
        HackPilot
      </div>
      <div className="flex items-center gap-4 relative">
        {/* My Teams Button - only show when user is logged in */}
        {user && (
          <>
            <button
              className="px-2 py-2 rounded-xl bg-blue-50 text-purple-800 font-semibold text-lg shadow hover:bg-blue-100 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
              onClick={() => router.push("/teams")}
            >
              My Teams
            </button>
          </>
        )}
        {/* Auth Buttons or Profile Icon */}
        {!user && (
          <button
            className="px-3 py-2 rounded-xl bg-purple-600 text-white font-semibold text-lg shadow hover:scale-105 hover:bg-purple-700 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
            onClick={() => router.push("/login")}
          >
            Signup / Login
          </button>
        )}
        {user && (
          <div className="relative">
            <button
              className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 border-2 border-purple-600 text-purple-700 shadow hover:shadow-lg hover:scale-105 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
              onClick={() => setOpen((v) => !v)}
              title={user?.firstName || "Profile"}
              aria-label="User menu"
            >
              <FaUserCircle className="text-3xl md:text-4xl text-purple-600 drop-shadow" />
            </button>
            {open && (
              <div
                ref={modalRef}
                className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-50"
              >
                <button
                  className="w-full text-left px-4 py-3 hover:bg-purple-50 rounded-t-xl text-purple-700 font-semibold transition-colors cursor-pointer"
                  onClick={() => {
                    setOpen(false);
                    router.push(`/profile/${user._id}`);
                  }}
                >
                  Profile
                </button>
                <button
                  className="w-full text-left px-4 py-3 hover:bg-purple-50 rounded-b-xl text-red-600 font-semibold transition-colors cursor-pointer"
                  onClick={() => {
                    setOpen(false);
                    logout();
                    router.push("/");
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
