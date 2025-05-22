'use client'

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";


export function LoginForm({ onSwitch }) {
    const login = useAuthStore((s) => s.login);
    const error = useAuthStore((s) => s.error);
    const loading = useAuthStore((s) => s.loading);

    const emailRef = useRef();
    const passwordRef = useRef();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const email = emailRef.current.value;
        const password = passwordRef.current.value;
        const success = await login(email, password);
        if (success) {
            window.location.href = '/'    //Enables full page reload
        }
        // error is handled by zustand store and shown below
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-lg flex flex-col justify-center h-full transition-opacity duration-700 ease-in-out"
        >
            <h2
                className="text-2xl font-bold mb-6 text-purple-700 text-center"
                style={{ fontFamily: "'Inter', sans-serif" }}
            >
                Login
            </h2>
            <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium">Email</label>
                <input
                    ref={emailRef}
                    type="email"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    required
                />
            </div>
            <div className="mb-6">
                <label className="block text-gray-700 mb-2 font-medium">Password</label>
                <input
                    ref={passwordRef}
                    type="password"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    required
                />
            </div>
            {error && <div className="text-red-500 text-center mb-4">{error}</div>}
            <button
                type="submit"
                className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition cursor-pointer"
                disabled={loading}
            >
                {loading ? "Logging in..." : "Login"}
            </button>
            <p className="mt-4 text-center text-gray-600">
                Don't have an account?{" "}
                <button
                    type="button"
                    className="text-purple-700 font-semibold hover:underline cursor-pointer"
                    onClick={onSwitch}
                >
                    Sign Up
                </button>
            </p>
        </form>
    );
}

export function SignupForm({ onSwitch }) {
    const router = useRouter();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)
        const otp = Array.from({ length: 10 }, (_, i) => i).sort(() => Math.random() - 0.5).slice(0, 4).join('');
        const val = {             //Storing data in localstorage for future use in `/login/otp`...
            otp,
            fullName,
            email,
            password
        }
        localStorage.setItem('otp', JSON.stringify(val))

        let res = await fetch('/api/sendEmail', {       //Sending OTP via Email...
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: email,
                fullName,
                otp
            }),
        });
        res = await res.json()
        if (res.success) {
            router.push("/login/otp");
        }
        else {
            setError(res.error || "Error while sending Email!");
        }
        setLoading(false)
        // error is handled by zustand store and shown below
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-lg flex flex-col justify-center h-full transition-opacity duration-700 ease-in-out"
        >
            <h2
                className="text-2xl font-bold mb-6 text-purple-700 text-center"
                style={{ fontFamily: "'Inter', sans-serif" }}
            >
                Sign Up
            </h2>
            <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium">
                    Full Name
                </label>
                <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-black"
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium">Email</label>
                <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-black"
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium">Password</label>
                <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-black"
                    required
                />
            </div>
            {error && <div className="text-red-500 text-center mb-4">{error}</div>}
            <button
                type="submit"
                className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition cursor-pointer"
                disabled={loading}
            >
                {loading ? "Signing up..." : "Sign Up"}
            </button>
            <p className="mt-4 text-center text-gray-600">
                Already have an account?{" "}
                <button
                    type="button"
                    className="text-purple-700 font-semibold hover:underline cursor-pointer"
                    onClick={onSwitch}
                >
                    Login
                </button>
            </p>
        </form>
    );
}