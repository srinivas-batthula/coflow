// app/teams/[id]/page.js
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTeamStore } from "@/store/useTeamStore";
import { useAuthStore } from "@/store/useAuthStore";

import ParticipantsSection from "@/components/ParticipantSection";
import ChatSection from "@/components/ChatSection";
import TasksSection from "@/components/TaskSection";

import socket from "@/utils/socket";

export default function TeamSpecificPage() {
  const { id } = useParams();
  const router = useRouter();
  const { fetchTeams, teams, loading, error } = useTeamStore();
  const { user, token } = useAuthStore();
  const [isSocketReady, setIsSocketReady] = useState(false);

  useEffect(() => {
    // if (!teams || teams.length === 0) {
    // fetchTeams();
    // }
    if (user) {
      fetchTeams();
    }
  }, [fetchTeams, user]);

  useEffect(() => {
    if (user?._id && !socket.connected) {
      socket.io.opts.extraHeaders = {
        Authorization: `Bearer ${token}`,
      };
      socket.connect();
    }

    const handleConnect = () => setIsSocketReady(true);
    const handleDisconnect = () => setIsSocketReady(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      if (socket.connected) socket.disconnect();
    };
  }, [user, token]);

  const team = teams.find((t) => t._id === id);

  if (loading || !user || !teams.length) {
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

  // Now check for missing team
  if (!team) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-red-600 text-lg">
        Team not found.
      </div>
    );
  }

  // Wait for socket to finish connecting
  if (!isSocketReady && !loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-600 text-lg">
        Connecting to socket...
      </div>
    );
  }

  const sectionStyle =
    "rounded-xl overflow-hidden border border-gray-200 bg-white h-full";

  const scrollableContent = "h-full overflow-y-auto p-2";

  return (
    <>
      <div className="lg:h-screen h-[170%] p-4 bg-gradient-to-br from-white via-gray-50 to-gray-100 flex flex-col gap-4 lg:flex-row">
        {/* Top row for <900px: 1st & 2nd side-by-side */}
        <div className="flex flex-col md:flex-row gap-4 h-full w-full lg:w-[65%]">
          {/* First section */}
          <div className="w-full md:w-[40%] lg:w-[46%] h-[90vh]">
            <div className={sectionStyle}>
              <div className={scrollableContent}>
                <ParticipantsSection
                  team={team}
                  user={user}
                  onBack={() => router.back()}
                  socket={socket}
                />
              </div>
            </div>
          </div>

          {/* Second section */}
          <div className="w-full md:w-[60%] lg:w-[54%] h-[90vh]">
            <div className={sectionStyle}>
              <div className={scrollableContent}>
                <TasksSection team={team} user={user} socket={socket} />
              </div>
            </div>
          </div>
        </div>

        {/* Third section (bottom on mobile, right on desktop) */}
        <div className="w-full lg:w-[35%] hidden md:block h-[90vh]">
          <div className="h-full rounded-xl overflow-hidden border border-gray-200 bg-white">
            <div className="h-full overflow-y-auto p-2">
              <ChatSection team={team} user={user} socket={socket} />
            </div>
          </div>
        </div>
      </div>

      {/* Chat on small screens only */}
      <div className="w-full md:hidden bg-white">
        <div className="h-[90vh] p-3 overflow-hidden border border-gray-200 bg-white">
          <div className="h-full overflow-y-auto p-2 rounded-xl">
            <ChatSection team={team} user={user} socket={socket} />
          </div>
        </div>
      </div>
    </>
  );
}