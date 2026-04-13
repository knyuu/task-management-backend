const { MongoDBProvider } = require('../../../shared/mongodb/db.provider');
const q = require('q');

const SPACE_COLLECTION = 'space';
const PROJECT_COLLECTION = 'project';
const TASK_COLLECTION = 'task';

class DashboardService {
    constructor() { }

    async getSummary(dbname_prefix, username) {
        try {
            const { spaces, projects, tasks } = await this._loadRawData(dbname_prefix, username);
            const userMap = await this._enrichUserProfiles(dbname_prefix, spaces, projects, tasks);
            return this._calculateDashboard(spaces, projects, tasks, userMap, username);
        } catch (err) {
            throw { mes: err.mes || "Unexpected error occurred during dashboard summary" };
        }
    }

    async _loadRawData(dbname_prefix, username) {
        const spacePipeline = [
            { $match: { "members.username": username, isdeleted: { $ne: true }, isactive: true } },
            { $project: { _id: 1, name: 1, title: "$name", description: 1, icon: 1, iconColor: 1, members: 1, projects: 1, created_at: 1 } }
        ];

        const projectPipeline = [
            { $match: { $and: [{ $or: [{ "members.username": username }, { "username": username }] }, { isdeleted: { $ne: true } }, { isactive: true }] } },
            { $project: { _id: 1, name: 1, title: "$name", space_id: 1, members: 1, created_at: 1 } }
        ];

        const taskPipeline = [
            { $match: { isdeleted: { $ne: true }, isactive: true, $or: [{ "assignees": username }, { "assignees.username": username }, { "username": username }, { "history.user": username }] } },
            { $project: { _id: 1, title: 1, code: 1, status: 1, priority: 1, dueDate: 1, startDate: 1, space_id: 1, project_id: 1, assignees: 1, history: 1, created_at: 1 } }
        ];

        const [spaces, projects, tasks] = await q.all([
            MongoDBProvider.loadAggregate_onOffice(dbname_prefix, SPACE_COLLECTION, spacePipeline),
            MongoDBProvider.loadAggregate_onOffice(dbname_prefix, PROJECT_COLLECTION, projectPipeline),
            MongoDBProvider.loadAggregate_onOffice(dbname_prefix, TASK_COLLECTION, taskPipeline)
        ]);

        return { spaces: spaces || [], projects: projects || [], tasks: tasks || [] };
    }

    async _enrichUserProfiles(dbname_prefix, spaces, projects, tasks) {
        const allUsernames = new Set();
        spaces.forEach(s => (s.members || []).forEach(m => m.username && allUsernames.add(m.username)));
        projects.forEach(p => (p.members || []).forEach(m => m.username && allUsernames.add(m.username)));
        tasks.forEach(t => {
            (t.history || []).forEach(h => h.user && allUsernames.add(h.user));
            (t.assignees || []).forEach(u => {
                if (typeof u === 'string') allUsernames.add(u);
                else if (u.username) allUsernames.add(u.username);
            });
        });

        const usernames = Array.from(allUsernames);
        const userMap = {};
        if (usernames.length === 0) return userMap;

        const users = await MongoDBProvider.load_onManagement(dbname_prefix, "user",
            { username: { $in: usernames } },
            usernames.length, 0, {},
            { username: true, title: true, avatar_url: true }
        );

        (users || []).forEach(u => {
            userMap[u.username] = {
                title: u.title || u.username,
                avatar_url: u.avatar_url || null
            };
        });
        return userMap;
    }

    async getEnrichedTasks(dbname_prefix, username, filter) {
        const { spaces, projects, tasks } = await this._loadRawData(dbname_prefix, username);
        // If filter is provided, we might want to apply it to tasks, but _loadRawData already filters for 'my tasks'
        // Let's use the full list for now as 'My Tasks' implies the current user's scope.
        const userMap = await this._enrichUserProfiles(dbname_prefix, spaces, projects, tasks);
        
        const spaceMap = {};
        spaces.forEach(s => spaceMap[s._id.toString()] = s.title || s.name || 'Unknown');
        const projectMap = {};
        projects.forEach(p => projectMap[p._id.toString()] = p.title || p.name || 'General');

        return tasks.map(t => {
            const firstAssignee = (t.assignees || [])[0];
            const assigneeUsername = typeof firstAssignee === 'string' ? firstAssignee : (firstAssignee?.username || null);
            const assigneeInfo = userMap[assigneeUsername] || {};

            return {
                _id: t._id,
                title: t.title,
                code: t.code,
                status: t.status,
                priority: t.priority,
                dueDate: t.dueDate,
                space_id: t.space_id,
                project_id: t.project_id,
                spaceName: spaceMap[t.space_id] || 'Unknown',
                projectName: projectMap[t.project_id] || 'General',
                assigneeTitle: assigneeInfo.title || assigneeUsername,
                assigneeAvatar: assigneeInfo.avatar_url
            };
        });
    }

