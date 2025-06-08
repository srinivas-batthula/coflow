import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { FaUserCircle } from "react-icons/fa";
import { useRef, useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function Navbar() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);
  const modalRef = useRef();

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
    <nav className="flex items-center justify-between px-10 py-4 bg-white shadow-md sticky top-0 z-50">
      <div
        onClick={() => router.push("/")}
        className="flex items-center gap-3 cursor-pointer select-none"
      >
        <img
          src="/logosvg.png"
          alt="Coflow Logo"
          className="w-32 h-auto md:w-40 object-contain"
        />
      </div>

      <div className="flex items-center gap-4 relative">
        {user && (
          <button
            className="px-3 py-2 rounded-xl bg-[#ECE3FF] text-[#400F7D] font-semibold text-lg shadow hover:bg-[#DED0FB] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#7854C4] cursor-pointer"
            onClick={() => router.push("/teams")}
          >
            My Teams
          </button>
        )}

        {!user && (
          <button
            className="px-4 py-2 rounded-xl bg-[#400F7D] text-white font-semibold text-lg shadow hover:scale-105 hover:bg-[#5729A9] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#7854C4] cursor-pointer"
            onClick={() => router.push("/login")}
          >
            Signup / Login
          </button>
        )}

        {user && (
          <div className="relative">
            <button
              className="flex items-center justify-center w-12 h-12 rounded-full bg-[#ECE3FF] border-2 border-[#400F7D] text-[#400F7D] shadow hover:shadow-lg hover:scale-105 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#7854C4] cursor-pointer"
              onClick={() => setOpen((v) => !v)}
              title={user?.firstName || "Profile"}
              aria-label="User menu"
            >
              <FaUserCircle className="text-3xl md:text-4xl drop-shadow" />
            </button>

            {open && (
              <div
                ref={modalRef}
                className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-50"
              >
                <button
                  className="w-full text-left px-4 py-3 hover:bg-[#F5EDFF] rounded-t-xl text-[#400F7D] font-semibold transition-colors cursor-pointer"
                  onClick={() => {
                    setOpen(false);
                    router.push(`/profile/${user._id}`);
                  }}
                >
                  Profile
                </button>
                <button
                  className="w-full text-left px-4 py-3 hover:bg-[#FDECEF] rounded-b-xl text-red-600 font-semibold transition-colors cursor-pointer"
                  onClick={() => {
                    setOpen(false);
                    logout();
                    toast.success("You’ve been logged out.");
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
