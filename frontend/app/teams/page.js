"use client";

import { useEffect, useState } from "react";
import { Users, User, CalendarDays, Plus } from "lucide-react";
import {useAuthStore} from '@/store/useAuthStore'


export default function TeamsPage() {
  const setTeams = useAuthStore((s) => s.setTeams);
  const teams = useAuthStore((s) => s.teams);
  const token = useAuthStore((s) => s.token);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTeams() {
      try {
        const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL+"/api/teams", {
          method: 'GET',
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setTeams(data.my_teams);
        } else {
          setError("Failed to fetch teams.");
        }
      } catch (err) {
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    if(!teams || teams.length===0){
      fetchTeams();
    }
    else{
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#f6f0ff] to-[#e7dbff] py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header + Button */}
        {/* Header + Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
          <h1 className="text-5xl font-extrabold text-purple-800 drop-shadow-sm text-center sm:text-left">
            Your Teams
          </h1>
          <div className="flex gap-4 justify-center sm:justify-end">
            <button className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white font-medium px-5 py-2 rounded-full shadow-md transition">
              <Plus size={18} />
              Create Team
            </button>
            <button className="flex items-center gap-2 border border-purple-500 text-purple-700 hover:bg-purple-100 font-medium px-5 py-2 rounded-full shadow-sm transition">
              <Users size={18} />
              Join Team
            </button>
          </div>
        </div>

        {/* Loading & Error States */}
        {loading && (
          <p className="text-center text-gray-600 text-lg">
            Loading your teams...
          </p>
        )}

        {error && (
          <p className="text-center text-red-500 font-semibold">{error}</p>
        )}

        {!loading && teams.length === 0 && (
          <p className="text-center text-gray-500 text-lg">
            You're not part of any teams yet.
          </p>
        )}

        {/* Team Cards Grid */}
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teams.map((team) => (
            <div
              key={team._id}
              className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6 hover:shadow-xl transition-all hover:scale-[1.02]"
            >
              {/* Avatar + Name */}
              <div className="flex items-center gap-4 mb-4">
                {team.image_url ? (
                  <img
                    src={team.image_url}
                    alt={team.name}
                    className="w-12 h-12 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                    {team.name?.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-semibold text-purple-700">
                    {team.name}
                  </h2>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <User size={14} /> {team.leader.slice(0, 6)}...
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                {team.project_description || "No description provided."}
              </p>

              {/* Meta Info */}
              <div className="text-xs text-gray-500 space-y-1">
                <p className="flex items-center gap-1">
                  <CalendarDays size={14} className="text-purple-500" />
                  <span>
                    <strong>Created:</strong>{" "}
                    {new Date(team.createdAt).toLocaleDateString()}
                  </span>
                </p>
                <p className="flex items-center gap-1">
                  <Users size={14} className="text-purple-500" />
                  <span>
                    <strong>Members:</strong> {team.members.length}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
