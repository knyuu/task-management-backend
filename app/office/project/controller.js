const q = require('q');
const { ProjectService } = require('./service');
const { MongoDBProvider } = require('../../../shared/mongodb/db.provider');


class ProjectController {
    constructor() { }

    load(data) {
        let dfd = q.defer();
        const dbname_prefix = data._service[0].dbname_prefix;
        const username = data.username;

        ProjectService.load(dbname_prefix, username, data.data).then(function (result) {
            dfd.resolve(result);
        }).catch(function (err) {
            dfd.reject({
                mes: err.mes ? err.mes : "Unexpected error occurred while load project",
            });
        });
        return dfd.promise;
    }

    count(data) {
        let dfd = q.defer();
        const dbname_prefix = data._service[0].dbname_prefix;
        const username = data.username;

        ProjectService.count(dbname_prefix, username, data.data).then(function (result) {
            dfd.resolve(result);
        }).catch(function (err) {
            dfd.reject({
                mes: err.mes ? err.mes : "Unexpected error occurred while count project",
            });
        });
        return dfd.promise;
    }

    loadDetails(data) {
        let dfd = q.defer();
        const dbname_prefix = data._service[0].dbname_prefix;
        const username = data.username;
        const project_id = data.id;

        ProjectService.loadDetails(dbname_prefix, username, project_id).then(function (result) {
            dfd.resolve(result);
        }).catch(function (err) {
            dfd.reject({
                mes: err.mes ? err.mes : "Unexpected error occurred while load details project",
            });
        });
        return dfd.promise;
    }

    insert(data) {
        let dfd = q.defer();
        const dbname_prefix = data._service[0].dbname_prefix;
        const username = data.username;

        ProjectService.insert(dbname_prefix, username, data.data).then(function () {
            dfd.resolve(true);
        }).catch(function (err) {
            dfd.reject({
                mes: err.mes ? err.mes : "Unexpected error occurred while insert project",
            });
        });
        return dfd.promise;
    }

    update(data) {
        let dfd = q.defer();
        const dbname_prefix = data._service[0].dbname_prefix;
        const username = data.username;
        const id = data.id;

        ProjectService.update(dbname_prefix, username, id, data.data).then(function () {
            dfd.resolve(true);
        }).catch(function (err) {
            dfd.reject({
                mes: err.mes ? err.mes : "Unexpected error occurred while update project",
            });
        });
        return dfd.promise;
    }

    delete(data) {
        let dfd = q.defer();
        const dbname_prefix = data._service[0].dbname_prefix;
        const username = data.username;
        const id = data.id;

        ProjectService.delete(dbname_prefix, username, id).then(function () {
            dfd.resolve(true);
        }).catch(function (err) {
            dfd.reject({
                mes: err.mes ? err.mes : "Unexpected error occurred while delete project",
            });
        });
        return dfd.promise;
    }

    loadProjectBySpace(data) {
        let dfd = q.defer();
        const dbname_prefix = data._service[0].dbname_prefix;
        const username = data.username;
        const space_id = data.space_id;

        ProjectService.loadProjectBySpace(dbname_prefix, username, space_id).then(function (result) {
            dfd.resolve(result);
        }).catch(function (err) {
            dfd.reject({
                mes: err.mes ? err.mes : "Unexpected error occurred while load project by space",
            });
        });
        return dfd.promise;
    }
    archiveProject(data) {
        let dfd = q.defer();
        const dbname_prefix = data._service[0].dbname_prefix;
        const username = data.username;
        ProjectService.archiveProject(dbname_prefix, username, data.id).then(function () {
            dfd.resolve(true);
        }).catch(function (err) { dfd.reject({ mes: err.mes || "Failed to archive project" }); });
        return dfd.promise;
    }

    unarchiveProject(data) {
        let dfd = q.defer();
        const dbname_prefix = data._service[0].dbname_prefix;
        const username = data.username;
        ProjectService.unarchiveProject(dbname_prefix, username, data.id).then(function () {
            dfd.resolve(true);
        }).catch(function (err) { dfd.reject({ mes: err.mes || "Failed to unarchive project" }); });
        return dfd.promise;
    }

    loadArchived(data) {
        let dfd = q.defer();
        const dbname_prefix = data._service[0].dbname_prefix;
        const username = data.username;
        ProjectService.loadArchived(dbname_prefix, username).then(function (result) {
            dfd.resolve(result);
        }).catch(function (err) { dfd.reject({ mes: err.mes || "Failed to load archived projects" }); });
        return dfd.promise;
    }
}

exports.ProjectController = new ProjectController();

