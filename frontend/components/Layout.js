"use client";

import { useEffect, Suspense } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import subscribeToNotifications from '@/utils/subscription';

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
      
      //       // Register the service worker...        (Note: Use Only in `Production`...)
      // if ('serviceWorker' in navigator) {
      //   navigator.serviceWorker.register(process.env.NEXT_PUBLIC_HOME + '/service-worker.js', { scope: '/' })
      //     .then((registration) => {
      //       console.log('Service Worker registered with scope: ', registration.scope)
      //     })
      //     .catch((error) => {
      //       console.error('Service Worker Registration failed: ', error)
      //     })
      // }

      //       // Subscribe the user to notifications...
      // if (!user.subscription) {
      //   await subscribeToNotifications();
      // }
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
