const { MongoDBProvider } = require('../../../shared/mongodb/db.provider');
const q = require('q');

const SPACE_COLLECTION = 'space';
const PROJECT_COLLECTION = 'project';
const TASK_COLLECTION = 'task';

class CalendarService {
    constructor() { }

    getTasksByDateRange(dbname_prefix, username, startDate, endDate) {
        let dfd = q.defer();

        // Fetch ALL active tasks assigned to user (same pattern as mytasks service)
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
                    assignees: 1, description: 1, created_at: 1
                }
            },
            { $sort: { dueDate: 1, startDate: 1 } }
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

            var rangeStart = new Date(startDate).getTime();
            var rangeEnd = new Date(endDate).getTime();

            // Filter in JS to handle timestamps (numbers), Date objects, or ISO strings
            var filtered = [];
            tasks.forEach(function (t) {
                var dueMs = t.dueDate ? new Date(t.dueDate).getTime() : null;
                var startMs = t.startDate ? new Date(t.startDate).getTime() : null;

                // Check if task overlaps with requested date range
                var inRange = false;
                if (dueMs && dueMs >= rangeStart && dueMs <= rangeEnd) inRange = true;
                if (startMs && startMs >= rangeStart && startMs <= rangeEnd) inRange = true;
                if (startMs && dueMs && startMs <= rangeStart && dueMs >= rangeEnd) inRange = true;
                // Also include tasks without dates that were created in range
                if (!dueMs && !startMs && t.created_at) {
                    var createdMs = new Date(t.created_at).getTime();
                    if (createdMs >= rangeStart && createdMs <= rangeEnd) inRange = true;
                }

                if (inRange) {
                    filtered.push({
                        _id: t._id,
                        title: t.title,
                        code: t.code,
                        status: t.status || 'todo',
                        priority: t.priority || 'normal',
                        dueDate: t.dueDate,
                        startDate: t.startDate,
                        description: t.description || '',
                        space_id: t.space_id,
                        project_id: t.project_id,
                        spaceName: spaceMap[t.space_id] || 'Unknown',
                        projectName: projectMap[t.project_id] || 'General'
                    });
                }
            });

            dfd.resolve({
                total: filtered.length,
                tasks: filtered
            });
        }).catch(function (err) {
            dfd.reject({ mes: err.mes || "Failed to load calendar tasks" });
        });

        return dfd.promise;
    }
}

exports.CalendarService = new CalendarService();
