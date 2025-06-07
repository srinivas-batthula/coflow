import { useEffect, useState } from "react";
import { CircleDot, Copy } from "lucide-react";

export default function ParticipantsSection({ team, user, onBack, socket }) {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [copied, setCopied] = useState(false);
  const leaderId = team.leader;
  const userId = user._id;

  let members = team.member_details.map((member) => ({
    ...member,
    isLeader: member._id === leaderId,
    isCurrentUser: member._id === userId,
    isOnline: onlineUsers?.includes?.(member._id) ?? false,
  }));

  useEffect(() => {
    if (!socket?.connected || !team?._id || !user?._id) return;

    socket.on("onlineUsers", ({ onlineMembers }) => {
      setOnlineUsers(onlineMembers);
    });

    socket.on("newUser_offline", ({ userId }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });

    return () => {
      socket.off("onlineUsers");
      socket.off("newUser_offline");
    };
  }, [socket, team, user]);

  const handleCopy = () => {
    if (!team._id) return;
    navigator.clipboard.writeText(team._id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="w-full h-full max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg flex flex-col">
      {/* Back Button */}
      <button
        onClick={onBack}
        aria-label="Go back"
        className="inline-flex items-center mb-5 text-gray-700 hover:text-gray-900 font-semibold text-sm focus:outline-none transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back
      </button>

      {/* Team Title + Copy Team ID */}
      <div className="flex items-center mb-7 space-x-3">
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          {team.name}
        </h2>

        <button
          onClick={handleCopy}
          aria-label="Copy Team ID to clipboard"
          className="flex items-center justify-center p-1 rounded-md border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
          title={copied ? "Copied!" : "Copy Team ID"}
        >
          <Copy
            size={20}
            className={`text-gray-600 ${copied ? "text-green-600" : ""}`}
          />
        </button>
      </div>

      {/* Description & GitHub Repo */}
      <div className="space-y-5 mb-10">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <span className="uppercase text-gray-600 tracking-wide font-semibold text-xs w-[110px]">
            Description
          </span>
          <p className="text-gray-800 text-sm leading-relaxed flex-1 min-w-[180px]">
            {team.project_description || "No project description provided."}
          </p>
        </div>

        {team.github_repo && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <span className="uppercase text-gray-600 tracking-wide font-semibold text-xs w-[110px]">
              GitHub Repo
            </span>
            <a
              href={team.github_repo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 font-semibold hover:underline break-all flex-1 min-w-[180px] text-sm"
              aria-label="GitHub Repository Link"
            >
              {team.github_repo}
            </a>
          </div>
        )}
      </div>

      {/* Members List */}
      <div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-6 tracking-wide">
          Team Members
        </h3>
        <ul className="space-y-3 rounded-md" role="list">
          {members.map((member) => (
            <li
              key={member._id}
              tabIndex={0}
              role="button"
              aria-label={`Member ${member.fullName} ${member.isLeader ? "Admin" : "Member"
                }${member.isCurrentUser ? ", You" : ""}`}
              className={`flex items-center justify-between p-3 rounded-lg border transition-shadow cursor-pointer ${member.isCurrentUser
                ? "bg-sky-100 border-sky-400 shadow-md"
                : "bg-white border-gray-200 hover:shadow-lg"
                }`}
            >
              {/* Left: Status + Name */}
              <div className="flex items-center gap-3 min-w-0">
                <CircleDot
                  size={16}
                  className={`${member.isOnline ? "text-green-500" : "text-red-400"
                    }`}
                  strokeWidth={3}
                />
                <span
                  className={`font-medium truncate ${member.isCurrentUser ? "text-sky-900" : "text-gray-900"
                    }`}
                  title={member.fullName}
                >
                  {member.fullName}
                  {member.isCurrentUser && " (You)"}
                </span>
              </div>

              {/* Right: Role Badge */}
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full select-none whitespace-nowrap tracking-wide uppercase ${member.isLeader
                  ? "bg-gray-900 text-white"
                  : "bg-gray-200 text-gray-700"
                  }`}
              >
                {member.isLeader ? "Admin" : "Member"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
