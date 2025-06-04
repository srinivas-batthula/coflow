import {useEffect, useState} from 'react'

export default function ParticipantsSection({ team, user, onBack, socket }) {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const leaderId = team.leader;
  const userId = user._id;

  const members = team.member_details.map((member) => ({
    ...member,
    isLeader: member._id === leaderId,
    isCurrentUser: member._id === userId,
    isOnline: onlineUsers?.includes?.(member._id) ?? false,
  }));

  useEffect(()=>{
    if (!socket?.connected || !team?._id || !user?._id) return;

    socket.on('onlineUsers', ({ onlineMembers })=>{
      setOnlineUsers(onlineMembers);
    })

    socket.on('newUser_online', ({ userId })=>{
      if(!onlineUsers.includes(userId)){
        setOnlineUsers((prev) => [...prev, userId]);
      }
    })

    socket.on('newUser_offline', ({ userId })=>{
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    })
    
    return ()=>{
      socket.off('onlineUsers');
      socket.off('newUser_online');
      socket.off('newUser_offline');
    };
  }, [socket, team, user]);

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
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back
      </button>

      {/* Team Title */}
      <h2 className="text-4xl font-extrabold text-gray-900 mb-7 tracking-tight">
        {team.name}
      </h2>

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

      {/* Members */}
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
              aria-label={`Member ${member.fullName} ${
                member.isLeader ? "Admin" : "Member"
              }${member.isCurrentUser ? ", You" : ""}`}
              className={`flex items-center justify-between p-3 rounded-lg border transition-shadow cursor-pointer
                ${
                  member.isCurrentUser
                    ? "bg-sky-100 border-sky-400 shadow-md"
                    : "bg-white border-gray-200 hover:shadow-lg"
                }`}
            >
              <span style={{color: 'red'}}>{member.isOnline ? 'Online' : 'Offline'}</span>

              <span
                className={`font-semibold truncate ${
                  member.isCurrentUser ? "text-sky-900" : "text-gray-900"
                }`}
                title={member.fullName}
              >
                {member.fullName}
              </span>

              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full select-none whitespace-nowrap ${
                  member.isLeader
                    ? "bg-gray-900 text-white"
                    : "bg-gray-300 text-gray-700"
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
