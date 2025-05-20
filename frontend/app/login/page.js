"use client";
import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import { FaUserPlus, FaSignInAlt } from "react-icons/fa";
import { useAuthStore } from "@/store/useAuthStore";
import SignupForm from "./signup";
import LoginForm from "./login";

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 px-4 py-8">
      <div className="w-full max-w-5xl h-[600px] flex flex-col md:flex-row bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-700 ease-in-out">
        {/* Form Side */}
        <div
          className={`w-full md:w-1/2 h-full flex items-center justify-center order-1 ${
            showSignup ? "md:order-2" : "md:order-1"
          } transition-all duration-700 ease-in-out`}
        >
          <div className="w-full h-full flex items-center justify-center">
            {showSignup ? (
              <SignupForm onSwitch={() => setShowSignup(false)} />
            ) : (
              <LoginForm onSwitch={() => setShowSignup(true)} />
            )}
          </div>
        </div>
        {/* Art Side */}
        <div
          className={`hidden md:flex w-1/2 h-full items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 order-2 ${
            showSignup ? "md:order-1" : "md:order-2"
          } transition-all duration-700 ease-in-out`}
        >
          <AuthArt isSignup={showSignup} />
        </div>
      </div>
    </div>
  );
}
