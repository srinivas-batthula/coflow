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
    bgColor: "bg-[#E8E7F9]",
    iconColor: "#4C3F91",
  },
  {
    icon: "📝",
    title: "Project Tracking",
    desc: "After login, update your team’s project, assign tasks, and mark completion to keep everyone in sync.",
    bgColor: "bg-[#DDE9F7]",
    iconColor: "#3753B5",
  },
  {
    icon: "🏆",
    title: "Prizes & Hosts",
    desc: "See prize pools, event hosts, and all key details at a glance. Find the perfect event for your team.",
    bgColor: "bg-[#D9D8F7]",
    iconColor: "#3B368C",
  },
  {
    icon: "🤝",
    title: "Team Collaboration",
    desc: "Collaborate with your team, share updates, and stay organized throughout the hackathon journey.",
    bgColor: "bg-[#F5F7FC]",
    iconColor: "#4A51A3",
  },
];

export default function HomePage() {
  const { hackathons, loading, error, fetchHackathons } = useHackathonStore();
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const [selectedCity, setSelectedCity] = useState("All");
  const [showDropdown, setShowDropdown] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const filteredHackathons =
    selectedCity === "All"
      ? hackathons
      : hackathons?.filter(
          (h) => h.city.toLowerCase() === selectedCity.toLowerCase()
        ) || [];

  useEffect(() => {
    fetchHackathons();
    const handlePrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handlePrompt);
    return () =>
      window.removeEventListener("beforeinstallprompt", handlePrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(
        outcome === "accepted"
          ? "User accepted the install."
          : "User dismissed the install."
      );
    } else {
      alert("PWA install prompt is not available.");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E8E7F9]">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-12 w-12 text-[#320398] mb-4"
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
          <span className="text-[#320398] text-xl font-semibold">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FF] text-[#320398] font-sans font-medium">
      {/* Hero Section */}
      <section className="text-center py-24 px-6 relative max-w-5xl mx-auto">
        <div className="absolute inset-0 -z-10 flex justify-center">
          <div className="w-[600px] h-[600px] bg-[#320398] opacity-10 rounded-full blur-3xl"></div>
        </div>

        <h1 className="flex gap-12 flex-col md:flex-row items-center justify-center text-5xl md:text-6xl font-extrabold mb-6 leading-tight font-inter tracking-tight">
          <span>Welcome to</span>
          <span className="ml-3 inline-flex items-center text-[#2A3BD9] scale-250 mt-4">
            <img
              src="/textlogo.png"
              alt="Coflow Logo"
              className="h-12 md:h-16 object-contain"
              loading="lazy"
            />
          </span>
        </h1>

        <button
          onClick={handleInstallClick}
          className="cursor-pointer mt-4 px-8 py-3 bg-[#320398] hover:bg-[#24026d] text-white rounded-full font-semibold transition-all shadow-lg hover:shadow-xl"
        >
          Get the App
        </button>

        <p className="mt-6 text-xl md:text-2xl max-w-3xl mx-auto text-[#636ee0]">
          Discover, join, and track hackathons worldwide.
          <span className="block mt-4 text-[#2A3BD9] font-semibold">
            Find your next challenge, collaborate with your team, and showcase
            your innovation.
          </span>
        </p>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 px-6 mb-24">
        {features.map((f) => (
          <div
            key={f.title}
            className="bg-white rounded-3xl shadow-lg p-8 flex flex-col items-center text-center transition-transform hover:scale-[1.03]"
          >
            <div
              className={`${f.bgColor} rounded-full p-5 mb-5 inline-flex justify-center items-center`}
              style={{ color: f.iconColor, fontSize: "3rem" }}
              aria-label={f.title}
              role="img"
            >
              {f.icon}
            </div>
            <h3 className="text-lg font-bold mb-2 text-[#320398]">{f.title}</h3>
            <p className="text-gray-600 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Hackathons List */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold">🚀 Featured Hackathons</h2>
          <div className="relative inline-block text-left">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="px-4 py-2 bg-[#320398] text-white rounded-full hover:bg-[#24026d] transition-all flex items-center"
            >
              <SlidersHorizontal className="w-5 h-5 mr-2" />
              Filter
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white text-gray-800 shadow-xl z-50 overflow-hidden">
                {["All", "Hyderabad", "Mumbai", "Bengaluru", "Global"].map(
                  (city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city);
                        setShowDropdown(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm transition-all ${
                        selectedCity === city
                          ? "bg-[#E6E0FF] text-[#320398] font-semibold"
                          : "hover:bg-gray-100"
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

        {loading && <p className="text-[#5A63BD]">Loading hackathons...</p>}
        {error && <p className="text-red-600">{error}</p>}

        <div className="grid md:grid-cols-2 gap-8">
          {filteredHackathons.length > 0 ? (
            filteredHackathons.map((hackathon) => (
              <div
                key={hackathon._id}
                className="bg-white border border-[#E0E0F5] rounded-2xl shadow-md p-6 hover:shadow-lg transition-transform hover:-translate-y-1"
              >
                <h3 className="text-xl font-bold text-[#320398] mb-3 hover:underline">
                  <a
                    href={hackathon.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {hackathon.title}
                  </a>
                </h3>
                <div className="text-gray-700 text-sm space-y-1">
                  <p>
                    <strong>📅 Date:</strong> {hackathon.date}
                  </p>
                  <p>
                    <strong>🌐 Location:</strong> {hackathon.location}{" "}
                    <span className="text-xs text-gray-400">
                      ({hackathon.city})
                    </span>
                  </p>
                  <p>
                    <strong>🏆 Prize:</strong> {hackathon.prize}
                  </p>
                  <p>
                    <strong>👤 Host:</strong> {hackathon.host}
                  </p>
                </div>
                <div className="mt-5">
                  <a
                    href={hackathon.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-2 bg-[#320398] hover:bg-[#1c2d99] text-white rounded-full font-medium shadow transition-all"
                  >
                    View Details
                  </a>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 col-span-full">
              No hackathons found.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
