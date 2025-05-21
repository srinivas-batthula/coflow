'use client'

import { useEffect, Suspense } from "react"
import { useAuthStore } from "@/store/useAuthStore";


const Layout = ({ children }) => {
    const setToken = useAuthStore((s) => s.setToken);
    const validateUser = useAuthStore((s) => s.validateUser);

    useEffect(() => {        //Validate User...
        async function validate() {
            if (typeof window !== 'undefined' ? localStorage.getItem('login') : null) {
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                const success = await validateUser(token);
                setToken(token);
                localStorage.setItem('login', success);
            }
        }
        validate();
    }, []);

    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen">
            Loading...
        </div>}>
            <div >
                <main >{children}</main>
            </div>
        </Suspense>
    )
}

export default Layout
