"use client";

import { useEffect, Suspense } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = ({ children }) => {
  const setToken = useAuthStore((s) => s.setToken);
  const validateUser = useAuthStore((s) => s.validateUser);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    //Validate User...
    async function validate() {
      if (
        typeof window !== "undefined" ? localStorage.getItem("login") : null
      ) {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const success = await validateUser(token);
        setToken(token);
        localStorage.setItem("login", success);
      }
    }
    validate();
  }, []);

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          Loading...
        </div>
      }
    >
      <div>
        {
          //Dynamic Navbar
          ["/login", "/login/otp"].includes(pathname) ? (
            <div style={{ display: "none" }}></div>
          ) : (
            <Navbar />
          )
        }
        <main>{children}</main>
        {
          //Dynamic Footer
          pathname.startsWith("/profile") ||
          ["/login", "/login/otp"].includes(pathname) ? (
            <div style={{ display: "none" }}></div>
          ) : (
            <Footer />
          )
        }
      </div>
    </Suspense>
  );
};

export default Layout;
