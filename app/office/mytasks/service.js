const { MongoDBProvider } = require('../../../shared/mongodb/db.provider');
const q = require('q');

const SPACE_COLLECTION = 'space';
const PROJECT_COLLECTION = 'project';
const TASK_COLLECTION = 'task';

class MyTasksService {
    constructor() { }

    getAssignedTasks(dbname_prefix, username) {
        let dfd = q.defer();

        const taskPipeline = [
            {
                $match: {
                    $and: [
                        { isdeleted: { $ne: true } },
                        { isactive: true },
                        {
                            $or: [
                                { "assignees": username },
                                { "assignees.username": username }
                            ]
                        }
                    ]
                }
            },
            {
                $project: {
                    _id: 1, title: 1, code: 1, status: 1, priority: 1,
                    dueDate: 1, startDate: 1, space_id: 1, project_id: 1,
                    assignees: 1, created_at: 1
                }
            },
            { $sort: { status: 1, priority: -1, dueDate: 1 } }
        ];

        q.all([
            MongoDBProvider.loadAggregate_onOffice(dbname_prefix, TASK_COLLECTION, taskPipeline),
            MongoDBProvider.loadAggregate_onOffice(dbname_prefix, SPACE_COLLECTION, [
                { $match: { "members.username": username, isdeleted: { $ne: true }, isactive: true } },
                { $project: { _id: 1, name: 1 } }
            ]),
            MongoDBProvider.loadAggregate_onOffice(dbname_prefix, PROJECT_COLLECTION, [
                { $match: { "members.username": username, isdeleted: { $ne: true }, isactive: true } },
                { $project: { _id: 1, name: 1 } }
            ])
        ]).then(function (results) {
            const tasks = results[0] || [];
            const spaces = results[1] || [];
            const projects = results[2] || [];

            var spaceMap = {};
            spaces.forEach(function (s) { spaceMap[s._id.toString()] = s.name || 'Unknown'; });
            var projectMap = {};
            projects.forEach(function (p) { projectMap[p._id.toString()] = p.name || 'General'; });

            var enriched = tasks.map(function (t) {
                return {
                    _id: t._id,
                    title: t.title,
                    code: t.code,
                    status: t.status || 'Pending',
                    priority: t.priority || 'None',
                    dueDate: t.dueDate,
                    startDate: t.startDate,
                    space_id: t.space_id,
                    project_id: t.project_id,
                    spaceName: spaceMap[t.space_id] || 'Unknown',
                    projectName: projectMap[t.project_id] || 'General'
                };
            });

            // Group by status
            var grouped = {};
            enriched.forEach(function (t) {
                if (!grouped[t.status]) grouped[t.status] = [];
                grouped[t.status].push(t);
            });

            dfd.resolve({
                total: enriched.length,
                tasks: enriched,
                grouped: grouped
            });
        }).catch(function (err) {
            dfd.reject({ mes: err.mes || "Failed to load assigned tasks" });
        });

        return dfd.promise;
    }

    getTodayAndOverdue(dbname_prefix, username) {
        let dfd = q.defer();

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);

        const taskPipeline = [
            {
                $match: {
                    $and: [
                        { isdeleted: { $ne: true } },
                        { isactive: true },
                        { status: { $ne: 'Completed' } },
                        { dueDate: { $ne: null, $exists: true } },
                        { dueDate: { $lt: todayEnd } },
                        {
                            $or: [
                                { "assignees": username },
                                { "assignees.username": username }
                            ]
                        }
                    ]
                }
            },
            {
                $project: {
                    _id: 1, title: 1, code: 1, status: 1, priority: 1,
                    dueDate: 1, startDate: 1, space_id: 1, project_id: 1,
                    assignees: 1, created_at: 1
                }
            },
            { $sort: { dueDate: 1 } }
        ];

        q.all([
            MongoDBProvider.loadAggregate_onOffice(dbname_prefix, TASK_COLLECTION, taskPipeline),
            MongoDBProvider.loadAggregate_onOffice(dbname_prefix, SPACE_COLLECTION, [
                { $match: { "members.username": username, isdeleted: { $ne: true }, isactive: true } },
                { $project: { _id: 1, name: 1 } }
            ]),
            MongoDBProvider.loadAggregate_onOffice(dbname_prefix, PROJECT_COLLECTION, [
                { $match: { "members.username": username, isdeleted: { $ne: true }, isactive: true } },
                { $project: { _id: 1, name: 1 } }
            ])
        ]).then(function (results) {
            const tasks = results[0] || [];
            const spaces = results[1] || [];
            const projects = results[2] || [];

            var spaceMap = {};
            spaces.forEach(function (s) { spaceMap[s._id.toString()] = s.name || 'Unknown'; });
            var projectMap = {};
            projects.forEach(function (p) { projectMap[p._id.toString()] = p.name || 'General'; });

            var overdue = [];
            var today = [];

            tasks.forEach(function (t) {
                var due = new Date(t.dueDate);
                var enriched = {
                    _id: t._id,
                    title: t.title,
                    code: t.code,
                    status: t.status || 'Pending',
                    priority: t.priority || 'None',
                    dueDate: t.dueDate,
                    space_id: t.space_id,
                    project_id: t.project_id,
                    spaceName: spaceMap[t.space_id] || 'Unknown',
                    projectName: projectMap[t.project_id] || 'General'
                };

                if (due < todayStart) {
                    enriched.overdueDays = Math.ceil((todayStart.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
                    overdue.push(enriched);
                } else {
                    today.push(enriched);
                }
            });

            dfd.resolve({
                overdueCount: overdue.length,
                todayCount: today.length,
                total: overdue.length + today.length,
                overdue: overdue,
                today: today
            });
        }).catch(function (err) {
            dfd.reject({ mes: err.mes || "Failed to load today and overdue tasks" });
        });

        return dfd.promise;
    }
}

exports.MyTasksService = new MyTasksService();
