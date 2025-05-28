// socket/teamSocket.js
const Task = require('../models/taskModel')

const fetchHistory = async ({ teamId, userId, is_leader }) => {
    try {
        const data = is_leader
            ? await Task.find({ teamId }).lean()
            : await Task.find({ $and: { teamId, assigned_to: userId } }).lean();    // Only `tasks` of a 'team && current member' is returned...
        return { success: true, data };
    } catch (error) {
        console.error(error);
        return { success: false, data: [] };
    }
}

const createUpdate = async ({ is_create, body, taskId }) => {
    try {
        const data = is_create
            ? await Task.create(body)
            : await Task.findByIdAndUpdate(taskId, body, { new: true, runValidators: true });  // returns updated document && enforces schema validation...
        return { success: true, data };
    } catch (error) {
        console.error(error);
        return { success: false, data: {} };
    }
}

module.exports = (io, socket) => {
    socket.on('task_history', async ({ teamId, userId, is_leader }) => {   // Fetch previous `tasks` of current user...
        socket.join(userId);
        const result = await fetchHistory(teamId, userId, is_leader);
        socket.emit('task_history', result);
    });

    socket.on("task_create", async ({ task, assigned_to, teamId }) => {     // Task Create...
        const result = await createUpdate(true, { task, assigned_to, teamId }, '');
        socket.emit('task_created', result);
        io.to(assigned_to).emit('task_created', result);
    });

    socket.on("task_review", async ({ taskId, leaderId }) => {        // Task Mark for Review {Only be done by `team-member` not leader}...
        const result = await createUpdate(false, { status: 'under review' }, taskId);
        socket.emit('task_updated', result);
        io.to(leaderId).emit('task_updated', result);
    });

    socket.on("task_approve", async ({ taskId, assigned_to }) => {        // Task Approve {Only be done by `leader`}...
        const result = await createUpdate(false, { status: 'completed' }, taskId);
        socket.emit('task_updated', result);
        io.to(assigned_to).emit('task_updated', result);
    });

    socket.on("task_delete", async ({ taskId, assigned_to }) => {        // Task Delete {Only be done by `leader`}...
        const result = await Task.findByIdAndDelete(taskId);
        socket.emit('task_deleted', result);
        io.to(assigned_to).emit('task_deleted', result);
    });
};