'use client';
import React, { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaUserPlus, FaSignInAlt } from 'react-icons/fa';
import { SignupForm, LoginForm } from '@/components/Login';

const AuthArt = ({ isSignup }) => (
    <div className="flex flex-col items-center justify-center h-full w-full px-8 py-8 transition-all duration-700 ease-in-out">
        <div className="flex items-center justify-center bg-purple-100 rounded-full w-40 h-40 mb-6 shadow-lg">
            {isSignup ? (
                <FaUserPlus className="text-purple-600 text-7xl" />
            ) : (
                <FaSignInAlt className="text-purple-600 text-7xl" />
            )}
        </div>
        <h2
            className="text-2xl font-bold text-purple-700 mb-2"
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            {isSignup ? 'Join CoFlow!' : 'Welcome Back!'}
        </h2>
        <p className="text-gray-600 text-center" style={{ fontWeight: 500 }}>
            {isSignup
                ? 'Create your account to join hackathons, collaborate, and innovate.'
                : 'Login to your account and continue your hackathon journey.'}
        </p>
    </div>
);

export default function AuthPage() {
    const [showSignup, setShowSignup] = React.useState(false);
    const token = useSearchParams().get('token') || '';
    const oauth = useSearchParams().get('oauth') || '';
    const oauthType = useSearchParams().get('type') || '';
    const router = useRouter();

    useEffect(() => {
        // Setting Token When User logged in via `Google`...
        if (oauth === 'true' && (oauthType === 'google' || oauthType === 'github')) {
            typeof window !== 'undefined' ? localStorage.setItem('login', true) : null;
            typeof window !== 'undefined' ? localStorage.setItem('token', token) : null;
            window.location.href = '/'; //Enables full page reload
        }
    }, [token, oauth, oauthType]);

    const handleOAuth = async (oauth = 'google') => {
        // Send the user to the backend to start the `OAuth` flow
        try {
            typeof window !== 'undefined'
                ? (window.location.href =
                      process.env.NEXT_PUBLIC_BACKEND_URL + `/api/auth/${oauth}`)
                : null; // Redirect to backend route
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 px-4 py-5">
            {/* Top-left Back Button */}
            <button
                onClick={() => router.back()}
                className="fixed top-6 left-6 px-5 py-2 rounded-xl bg-purple-100 text-purple-700 font-semibold shadow hover:bg-purple-200 transition-all duration-150 z-50 cursor-pointer"
                type="button"
            >
                ← Back
            </button>
            <div className="w-full max-w-5xl h-[690px] flex flex-col md:flex-row bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-700 ease-in-out">
                {/* Form Side */}
                <div
                    className={`w-full md:w-1/2 h-full flex flex-col items-center justify-center order-1 ${
                        showSignup ? 'md:order-2' : 'md:order-1'
                    } transition-all duration-700 ease-in-out`}
                >
                    {/* Login Forms... */}
                    <div className="w-full h-fit flex items-center justify-center">
                        {showSignup ? (
                            <SignupForm onSwitch={() => setShowSignup(false)} />
                        ) : (
                            <LoginForm onSwitch={() => setShowSignup(true)} />
                        )}
                    </div>

                    {/* Google OAuth btn... */}
                    <button
                        onClick={() => handleOAuth('google')}
                        className="mt-5 flex items-center justify-center gap-3 px-6 py-1 rounded-xl bg-white border border-gray-300 shadow hover:bg-gray-100 transition-all duration-150 text-black font-semibold text-lg cursor-pointer"
                        style={{ minWidth: 260 }}
                    >
                        <svg
                            className="w-6 h-6"
                            viewBox="0 0 48 48"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <g>
                                <path
                                    d="M44.5 20H24V28.5H36.9C35.5 33.1 31.2 36.5 26 36.5C19.1 36.5 13.5 30.9 13.5 24C13.5 17.1 19.1 11.5 26 11.5C29 11.5 31.7 12.6 33.7 14.5L39.1 9.1C35.7 5.9 31.1 4 26 4C14.4 4 5 13.4 5 25C5 36.6 14.4 46 26 46C37.6 46 47 36.6 47 25C47 23.3 46.8 21.7 46.5 20Z"
                                    fill="#FFC107"
                                />
                                <path
                                    d="M6.3 14.7L13.2 19.6C15.1 15.5 20.1 11.5 26 11.5C29 11.5 31.7 12.6 33.7 14.5L39.1 9.1C35.7 5.9 31.1 4 26 4C17.6 4 10.2 9.6 6.3 14.7Z"
                                    fill="#FF3D00"
                                />
                                <path
                                    d="M26 46C31.1 46 35.7 44.1 39.1 40.9L33.1 36.1C31.2 37.6 28.8 38.5 26 38.5C20.9 38.5 16.1 34.7 14.6 29.9L6.2 35.3C10.1 40.4 17.5 46 26 46Z"
                                    fill="#4CAF50"
                                />
                                <path
                                    d="M46.5 20H44.5V20H24V28.5H36.9C36.2 30.7 34.8 32.6 33.1 34.1L39.1 40.9C42.5 37.7 45 32.6 45 25C45 23.3 44.8 21.7 44.5 20Z"
                                    fill="#1976D2"
                                />
                            </g>
                        </svg>
                        Continue with Google
                    </button>

                    {/* GitHub OAuth btn... */}
                    <button
                        onClick={() => handleOAuth('github')}
                        className="mt-5 flex items-center justify-center gap-3 px-6 py-1 rounded-xl bg-black border border-gray-800 shadow hover:bg-gray-600 transition-all duration-150 text-white font-semibold text-lg cursor-pointer"
                        style={{ minWidth: 260 }}
                    >
                        <svg
                            className="w-6 h-6"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fillRule="evenodd"
                                d="M12 0C5.37 0 0 5.48 0 12.25c0 5.42 3.44 10.01 8.21 11.64.6.11.82-.27.82-.6v-2.16c-3.34.74-4.04-1.64-4.04-1.64-.55-1.43-1.34-1.81-1.34-1.81-1.09-.77.08-.76.08-.76 1.2.09 1.83 1.25 1.83 1.25 1.07 1.87 2.8 1.33 3.48 1.02.11-.79.42-1.33.76-1.63-2.67-.31-5.47-1.37-5.47-6.08 0-1.34.46-2.44 1.23-3.3-.12-.31-.54-1.57.12-3.27 0 0 1.01-.33 3.3 1.26a11.23 11.23 0 016 0c2.29-1.59 3.3-1.26 3.3-1.26.66 1.7.24 2.96.12 3.27.77.86 1.23 1.96 1.23 3.3 0 4.72-2.8 5.76-5.47 6.07.43.37.82 1.1.82 2.22v3.29c0 .34.22.72.82.6C20.56 22.26 24 17.67 24 12.25 24 5.48 18.63 0 12 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Continue with GitHub
                    </button>
                </div>
                {/* Art Side */}
                <div
                    className={`hidden md:flex w-1/2 h-full items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 order-2 ${
                        showSignup ? 'md:order-1' : 'md:order-2'
                    } transition-all duration-700 ease-in-out`}
                >
                    <AuthArt isSignup={showSignup} />
                </div>
            </div>
        </div>
    );
}
