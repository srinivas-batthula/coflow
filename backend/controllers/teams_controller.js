require("dotenv").config({ path: "./config.env" });
const Team = require('../models/TeamModel')


const getTeams = async (req, res) => {
    const userId = req.user._id;
    try {
        const my_teams = await Team.find({ members: userId }).lean();
        return res.status(200).json({ success: true, msg: "Fetched Teams!", my_teams })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, msg: "Server error in getTeams!" })
    }
}

const createTeam = async (req, res) => {
    const { name, project_description, github_repo } = req.body;
    const userId = req.user._id;
    if (!name || !project_description)
        return res.status(400).json({ success: false, msg: "Invalid Inputs!" })
    try {
        const finalObj = {
            name,
            members: [userId],
            leader: userId,
            github_repo,
            project_description
        }
        const team = await Team.create(finalObj);
        return res.status(201).json({ success: true, msg: "Created a new Team!", team })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, msg: "Server error in createTeam!" })
    }
}

const joinTeam = async (req, res) => {
    const { teamId } = req.params;
    const userId = req.user._id;
    try {
        const team = await Team.findById(teamId);
        if (!team)
            return res.status(400).json({ success: false, msg: "Invalid Team-ID!" });
        team.members.push(userId);
        await team.save();
        return res.status(201).json({ success: true, msg: "Joined a new Team!", team })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, msg: "Server error in joinTeam!" })
    }
}

const deleteTeam = async (req, res) => {
    const { teamId } = req.params;
    try {
        const team = await Team.findById(teamId).lean();
        if (team && String(team.leader) === String(req.user._id)) {             // Only Team `Leaders` can delete the `Team`...
            const deletedTeam = await Team.findByIdAndDelete(teamId);
            return res.status(200).json({ success: true, msg: "Deleted a Team!", deletedTeam })
        }
        return res.status(401).json({ success: false, msg: "You're not allowed to delete this Team!" })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, msg: "Server error in deleteTeam!" })
    }
}


module.exports = { getTeams, createTeam, joinTeam, deleteTeam }