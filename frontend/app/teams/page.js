"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Users,
  User,
  CalendarDays,
  XCircle,
  ShieldCheck,
  Hash,
  Clipboard,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useTeamStore } from "@/store/useTeamStore";
import Link from "next/link";

export default function TeamsPage() {
  const router = useRouter();

  const user = useAuthStore((s) => s.user);
  const teams = useTeamStore((s) => s.teams);
  const { loading, error, joinTeam, createTeam, fetchTeams } = useTeamStore();

  const [activeForm, setActiveForm] = useState(null); // 'create' | 'join' | null
  const [formData, setFormData] = useState({
    name: "",
    project_description: "",
    github_repo: "",
    teamId: "",
  });
  const [alertMsg, setAlertMsg] = useState("");

  useEffect(() => {
    // if (!teams || teams.length === 0) {
    fetchTeams();
    // }
  }, [fetchTeams]);

  // Auto-dismiss alert
  useEffect(() => {
    if (alertMsg) {
      const timeout = setTimeout(() => setAlertMsg(""), 3000);
      return () => clearTimeout(timeout);
    }
  }, [alertMsg]);

  const handleInput = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const { name, project_description, github_repo } = formData;
    const team = await createTeam({ name, project_description, github_repo });
    if (team) {
      router.push(`/teams/${team._id}`);
    }
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    const { teamId } = formData;

    const response = await joinTeam(teamId);

    if (response?.success) {
      window.location.href = `/teams/${response.team._id}`;
    } else if (response?.msg) {
      setAlertMsg(response.msg); // ← shows custom alert
    }
  };

  const toggleForm = (type) => {
    setActiveForm((prev) => (prev === type ? null : type));
    setAlertMsg("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#f6f0ff] to-[#e7dbff] py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header + Contextual Intro */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h1 className="text-5xl font-extrabold text-purple-800 drop-shadow-sm mb-4">
            Collaborate & Build with Teams
          </h1>
          <p className="text-lg text-gray-700 leading-relaxed">
            Start something new or join a team. Manage your project goals and
            collaborate with others in real-time.
          </p>
        </div>

        {/* Alert */}
        {alertMsg && (
          <div className="bg-yellow-100 text-yellow-800 px-4 py-3 rounded-md mb-6 flex items-center justify-between shadow">
            <div className="flex items-center gap-2">
              <XCircle size={18} />
              <span className="text-sm font-medium">{alertMsg}</span>
            </div>
            <button
              onClick={() => setAlertMsg("")}
              className="text-yellow-700 hover:text-yellow-900"
            >
              ✕
            </button>
          </div>
        )}

        {/* Forms */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Create Team */}
          <div className="bg-white shadow rounded-2xl p-6">
            <h2 className="text-xl font-bold text-purple-700 mb-2">
              Create a New Team
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Start a project and invite others to join.
            </p>
            <button
              onClick={() => toggleForm("create")}
              className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-full text-sm"
            >
              {activeForm === "create" ? "Hide Form" : "Create Team"}
            </button>

            {activeForm === "create" && (
              <form
                onSubmit={handleCreateSubmit}
                className="space-y-3 mt-4 text-sm"
              >
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInput}
                  placeholder="Team Name"
                  className="w-full p-3 rounded border border-gray-300 placeholder-black text-black"
                  required
                />
                <textarea
                  name="project_description"
                  value={formData.project_description}
                  onChange={handleInput}
                  placeholder="Project Description [Only <30 letters]  (Optional)"
                  className="w-full p-3 rounded border border-gray-300 placeholder-black text-black resize-none h-32 overflow-y-auto"
                />
                <input
                  name="github_repo"
                  value={formData.github_repo}
                  onChange={handleInput}
                  placeholder="GitHub Repo URL (optional)"
                  className="w-full p-3 rounded border border-gray-300 placeholder-black text-black"
                />
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full"
                >
                  Create
                </button>
              </form>
            )}
          </div>

          {/* Join Team */}
          <div className="bg-white shadow rounded-2xl p-6">
            <h2 className="text-xl font-bold text-purple-700 mb-2">
              Join an Existing Team
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Have a team code or invitation? Enter it below.
            </p>
            <button
              onClick={() => toggleForm("join")}
              className="border border-purple-700 text-purple-700 hover:bg-purple-100 px-4 py-2 rounded-full text-sm"
            >
              {activeForm === "join" ? "Hide Form" : "Join Team"}
            </button>

            {activeForm === "join" && (
              <form
                onSubmit={handleJoinSubmit}
                className="space-y-3 mt-4 text-sm"
              >
                <input
                  name="teamId"
                  value={formData.teamId}
                  onChange={handleInput}
                  placeholder="Team ID"
                  className="w-full p-3 rounded border border-gray-300 placeholder-black text-black"
                  required
                />
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full"
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Team Section Header */}
        <h1 className="text-4xl font-bold text-purple-800 text-center mb-12">
          Your Teams
        </h1>

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

        {/* Teams Grid */}

        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teams.map((team) => (
            <Link href={`/teams/${team._id}`} key={team._id}>
              <div className="bg-white rounded-2xl shadow-md border border-purple-100 p-6 hover:shadow-lg transition-all hover:scale-[1.02]">
                {/* Header: Avatar & Info */}
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
                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                      <User size={14} />
                      <span>{team.leader}</span>
                      {team.leader === user._id && (
                        <span className="ml-2 inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium text-[11px] uppercase tracking-wide">
                          <ShieldCheck size={12} className="text-purple-600" />
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Project Description */}
                <div className="text-sm text-gray-700 mb-4">
                  <p className="line-clamp-3">
                    {team.project_description || "No description provided."}
                  </p>
                </div>

                {/* Room ID */}
                <div className="relative group flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 mt-2 overflow-hidden">
                  <div className="text-purple-800 font-medium text-xs">
                    <span className="uppercase tracking-wide">Room ID:</span>{" "}
                    <span className="font-semibold">{team._id}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault(); // prevent navigation when clicking button inside the link
                      navigator.clipboard.writeText(team._id);
                      const copiedLabel = document.getElementById(
                        `copied-${team._id}`
                      );
                      copiedLabel?.classList.remove(
                        "opacity-0",
                        "translate-y-2"
                      );
                      copiedLabel?.classList.add(
                        "opacity-100",
                        "translate-y-0"
                      );

                      setTimeout(() => {
                        copiedLabel?.classList.add(
                          "opacity-0",
                          "translate-y-2"
                        );
                        copiedLabel?.classList.remove(
                          "opacity-100",
                          "translate-y-0"
                        );
                      }, 1200);
                    }}
                    className="text-purple-600 hover:text-purple-800 transition text-xs font-medium relative"
                  >
                    <Clipboard size={16} />
                    <span
                      id={`copied-${team._id}`}
                      className="absolute right-0 top-6 text-[10px] bg-purple-600 text-white px-2 py-[1px] rounded-md shadow-md transition-all duration-300 opacity-0 translate-y-2 pointer-events-none"
                    >
                      Copied!
                    </span>
                  </button>
                </div>

                {/* Created Date */}
                <div className="text-xs text-gray-500 space-y-1 mt-4">
                  <p className="flex items-center gap-1">
                    <CalendarDays size={14} className="text-purple-500" />
                    <span>
                      <strong>Created:</strong>{" "}
                      {new Date(team.createdAt).toLocaleDateString()}
                    </span>
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
