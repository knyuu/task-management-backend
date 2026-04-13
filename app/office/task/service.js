const { MongoDBProvider } = require('../../../shared/mongodb/db.provider');
const q = require('q');
const { ObjectId } = require('mongodb');
const TaskEmailProvider = require('../../../shared/email/task-email.provider');

const TASK_COLLECTION = 'task';

function generateTaskCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 7; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
}

class TaskService {
    constructor() { }

    load(dbname_prefix, username, data) {
        let filter = data || {};
        const pipeline = [
            {
                $match: {
                    $and: [
                        { isdeleted: { $ne: true } },
                        { isarchived: { $ne: true } },
                        filter
                    ]
                }
            }
        ];
        return MongoDBProvider.loadAggregate_onOffice(dbname_prefix, TASK_COLLECTION, pipeline);
    }

    count(dbname_prefix, data) {
        return MongoDBProvider.count_onOffice(dbname_prefix, TASK_COLLECTION, data);
    }

    loadDetails(dbname_prefix, username, task_id) {
        return MongoDBProvider.load_onOffice(dbname_prefix, TASK_COLLECTION, {
            _id: new ObjectId(task_id),
            isactive: true
        });
    }

    insert(dbname_prefix, username, title, description, status, priority, startDate, dueDate, attachments, project_id, space_id, assignees, parent_id, dependencies, tags) {
        let dfd = q.defer();
        let history = [];
        const action = {
            user: username,
            action: 'create_task',
            time: new Date(),
        }
        history.push(action);

        const code = generateTaskCode();

        const data = {
            title,
            description,
            status,
            priority,
            startDate,
            dueDate,
            attachments,
            project_id,
            space_id,
            assignees: assignees || [],
            parent_id: parent_id || null,
            dependencies: Array.isArray(dependencies) ? dependencies : [],
            tags: Array.isArray(tags) ? tags : [],
            code,
            sequence: Date.now(),
            isactive: true,
            history
        };
        MongoDBProvider.insert_onOffice(dbname_prefix, TASK_COLLECTION, username, data).then(function (result) {
            const projectId = project_id;
            const taskId = result.ops[0]._id;
            MongoDBProvider.update_onOffice(dbname_prefix, 'project', username, { _id: new ObjectId(projectId) }, { $push: { tasks: taskId.toString() } }).then(function () {
                dfd.resolve(result);
            }, function (err) {
                console.error("Failed to update project with task id", err);
                dfd.resolve(result);
            });

        }, function (err) {
            dfd.reject(err);
        });
        return dfd.promise;
    }

    update(dbname_prefix, username, id, data) {
        return MongoDBProvider.update_onOffice(
            dbname_prefix,
            TASK_COLLECTION,
            username,
            { _id: new ObjectId(id) },
            { $set: data }
        );
    }

    delete(dbname_prefix, username, id) {
        let dfd = q.defer();
        const filter = { _id: new ObjectId(id) };
        // First load the task to get project_id, then delete + remove from project.tasks
        MongoDBProvider.load_onOffice(dbname_prefix, TASK_COLLECTION, { _id: new ObjectId(id), isactive: true }).then(function (tasks) {
            const task = Array.isArray(tasks) ? tasks[0] : tasks;
            MongoDBProvider.delete_onOffice(dbname_prefix, TASK_COLLECTION, username, filter).then(function (result) {
                // Remove task ID from project.tasks array
                if (task && task.project_id) {
                    MongoDBProvider.update_onOffice(dbname_prefix, 'project', username, { _id: new ObjectId(task.project_id) }, { $pull: { tasks: id.toString() } }).then(function () {
                        dfd.resolve(result);
                    }, function () {
                        dfd.resolve(result);
                    });
                } else {
                    dfd.resolve(result);
                }
            }, function (err) {
                dfd.reject(err);
            });
        }, function (err) {
            dfd.reject(err);
        });
        return dfd.promise;
    }

    loadTaskByProject(dbname_prefix, username, project_id) {
        return MongoDBProvider.load_onOffice(dbname_prefix, TASK_COLLECTION, {
            project_id: project_id,
            isactive: true,
            isarchived: { $ne: true }
        });
    }

    addComment(dbname_prefix, username, task_id, content, attachments = [], mentions = []) {
        const comment = {
            id: new ObjectId().toString(),
            user: username,
            content,
            attachments,
            mentions,
            time: new Date(),
            isEdited: false
        };
        return MongoDBProvider.update_onOffice(
            dbname_prefix,
            TASK_COLLECTION,
            username,
            { _id: new ObjectId(task_id) },
            { $push: { comments: comment } }
        ).then(() => comment);
    }

    updateComment(dbname_prefix, username, task_id, comment_id, content, attachments, mentions) {
        return MongoDBProvider.update_onOffice(
            dbname_prefix,
            TASK_COLLECTION,
            username,
            { _id: new ObjectId(task_id), "comments.id": comment_id, "comments.user": username },
            {
                $set: {
                    "comments.$.content": content,
                    "comments.$.attachments": attachments,
                    "comments.$.mentions": mentions,
                    "comments.$.isEdited": true,
                    "comments.$.editTime": new Date()
                }
            }
        );
    }