    _calculateDashboard(spaces, projects, tasks, userMap, username) {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekEnd = new Date(todayStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        // Helper Maps
        const spaceMap = {};
        spaces.forEach(s => spaceMap[s._id.toString()] = s.title || s.name || 'Unknown');
        const projectMap = {};
        projects.forEach(p => projectMap[p._id.toString()] = p.title || p.name || 'General');

        // Task Categorization
        const pending = tasks.filter(t => t.status !== 'Completed');
        const completed = tasks.filter(t => t.status === 'Completed');
        const inProgress = tasks.filter(t => t.status === 'In Progress');
        const overdue = pending.filter(t => t.dueDate && new Date(t.dueDate) < todayStart);
        const dueThisWeek = pending.filter(t => t.dueDate && new Date(t.dueDate) >= todayStart && new Date(t.dueDate) < weekEnd);

        // Distributions
        const statusDist = {};
        tasks.forEach(t => statusDist[t.status || 'Unknown'] = (statusDist[t.status || 'Unknown'] || 0) + 1);
        const priorityDist = {};
        pending.forEach(t => priorityDist[t.priority || 'None'] = (priorityDist[t.priority || 'None'] || 0) + 1);

        // Space Overview Enrichment
        const spacesOverview = spaces.map(s => {
            const sid = s._id.toString();
            const spaceTasks = tasks.filter(t => t.space_id === sid);
            return {
                _id: s._id,
                name: s.title || s.name,
                description: s.description || '',
                icon: s.icon,
                iconColor: s.iconColor,
                members: (s.members || []).map(m => {
                    const info = userMap[m.username] || {};
                    return { username: m.username, title: info.title || m.title || m.username, role: m.role, avatar_url: info.avatar_url || null };
                }),
                projectCount: projects.filter(p => p.space_id === sid).length,
                taskCount: spaceTasks.length,
                completedCount: spaceTasks.filter(t => t.status === 'Completed').length,
                overdueCount: spaceTasks.filter(t => t.dueDate && t.status !== 'Completed' && new Date(t.dueDate) < todayStart).length
            };
        });

        // Recent Activity Enrichment
        let recentActivity = [];
        tasks.forEach(t => {
            (t.history || []).forEach(h => {
                const info = userMap[h.user] || {};
                recentActivity.push({
                    user: h.user,
                    title: info.title || h.user,
                    avatar_url: info.avatar_url || null,
                    action: h.action || 'update',
                    time: h.time,
                    task_title: t.title,
                    task_id: t._id,
                    space_id: t.space_id,
                    project_id: t.project_id
                });
            });
        });
        recentActivity.sort((a, b) => new Date(b.time) - new Date(a.time));

        return {
            stats: {
                spaces: spaces.length,
                projects: projects.length,
                totalTasks: tasks.length,
                pendingTasks: pending.length,
                inProgressTasks: inProgress.length,
                completedTasks: completed.length,
                overdueTasks: overdue.length,
                dueThisWeek: dueThisWeek.length
            },
            statusDistribution: statusDist,
            priorityDistribution: priorityDist,
            spacesOverview,
            recentTasks: pending.map(t => ({
                _id: t._id,
                title: t.title,
                code: t.code,
                status: t.status,
                priority: t.priority,
                dueDate: t.dueDate,
                spaceName: spaceMap[t.space_id] || 'Unknown',
                projectName: projectMap[t.project_id] || 'General',
                isOverdue: t.dueDate ? new Date(t.dueDate) < todayStart : false
            })).sort((a, b) => (a.isOverdue === b.isOverdue) ? 0 : a.isOverdue ? -1 : 1).slice(0, 10),
            recentProjects: projects.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5).map(p => ({
                _id: p._id,
                name: p.title || p.name,
                space_id: p.space_id,
                spaceName: spaceMap[p.space_id] || 'Unknown',
                members: (p.members || []).slice(0, 3).map(m => ({
                    username: m.username,
                    avatar_url: (userMap[m.username] || {}).avatar_url
                })),
                memberCount: (p.members || []).length,
                created_at: p.created_at
            })),
            recentActivity: recentActivity.slice(0, 10)
        };
    }
}

exports.DashboardService = new DashboardService();
