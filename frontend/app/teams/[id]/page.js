"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTeamStore } from "@/store/useTeamStore";
import { useAuthStore } from "@/store/useAuthStore";

import ParticipantsSection from "@/components/ParticipantSection";
import TasksSection from "@/components/TaskSection";
import ReservedSection from "@/components/ChatSection";

import socket from "@/utils/socket";

export default function TeamSpecificPage() {
  const { id } = useParams();
  const router = useRouter();
  const { fetchTeams, teams, loading, error } = useTeamStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (user?._id && !socket.connected) {
      socket.connect();
    }

    return () => {
      if (socket.connected) socket.disconnect();
    };
  }, [user]);

  const team = teams.find((t) => t._id === id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-600 text-xl">
        Loading team info...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-red-600 text-lg">
        {error}
      </div>
    );
  }

  if (!team || !user || !socket.connected) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-800 text-lg">
        Team not found, user not ready, or socket not connected.
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 p-4 gap-4">
      <div className="w-1/4 rounded-xl overflow-hidden border border-gray-200">
        <ParticipantsSection team={team} onBack={() => router.back()} />
      </div>

      <div className="w-2/4 rounded-xl overflow-hidden border border-gray-200">
        <TasksSection team={team} user={user} socket={socket} />
      </div>

      <div className="w-1/4 rounded-xl overflow-hidden border border-gray-200">
        <ReservedSection />
      </div>
    </div>
  );
}
