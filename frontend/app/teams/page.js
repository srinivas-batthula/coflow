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
  Clipboard,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useTeamStore } from "@/store/useTeamStore";
import Link from "next/link";
import toast from "react-hot-toast";

export default function TeamsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { loading, error, joinTeam, createTeam, fetchTeams, teams } =
    useTeamStore();
  console.log(teams);
  const [activeForm, setActiveForm] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    project_description: "",
    github_repo: "",
    teamId: "",
  });
  const [alertMsg, setAlertMsg] = useState("");

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

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
      toggleForm("create");
      toast.success(`Team "${team.name}" created!`);
    } else {
      toast.error("Failed to create team.");
    }
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    const { teamId } = formData;
    const response = await joinTeam(teamId);
    if (response?.success) {
      toggleForm("join");
      toast.success("Joined team successfully!");
    } else {
      toast.error(response?.msg || "Join failed");
      setAlertMsg(response?.msg || "Error joining team");
    }
  };

  const toggleForm = (type) => {
    setActiveForm((prev) => (prev === type ? null : type));
    setAlertMsg("");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f0ebff] via-[#f6f2ff] to-white text-[#1e1e2f] px-4 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#320398] mb-4 tracking-tight">
            Manage Your Teams
          </h1>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            Create or join a team to collaborate with others in real time and
            build great projects.
          </p>
        </div>

        {/* Alert */}
        {alertMsg && (
          <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-xl shadow mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle size={18} />
              <span>{alertMsg}</span>
            </div>
            <button onClick={() => setAlertMsg("")}>✕</button>
          </div>
        )}

        {/* Forms */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {/* Create Team */}
          <div className="bg-white/80 backdrop-blur-sm border border-[#e1d9ff] rounded-2xl shadow-lg p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-[#320398]">
                Create a Team
              </h2>
              <p className="text-sm text-gray-500">
                Start a new project from scratch.
              </p>
            </div>
            <button
              onClick={() => toggleForm("create")}
              className="bg-[#320398] hover:bg-[#24026d] text-white py-2 px-4 rounded-full text-sm transition"
            >
              {activeForm === "create" ? "Hide Form" : "Create Team"}
            </button>
            {activeForm === "create" && (
              <form onSubmit={handleCreateSubmit} className="space-y-4 mt-5">
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInput}
                  required
                  placeholder="Team Name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm"
                />
                <textarea
                  name="project_description"
                  value={formData.project_description}
                  onChange={handleInput}
                  placeholder="Project Description"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm h-28"
                />
                <input
                  name="github_repo"
                  value={formData.github_repo}
                  onChange={handleInput}
                  placeholder="GitHub Repo URL (optional)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  type="submit"
                  className="bg-[#320398] hover:bg-[#24026d] text-white py-2 px-5 rounded-full text-sm"
                >
                  Submit
                </button>
              </form>
            )}
          </div>

          {/* Join Team */}
          <div className="bg-white/80 backdrop-blur-sm border border-[#e1d9ff] rounded-2xl shadow-lg p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-[#320398]">
                Join a Team
              </h2>
              <p className="text-sm text-gray-500">
                Enter a team ID or invitation code.
              </p>
            </div>
            <button
              onClick={() => toggleForm("join")}
              className="border border-[#320398] text-[#320398] hover:bg-[#f3efff] py-2 px-4 rounded-full text-sm transition"
            >
              {activeForm === "join" ? "Hide Form" : "Join Team"}
            </button>
            {activeForm === "join" && (
              <form onSubmit={handleJoinSubmit} className="space-y-4 mt-5">
                <input
                  name="teamId"
                  value={formData.teamId}
                  onChange={handleInput}
                  required
                  placeholder="Team ID"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  type="submit"
                  className="bg-[#320398] hover:bg-[#24026d] text-white py-2 px-5 rounded-full text-sm"
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Team List */}
        <div>
          <h2 className="text-2xl font-bold text-[#320398] mb-6">Your Teams</h2>
          {loading && <p className="text-gray-500 text-sm">Loading...</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {!loading && teams.length === 0 && (
            <p className="text-gray-600 text-sm">
              You haven't joined any teams yet.
            </p>
          )}
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <Link key={team._id} href={`/teams/${team._id}`}>
                <div className="bg-white border border-[#e4ddff] rounded-2xl p-6 shadow-sm hover:shadow-lg hover:scale-[1.015] transition-all group cursor-pointer">
                  {/* Top: Avatar & Info */}
                  <div className="flex items-center gap-4 mb-4">
                    {/* Avatar (image or fallback) */}
                    {team.image_url ? (
                      <img
                        src={team.image_url}
                        alt={team.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-[#6541ec] shadow"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}

                    {/* Fallback Avatar */}
                    <div
                      className={`w-12 h-12 rounded-full bg-gradient-to-br from-[#6541ec] to-[#320398] text-white font-bold text-lg items-center justify-center shadow-inner ${
                        team.image_url ? "hidden" : "flex"
                      }`}
                    >
                      {team.name?.slice(0, 2).toUpperCase()}
                    </div>

                    {/* Team Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[#320398] group-hover:underline">
                        {team.name}
                      </h3>
                      <div className="flex flex-wrap items-center text-sm text-gray-600 gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <User size={14} />
                          <span>{team.leader}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Users size={14} />
                          {team.member_details?.length || 1} Member
                          {team.member_details?.length > 1 ? "s" : ""}
                        </div>
                        {team.leader === user._id && (
                          <span className="inline-flex items-center gap-1 bg-purple-100 text-[#320398] px-2 py-0.5 rounded-full font-medium text-[11px] uppercase tracking-wide">
                            <ShieldCheck size={12} /> Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-700 mb-4 line-clamp-3 leading-relaxed">
                    {team.project_description ||
                      "No project description provided."}
                  </p>

                  {/* Bottom: Created At & Copy ID */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                    <div className="flex items-center gap-1">
                      <CalendarDays size={14} className="text-purple-500" />
                      <span>
                        Created: {new Date(team.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        navigator.clipboard.writeText(team._id);
                        toast.success("Team ID copied!");
                      }}
                      className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded-md transition"
                    >
                      <Clipboard size={14} />
                      <span className="hidden sm:inline text-[11px] font-medium">
                        Copy ID
                      </span>
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
