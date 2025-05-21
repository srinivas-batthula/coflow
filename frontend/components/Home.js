"use client";

import React, { useEffect } from "react";
import { useHackathonStore } from "../store/useHackathonStore";
import { useAuthStore } from "../store/useAuthStore";
import { useRouter } from "next/navigation";
import { FaUserCircle } from "react-icons/fa";
import Navbar from "./Navbar";

// Import the font in your global CSS or _app.js as you described:
// @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');

const features = [
  {
    icon: "🌍",
    title: "Discover Hackathons",
    desc: "Browse and filter a curated list of global hackathons. Never miss an opportunity to innovate and compete.",
    color: "from-purple-100 to-blue-100",
  },
  {
    icon: "📝",
    title: "Project Tracking",
    desc: "After login, update your team’s project, assign tasks, and mark completion to keep everyone in sync.",
    color: "from-blue-100 to-green-100",
  },
  {
    icon: "🏆",
    title: "Prizes & Hosts",
    desc: "See prize pools, event hosts, and all key details at a glance. Find the perfect event for your team.",
    color: "from-yellow-100 to-pink-100",
  },
  {
    icon: "🤝",
    title: "Team Collaboration",
    desc: "Collaborate with your team, share updates, and stay organized throughout the hackathon journey.",
    color: "from-pink-100 to-purple-100",
  },
];

export default function HomePage({ hackathonsList }) {
  const { hackathons, loading, error, setHackathons } = useHackathonStore();

  // Auth store
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);

  // Validate user on mount (refresh or navigation)
  useEffect(() => {
    setHackathons(hackathonsList);
  }, [hackathonsList]);

  // Show loading spinner if auth is loading (do not render nav/UI yet)
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-12 w-12 text-purple-600 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            ></path>
          </svg>
          <span className="text-purple-700 text-xl font-semibold">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  // Now render the rest of your UI (navigation, hero, features, etc.)
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 relative"
      style={{ fontFamily: "sans-serif", fontWeight: 500 }}
    >
      <Navbar />

      {/* Hero Section */}
      <section className="relative text-center py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 left-1/2 transform -translate-x-1/2 w-[700px] h-[700px] bg-purple-200 opacity-25 rounded-full blur-3xl"></div>
        </div>
        <h1
          className="relative text-5xl md:text-6xl font-extrabold text-gray-800 mb-7 drop-shadow-lg leading-tight"
          style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900 }}
        >
          Welcome to <span className="text-purple-600">HackPilot</span>
        </h1>
        <p
          className="relative text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8"
          style={{ fontFamily: "sans-serif", fontWeight: 500 }}
        >
          Discover, join, and track hackathons worldwide.
          <br className="hidden md:block" />
          <span
            className="block mt-4 text-purple-700 font-semibold"
            style={{ fontWeight: 500 }}
          >
            Find your next challenge, collaborate with your team, and showcase
            your innovation. Start exploring featured hackathons below!
          </span>
        </p>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-24 px-4">
        {features.map((f, i) => (
          <div
            key={f.title}
            className={`group bg-gradient-to-br ${f.color} rounded-3xl shadow-xl p-10 flex flex-col items-center hover:scale-105 hover:shadow-2xl transition-all duration-200 cursor-pointer`}
          >
            <span className="text-6xl mb-5 group-hover:scale-125 transition-transform duration-200">
              {f.icon}
            </span>
            <h3
              className="font-black text-2xl mb-3 text-purple-700 text-center group-hover:text-purple-900 transition-colors duration-200"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900 }}
            >
              {f.title}
            </h3>
            <p
              className="text-gray-700 text-center text-lg"
              style={{ fontFamily: "sans-serif", fontWeight: 500 }}
            >
              {f.desc}
            </p>
          </div>
        ))}
      </section>

      {/* Hackathon List */}
      <section className="max-w-7xl mx-auto px-4 pb-24">
        <h2
          className="text-4xl font-black text-gray-800 mb-12 text-center tracking-tight"
          style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900 }}
        >
          🚀 Featured Hackathons
        </h2>
        {loading && (
          <div
            className="text-center text-lg text-purple-700"
            style={{ fontWeight: 500 }}
          >
            Loading...
          </div>
        )}
        {error && (
          <div className="text-center text-red-500" style={{ fontWeight: 500 }}>
            {error}
          </div>
        )}
        {/* Responsive hackathon list: grid for desktop, flex for mobile */}
        <div
          className="
            flex flex-col gap-8
            md:grid md:grid-cols-2 md:gap-12
            xl:grid-cols-2
            "
        >
          {hackathons && hackathons.length > 0
            ? hackathons.map((hackathon) => (
                <div
                  key={hackathon._id?.$oid || hackathon._id || hackathon.title}
                  className="bg-white rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-200 p-8 flex flex-col border-t-4 border-purple-400 w-full"
                  style={{
                    maxWidth: "100%",
                    margin: "0 auto",
                  }}
                >
                  <h3
                    className="text-2xl font-black mb-3 text-purple-700 hover:text-purple-900 transition-colors duration-150"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 900,
                    }}
                  >
                    <a
                      href={hackathon.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {hackathon.title}
                    </a>
                  </h3>
                  <div className="flex-1 mb-3 space-y-1">
                    <p className="text-gray-600" style={{ fontWeight: 500 }}>
                      <span className="font-semibold">📅 Date:</span>{" "}
                      {hackathon.date}
                    </p>
                    <p className="text-gray-600" style={{ fontWeight: 500 }}>
                      <span className="font-semibold">🌐 Location:</span>{" "}
                      {hackathon.location}{" "}
                      <span className="text-xs text-gray-400">
                        ({hackathon.city})
                      </span>
                    </p>
                    <p className="text-gray-600" style={{ fontWeight: 500 }}>
                      <span className="font-semibold">🏆 Prize:</span>{" "}
                      {hackathon.prize}
                    </p>
                    <p className="text-gray-600" style={{ fontWeight: 500 }}>
                      <span className="font-semibold">👤 Host:</span>{" "}
                      {hackathon.host}
                    </p>
                  </div>
                  <a
                    href={hackathon.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block px-6 py-2 rounded-xl bg-purple-600 text-white font-semibold text-lg text-center shadow hover:bg-purple-700 hover:scale-105 transition-all duration-150"
                    style={{ fontWeight: 500 }}
                  >
                    View Details
                  </a>
                </div>
              ))
            : !loading &&
              !error && (
                <div
                  className="col-span-full text-center text-gray-500"
                  style={{ fontWeight: 500 }}
                >
                  No hackathons found.
                </div>
              )}
        </div>
      </section>
      {/* Footer */}
      <footer className="w-full bg-gradient-to-br from-purple-50 to-blue-50 border-t border-purple-100 py-10 mt-16">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand & Year */}
          <div className="flex items-center gap-3">
            <span
              className="font-black text-3xl text-purple-700 tracking-tight"
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
              href="https://github.com/hackpilot"
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
  );
}
