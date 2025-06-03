"use client";

import React, { useEffect, useState } from "react";
import { useHackathonStore } from "../store/useHackathonStore";
import { useAuthStore } from "../store/useAuthStore";
import { FaUserCircle } from "react-icons/fa";
import { SlidersHorizontal } from "lucide-react";

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

export default function HomePage({ data }) {
  const { hackathons, loading, error, fetchHackathons, setHackathons } = useHackathonStore();
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const [selectedCity, setSelectedCity] = useState("All");
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredHackathons =
    selectedCity === "All"
      ? hackathons
      : hackathons?.filter(
          (h) => h.city.toLowerCase() === selectedCity.toLowerCase()
        ) || [];

  useEffect(() => {
    setHackathons(data);
  }, [data]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 relative font-sans font-medium">
      {/* Hero Section */}
      <section className="relative text-center py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 left-1/2 transform -translate-x-1/2 w-[700px] h-[700px] bg-purple-200 opacity-25 rounded-full blur-3xl"></div>
        </div>
        <h1 className="relative text-5xl md:text-6xl font-extrabold text-gray-800 mb-7 drop-shadow-lg leading-tight font-inter">
          Welcome to <span className="text-purple-600">HackPilot</span>
        </h1>
        <p className="relative text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
          Discover, join, and track hackathons worldwide.
          <span className="block mt-4 text-purple-700 font-semibold">
            Find your next challenge, collaborate with your team, and showcase
            your innovation. Start exploring featured hackathons below!
          </span>
        </p>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-24 px-4">
        {features.map((f) => (
          <div
            key={f.title}
            className={`group bg-gradient-to-br ${f.color} rounded-3xl shadow-xl p-10 flex flex-col items-center hover:scale-105 hover:shadow-2xl transition-all duration-200`}
          >
            <span className="text-6xl mb-5 group-hover:scale-125 transition-transform duration-200">
              {f.icon}
            </span>
            <h3 className="font-black text-2xl mb-3 text-purple-700 text-center group-hover:text-purple-900 transition-colors duration-200 font-inter">
              {f.title}
            </h3>
            <p className="text-gray-700 text-center text-lg">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Hackathon List */}
      <section className="max-w-7xl mx-auto px-4 pb-24">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-black text-gray-800 tracking-tight font-inter">
            🚀 Featured Hackathons
          </h2>

          {/* Filter Button */}
          <div className="relative inline-block text-left scale-90">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-3 bg-purple-100 text-purple-700 rounded-full shadow hover:bg-purple-200 transition-all duration-200 flex items-center justify-center cursor-pointer"
              aria-label="Filter Cities"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="text-xl ml-2.5">Filter</span>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-3 w-44 rounded-xl bg-white shadow-xl border border-gray-200 z-50 animate-fade-in">
                {["All", "Hyderabad", "Mumbai", "Bengaluru", "Global"].map(
                  (city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city);
                        setShowDropdown(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-150 ${
                        selectedCity === city
                          ? "bg-purple-100 text-purple-700 font-semibold"
                          : "text-gray-700 hover:bg-purple-50"
                      }`}
                    >
                      {city}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {loading && (
          <div className="text-center text-lg text-purple-700 font-medium">
            Loading...
          </div>
        )}
        {error && (
          <div className="text-center text-red-500 font-medium">{error}</div>
        )}

        <div className="flex flex-col gap-8 md:grid md:grid-cols-2 md:gap-12 xl:grid-cols-2">
          {filteredHackathons.length > 0
            ? filteredHackathons.map((hackathon) => (
                <div
                  key={hackathon._id?.$oid || hackathon._id || hackathon.title}
                  className="bg-white rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-200 p-8 flex flex-col border-t-4 border-purple-400 w-full"
                >
                  <h3 className="text-2xl font-black mb-3 text-purple-700 hover:text-purple-900 transition-colors duration-150 font-inter">
                    <a
                      href={hackathon.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {hackathon.title}
                    </a>
                  </h3>
                  <div className="flex-1 mb-3 space-y-1 text-gray-600 font-medium">
                    <p>
                      <span className="font-semibold">📅 Date:</span>{" "}
                      {hackathon.date}
                    </p>
                    <p>
                      <span className="font-semibold">🌐 Location:</span>{" "}
                      {hackathon.location}{" "}
                      <span className="text-xs text-gray-400">
                        ({hackathon.city})
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold">🏆 Prize:</span>{" "}
                      {hackathon.prize}
                    </p>
                    <p>
                      <span className="font-semibold">👤 Host:</span>{" "}
                      {hackathon.host}
                    </p>
                  </div>
                  <a
                    href={hackathon.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block px-6 py-2 rounded-xl bg-purple-600 text-white font-semibold text-lg text-center shadow hover:bg-purple-700 hover:scale-105 transition-all duration-150"
                  >
                    View Details
                  </a>
                </div>
              ))
            : !loading &&
              !error && (
                <div className="col-span-full text-center text-gray-500 font-medium">
                  No hackathons found.
                </div>
              )}
        </div>
      </section>
    </div>
  );
}
