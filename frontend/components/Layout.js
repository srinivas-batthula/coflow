'use client'

import { useEffect, Suspense } from "react"
import { useAuthStore } from "@/store/useAuthStore";
import { usePathname, useRouter } from "next/navigation"
import Navbar from "./Navbar";


const Layout = ({ children }) => {
    const setToken = useAuthStore((s) => s.setToken);
    const validateUser = useAuthStore((s) => s.validateUser);
    const pathname = usePathname();
    const router = useRouter();

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
                {       //Dynamic Navbar
                    (['/login', '/login/otp'].includes(pathname)) ? <div style={{ display: 'none' }}></div> : <Navbar />
                }
                <main >{children}</main>
                {/* Footer */}
                <footer className="w-full bg-gradient-to-br from-purple-50 to-blue-50 border-t border-purple-100 py-10 mt-16">
                    <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
                        {/* Brand & Year */}
                        <div className="flex items-center gap-3">
                            <span
                                onClick={() => router.push("/")}
                                className="font-black text-3xl text-purple-700 tracking-tight cursor-pointer"
                                style={{ fontFamily: "'Inter', sans-serif" }}
                            >
                                <span className="inline-block align-middle">🚀</span> HackPilot
                            </span>
                            <span className="text-gray-400 text-base font-medium ml-2">
                                © {new Date().getFullYear()}
                            </span>
                        </div>
                        {/* Tagline & Mission */}
                        <div className="text-gray-600 text-base text-center md:text-right leading-relaxed max-w-xl">
                            <span className="block font-semibold text-purple-700 mb-1">
                                Empowering Innovators, Teams & Communities
                            </span>
                            <span>
                                HackPilot is your launchpad to discover, join, and win hackathons
                                worldwide.
                                <br className="hidden md:inline" />
                                <span className="text-purple-600 font-semibold">
                                    {" "}
                                    Build. Collaborate. Win. Repeat.
                                </span>
                            </span>
                        </div>
                        {/* Socials */}
                        <div className="flex gap-4">
                            <a
                                href="https://github.com/srinivas-batthula/hackpilot"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:text-purple-800 transition-colors"
                                aria-label="GitHub"
                            >
                                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.919.678 1.852 0 1.336-.012 2.417-.012 2.747 0 .268.18.579.688.481C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z" />
                                </svg>
                            </a>
                            <a
                                href="mailto:team@hackpilot.dev"
                                className="text-purple-600 hover:text-purple-800 transition-colors"
                                aria-label="Email"
                            >
                                <svg
                                    className="w-7 h-7"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <rect
                                        width="20"
                                        height="14"
                                        x="2"
                                        y="5"
                                        rx="3"
                                        stroke="currentColor"
                                    />
                                    <path d="M3 6l9 7 9-7" stroke="currentColor" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </footer>
            </div>
        </Suspense>
    )
}

export default Layout
