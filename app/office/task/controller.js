const q = require('q');
const { TaskService } = require('./service');
const { MongoDBProvider } = require('../../../shared/mongodb/db.provider');


class TaskController {
    constructor() { }

    load(data) {
        let dfd = q.defer();
        const dbname_prefix = data._service[0].dbname_prefix;
        const username = data.username;

        TaskService.load(dbname_prefix, username, data.data).then(function (result) {
            dfd.resolve(result);
        }).catch(function (err) {
            dfd.reject({
                mes: err.mes ? err.mes : "Unexpected error occurred while load task",
            });
        });
        return dfd.promise;
    }

    count(data) {
        let dfd = q.defer();
        const dbname_prefix = data._service[0].dbname_prefix;
        const username = data.username;

        TaskService.count(dbname_prefix, username, data.data).then(function (result) {
            dfd.resolve(result);
        }).catch(function (err) {
            dfd.reject({
                mes: err.mes ? err.mes : "Unexpected error occurred while count task",
            });
        });
        return dfd.promise;
    }

    loadDetails(data) {
        let dfd = q.defer();
        const dbname_prefix = data._service[0].dbname_prefix;
        const username = data.username;
        const task_id = data.id;

        TaskService.loadDetails(dbname_prefix, username, task_id).then(function (result) {
            dfd.resolve(result);
        }).catch(function (err) {
            dfd.reject({
                mes: err.mes ? err.mes : "Unexpected error occurred while load details task",
            });
        });
        return dfd.promise;
    }

    insert(data) {
        let dfd = q.defer();
        const dbname_prefix = (data._service && data._service[0]) ? data._service[0].dbname_prefix : 'tst';
        const username = data.username;
        const { title, description, status, priority, startDate, dueDate, attachments, project_id, space_id, assignees, parent_id, dependencies, tags } = data;

        TaskService.insert(dbname_prefix, username, title, description, status, priority, startDate, dueDate, attachments, project_id, space_id, assignees, parent_id, dependencies, tags).then(function () {
            dfd.resolve(true);
        }).catch(function (err) {
            dfd.reject({
                mes: err.mes ? err.mes : "Unexpected error occurred while insert task",
            });
        });
        return dfd.promise;
    }

    update(data) {
        let dfd = q.defer();
        const dbname_prefix = data._service[0].dbname_prefix;
        const username = data.username;
        const id = data.id;

        TaskService.update(dbname_prefix, username, id, data.data).then(function () {
            dfd.resolve(true);
        }).catch(function (err) {
            dfd.reject({
                mes: err.mes ? err.mes : "Unexpected error occurred while update task",
            });
        });
        return dfd.promise;
    }

    delete(data) {
        let dfd = q.defer();
        const dbname_prefix = data._service[0].dbname_prefix;
        const username = data.username;

        TaskService.delete(dbname_prefix, username, data.id).then(function () {
            dfd.resolve(true);
        }).catch(function (err) {
            dfd.reject({
                mes: err.mes ? err.mes : "Unexpected error occurred while delete task",
            });
        });
        return dfd.promise;
    }

    loadTaskByProject(data) {
        let dfd = q.defer();
        const dbname_prefix = data._service[0].dbname_prefix;
        const username = data.username;
        const project_id = data.project_id;

        TaskService.loadTaskByProject(dbname_prefix, username, project_id).then(function (result) {
            dfd.resolve(result);
        }).catch(function (err) {
            dfd.reject({
                mes: err.mes ? err.mes : "Unexpected error occurred while load task by project",
            });
        });
        return dfd.promise;
    }

    addComment(data) {
        let dfd = q.defer();
        const dbname_prefix = data._service[0].dbname_prefix;
        const username = data.username;
        const { task_id, content, attachments, mentions } = data.body || data;

        TaskService.addComment(dbname_prefix, username, task_id, content, attachments, mentions).then(function (result) {
            dfd.resolve(result);
        }).catch(function (err) {
            dfd.reject({
                mes: err.mes ? err.mes : "Unexpected error occurred while adding comment",
            });
        });
        return dfd.promise;
    }

    updateComment(data) {
        let dfd = q.defer();
        const dbname_prefix = data._service[0].dbname_prefix;
        const username = data.username;
        const { task_id, comment_id, content, attachments, mentions } = data.body || data;

        TaskService.updateComment(dbname_prefix, username, task_id, comment_id, content, attachments, mentions).then(function () {
            dfd.resolve(true);
        }).catch(function (err) {
            dfd.reject({
                mes: err.mes ? err.mes : "Unexpected error occurred while updating comment",
            });
        });
        return dfd.promise;
    }

    deleteComment(data) {
        let dfd = q.defer();
        const dbname_prefix = data._service[0].dbname_prefix;
        const username = data.username;
        const { task_id, comment_id } = data.body || data;

        TaskService.deleteComment(dbname_prefix, username, task_id, comment_id).then(function () {
            dfd.resolve(true);
        }).catch(function (err) {
            dfd.reject({
                mes: err.mes ? err.mes : "Unexpected error occurred while deleting comment",
            });
        });
        return dfd.promise;
    }
    duplicate(data) {
        let dfd = q.defer();
        const dbname_prefix = data._service[0].dbname_prefix;
        const username = data.username;

        TaskService.duplicate(dbname_prefix, username, data.id).then(function (result) {
            dfd.resolve(result);
        }).catch(function (err) {
            dfd.reject({ mes: err.mes ? err.mes : "Unexpected error occurred while duplicating task" });
        });
        return dfd.promise;
    }

    archive(data) {
        let dfd = q.defer();
        const dbname_prefix = data._service[0].dbname_prefix;
        const username = data.username;

        TaskService.archive(dbname_prefix, username, data.id).then(function () {
            dfd.resolve(true);
        }).catch(function (err) {
            dfd.reject({ mes: err.mes ? err.mes : "Unexpected error occurred while archiving task" });
        });
        return dfd.promise;
    }

    loadArchived(data) {
        let dfd = q.defer();
        const dbname_prefix = data._service[0].dbname_prefix;
        const username = data.username;

        TaskService.loadArchived(dbname_prefix, username).then(function (result) {
            dfd.resolve(result);
        }).catch(function (err) {
            dfd.reject({ mes: err.mes ? err.mes : "Unexpected error occurred while loading archived tasks" });
        });
        return dfd.promise;
    }

    unarchive(data) {
        let dfd = q.defer();
        const dbname_prefix = data._service[0].dbname_prefix;
        const username = data.username;

        TaskService.unarchive(dbname_prefix, username, data.id).then(function () {
            dfd.resolve(true);
        }).catch(function (err) {
            dfd.reject({ mes: err.mes ? err.mes : "Unexpected error occurred while unarchiving task" });
        });
        return dfd.promise;
    }

    sendEmail(data) {
        let dfd = q.defer();
        const dbname_prefix = data._service[0].dbname_prefix;
        const username = data.username;

        TaskService.sendEmail(dbname_prefix, username, data.id, data.toEmail).then(function () {
            dfd.resolve(true);
        }).catch(function (err) {
            dfd.reject({ mes: err.mes ? err.mes : "Unexpected error occurred while sending email" });
        });
        return dfd.promise;
    }
}

exports.TaskController = new TaskController();

