"use client";
import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FaUserPlus, FaSignInAlt } from "react-icons/fa";
import { SignupForm, LoginForm } from "@/components/Login";


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
      {isSignup ? "Join HackPilot!" : "Welcome Back!"}
    </h2>
    <p className="text-gray-600 text-center" style={{ fontWeight: 500 }}>
      {isSignup
        ? "Create your account to join hackathons, collaborate, and innovate."
        : "Login to your account and continue your hackathon journey."}
    </p>
  </div>
);

export default function AuthPage() {
  const [showSignup, setShowSignup] = React.useState(false);
  const token = useSearchParams().get('token') || ''
  const is_from_google = useSearchParams().get('google') || ''

  useEffect(() => {             // Setting Token When User logged in via `Google`...
    if (is_from_google === 'true') {
      typeof window !== 'undefined' ? localStorage.setItem('login', true) : null
      typeof window !== 'undefined' ? localStorage.setItem('token', token) : null
      window.location.href = '/'    //Enables full page reload
    }
  }, [token, is_from_google])

  const handleOAuth = async (e) => {
    e.preventDefault()
    try {
      // Send the user to the backend to start the `Google OAuth` flow
      typeof window !== 'undefined' ? window.location.href = process.env.NEXT_PUBLIC_BACKEND_URL + '/api/auth/google' : null; // Redirect to backend route
    }
    catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 px-4 py-8">
      <div className="w-full max-w-5xl h-[650px] flex flex-col md:flex-row bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-700 ease-in-out">
        {/* Form Side */}
        <div
          className={`w-full md:w-1/2 h-full flex flex-col items-center justify-center order-1 ${showSignup ? "md:order-2" : "md:order-1"
            } transition-all duration-700 ease-in-out`}
        >
          <div className="w-full h-fit flex items-center justify-center">
            {showSignup ? (
              <SignupForm onSwitch={() => setShowSignup(false)} />
            ) : (
              <LoginForm onSwitch={() => setShowSignup(true)} />
            )}
          </div>
                  {/* Google OAuth2.0 */}
          <button onClick={handleOAuth} style={{ color: 'white', backgroundColor: 'black' }}>Continue with Google</button>
        </div>
        {/* Art Side */}
        <div
          className={`hidden md:flex w-1/2 h-full items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 order-2 ${showSignup ? "md:order-1" : "md:order-2"
            } transition-all duration-700 ease-in-out`}
        >
          <AuthArt isSignup={showSignup} />
        </div>
      </div>
    </div>
  );
}
