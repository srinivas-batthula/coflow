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
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    //Validate User...
    async function validate() {
      try {
        await fetch(process.env.NEXT_PUBLIC_BACKEND_URL+'/');
      } catch (error) {
        console.error('Backend Server is On Sleep-mode!');
      }

      if (
        typeof window !== "undefined" ? localStorage.getItem("login") : null
      ) {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        setToken(token);
        const success = await validateUser(token);
        localStorage.setItem("login", success);
      }

      // Register the service worker...        (Note: Use Only in `Production`...)
      if ('serviceWorker' in navigator && window.location.hostname !== "localhost") {
        navigator.serviceWorker.register(process.env.NEXT_PUBLIC_HOME + '/service-worker.js', { scope: '/' })
          .then((registration) => {
            console.log('Service Worker registered with scope: ', registration.scope)
          })
          .catch((error) => {
            console.error('Service Worker Registration failed: ', error)
          })
      }
    }
    validate();
  }, []);

  useEffect(() => {
    const subscribeUser = async () => {
      // Subscribe the user to notifications...
      if (user && (!user.subscription || user.subscription===null)) {
        await subscribeToNotifications(token);
      }
    }
    subscribeUser();
  }, [user]);

  // Define routes where Navbar and Footer should be hidden
  const hideNavbarFooter = 
    ["/login", "/login/otp"].includes(pathname);

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
          hideNavbarFooter ? (
            <div style={{ display: "none" }}></div>
          ) : (
            <Navbar />
          )
        }
        <main>{children}</main>
        {
          //Dynamic Footer
          pathname.startsWith("/profile") || pathname.startsWith('/teams/68') ||
            hideNavbarFooter ? (
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
