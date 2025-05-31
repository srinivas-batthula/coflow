export default function ParticipantsSection({ team, onBack }) {
  const leaderId = team.leader;

  const members = team.member_details.filter((m) => m._id !== leaderId);
  const leader = team.member_details.find((m) => m._id === leaderId);

  return (
    <div className="w-full h-full p-6 bg-white rounded-xl shadow-md flex flex-col justify-between">
      <div>
        {/* Back Button */}
        <button
          className="mb-4 text-blue-600 hover:underline text-sm font-medium"
          onClick={onBack}
        >
          ← Back
        </button>

        {/* Team Name & Description */}
        <h2 className="text-2xl font-bold text-gray-800 mb-1">{team.name}</h2>
        <p className="text-gray-500 text-sm mb-6 italic">
          {team.project_description}
        </p>

        {/* Members List */}
        <h3 className="text-lg font-semibold text-gray-700 mb-3">👥 Members</h3>
        <ul className="space-y-2">
          {members.map((member) => (
            <li
              key={member._id}
              className="flex items-center justify-between bg-gray-50 border border-gray-200 p-2 rounded-md hover:bg-gray-100 transition text-sm text-gray-700"
            >
              {member.fullName}
              <span className="text-xs text-gray-400">Member</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Leader at the Bottom */}
      {leader && (
        <div className="pt-6 mt-6 border-t">
          <h3 className="text-md font-medium text-gray-600 mb-2">👑 Admin</h3>
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-md shadow-sm text-sm">
            {leader.fullName}
            <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
              Leader
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