    deleteComment(dbname_prefix, username, task_id, comment_id) {
        const historyLog = {
            user: username,
            action: 'delete_comment',
            time: new Date()
        };
        return MongoDBProvider.update_onOffice(
            dbname_prefix,
            TASK_COLLECTION,
            username,
            { _id: new ObjectId(task_id), "comments.id": comment_id, "comments.user": username },
            {
                $pull: { comments: { id: comment_id } },
                $push: { history: historyLog }
            }
        );
    }

    duplicate(dbname_prefix, username, taskId) {
        let dfd = q.defer();
        MongoDBProvider.load_onOffice(dbname_prefix, TASK_COLLECTION, { _id: new ObjectId(taskId) }).then(function (tasks) {
            const original = Array.isArray(tasks) ? tasks[0] : tasks;
            if (!original) { dfd.reject({ mes: 'Task not found' }); return; }

            const code = generateTaskCode();
            const data = {
                title: 'Copy of ' + (original.title || ''),
                description: original.description || '',
                status: original.status,
                priority: original.priority || 'normal',
                startDate: original.startDate || null,
                dueDate: original.dueDate || null,
                attachments: original.attachments || [],
                project_id: original.project_id,
                space_id: original.space_id,
                assignees: original.assignees || [],
                parent_id: original.parent_id || null,
                dependencies: [],
                tags: original.tags || [],
                customFields: original.customFields || {},
                code,
                sequence: Date.now(),
                isactive: true,
                history: [{ user: username, action: 'duplicate_task', time: new Date(), source_task: taskId }]
            };

            MongoDBProvider.insert_onOffice(dbname_prefix, TASK_COLLECTION, username, data).then(function (result) {
                const newTaskId = result.ops[0]._id;
                if (original.project_id) {
                    MongoDBProvider.update_onOffice(dbname_prefix, 'project', username, { _id: new ObjectId(original.project_id) }, { $push: { tasks: newTaskId.toString() } }).then(function () {
                        dfd.resolve(result);
                    }, function () {
                        dfd.resolve(result);
                    });
                } else {
                    dfd.resolve(result);
                }
            }, function (err) { dfd.reject(err); });
        }, function (err) { dfd.reject(err); });
        return dfd.promise;
    }

    archive(dbname_prefix, username, taskId) {
        let dfd = q.defer();
        MongoDBProvider.load_onOffice(dbname_prefix, TASK_COLLECTION, { _id: new ObjectId(taskId) }).then(function (tasks) {
            const task = Array.isArray(tasks) ? tasks[0] : tasks;
            MongoDBProvider.update_onOffice(dbname_prefix, TASK_COLLECTION, username, { _id: new ObjectId(taskId) }, { $set: { isarchived: true } }).then(function (result) {
                if (task && task.project_id) {
                    MongoDBProvider.update_onOffice(dbname_prefix, 'project', username, { _id: new ObjectId(task.project_id) }, { $pull: { tasks: taskId.toString() } }).then(function () {
                        dfd.resolve(result);
                    }, function () {
                        dfd.resolve(result);
                    });
                } else {
                    dfd.resolve(result);
                }
            }, function (err) { dfd.reject(err); });
        }, function (err) { dfd.reject(err); });
        return dfd.promise;
    }

    sendEmail(dbname_prefix, username, taskId, toEmail) {
        let dfd = q.defer();

        MongoDBProvider.load_onOffice(dbname_prefix, TASK_COLLECTION, { _id: new ObjectId(taskId) }).then(function (tasks) {
            const task = Array.isArray(tasks) ? tasks[0] : tasks;
            if (!task) { dfd.reject({ mes: 'Task not found' }); return; }
            TaskEmailProvider.sendTaskAssignmentEmail({
                toEmail: toEmail,
                assigneeName: '',
                assignerName: username,
                taskName: task.title,
                projectName: '',
                dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : null,
                taskUrl: null
            }).then(function () {
                dfd.resolve(true);
            }, function (err) { dfd.reject(err); });
        }, function (err) { dfd.reject(err); });
        return dfd.promise;
    }
    loadArchived(dbname_prefix, username) {
        const pipeline = [
            {
                $match: {
                    isarchived: true,
                    isdeleted: { $ne: true }
                }
            },
            { $sort: { _id: -1 } }
        ];
        return MongoDBProvider.loadAggregate_onOffice(dbname_prefix, TASK_COLLECTION, pipeline);
    }

    unarchive(dbname_prefix, username, taskId) {
        let dfd = q.defer();
        MongoDBProvider.load_onOffice(dbname_prefix, TASK_COLLECTION, { _id: new ObjectId(taskId) }).then(function (tasks) {
            const task = Array.isArray(tasks) ? tasks[0] : tasks;
            MongoDBProvider.update_onOffice(dbname_prefix, TASK_COLLECTION, username, { _id: new ObjectId(taskId) }, { $set: { isarchived: false } }).then(function (result) {
                if (task && task.project_id) {
                    MongoDBProvider.update_onOffice(dbname_prefix, 'project', username, { _id: new ObjectId(task.project_id) }, { $push: { tasks: taskId.toString() } }).then(function () {
                        dfd.resolve(result);
                    }, function () {
                        dfd.resolve(result);
                    });
                } else {
                    dfd.resolve(result);
                }
            }, function (err) { dfd.reject(err); });
        }, function (err) { dfd.reject(err); });
        return dfd.promise;
    }
}

exports.TaskService = new TaskService();

