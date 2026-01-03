const mongoose = require('mongoose');
const Team = require('../models/TeamModel');

const getTeams = async (req, res) => {
    const userId = mongoose.Types.ObjectId.createFromHexString(req.user._id);
    // console.log(userId, typeof userId, userId instanceof mongoose.Types.ObjectId);
    try {
        const my_teams = await Team.aggregate([
            {
                $match: {
                    members: { $in: [userId] },
                },
            },
            {
                $lookup: {
                    from: 'hackpilot_users',
                    localField: 'members',
                    foreignField: '_id',
                    as: 'member_details',
                },
            },
            {
                $addFields: {
                    member_details: {
                        $map: {
                            input: '$member_details',
                            as: 'member',
                            in: {
                                _id: '$$member._id',
                                fullName: '$$member.fullName',
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    github_repo: 1,
                    project_description: 1,
                    leader: 1,
                    member_details: 1,
                    createdAt: 1,
                    updatedAt: 1,
                },
            },
        ]);

        return res.status(200).json({ success: true, msg: 'Fetched Teams!', my_teams });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, msg: 'Server error in getTeams!' });
    }
};

const createTeam = async (req, res) => {
    const { name, project_description, github_repo } = req.body;
    const userId = req.user._id;
    if (!name) return res.status(400).json({ success: false, msg: 'Invalid Inputs!' });
    try {
        const finalObj = {
            name,
            members: [userId],
            leader: userId,
            github_repo,
            project_description,
        };
        const team = await Team.create(finalObj);
        team.members = [{ _id: userId, fullName: req.user.fullName }];
        return res.status(201).json({ success: true, msg: 'Created a new Team!', team });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, msg: 'Server error in createTeam!' });
    }
};

const joinTeam = async (req, res) => {
    const { teamId } = req.params;
    const userId = req.user._id;
    try {
        // Validate ObjectId before querying
        if (!mongoose.Types.ObjectId.isValid(teamId)) {
            return res.status(400).json({ success: false, msg: 'Invalid Team-ID format!' });
        }
        const team = await Team.findById(teamId);
        if (!team) return res.status(400).json({ success: false, msg: 'Invalid Team-ID!' });
        if (!team.members.includes(userId)) {
            team.members.push(userId);
            await team.save();
        }
        return res.status(201).json({ success: true, msg: 'Joined a new Team!', team });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, msg: 'Server error in joinTeam!' });
    }
};

const deleteTeam = async (req, res) => {
    const { teamId } = req.params;
    try {
        const team = await Team.findById(teamId).lean();
        if (team && String(team.leader) === String(req.user._id)) {
            // Only Team `Leaders` can delete the `Team`...
            const deletedTeam = await Team.findByIdAndDelete(teamId);
            return res.status(200).json({ success: true, msg: 'Deleted a Team!', deletedTeam });
        }
        return res
            .status(401)
            .json({ success: false, msg: "You're not allowed to delete this Team!" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, msg: 'Server error in deleteTeam!' });
    }
};

module.exports = { getTeams, createTeam, joinTeam, deleteTeam };
