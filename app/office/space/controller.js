const q = require('q');
const { SpaceService } = require('./service');


class SpaceController {
    constructor() { }

    load(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;

        const username = req.body.username;
        SpaceService.load(dbname_prefix, username, req.body.data).then(function (data) {
            dfd.resolve(data);
        }).catch(function (err) {
            dfd.reject(err);
        });
        return dfd.promise;
    }

    loadHidden(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const username = req.body.username;
        SpaceService.loadHidden(dbname_prefix, username).then(function (data) {
            dfd.resolve(data);
        }).catch(function (err) {
            dfd.reject(err);
        });
        return dfd.promise;
    }

    count(data) {
        let dfd = q.defer();
        SpaceService.count(data).then(function (data) {
            dfd.resolve(data);
        }).catch(function (err) {
            dfd.reject(err);
        });
        return dfd.promise;
    }

    loadDetails(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const username = req.body.username;
        const id = req.body.id;

        SpaceService.loadDetails(dbname_prefix, username, id).then(function (data) {
            dfd.resolve(data);
        }).catch(function (err) {
            dfd.reject(err);
        });
        return dfd.promise;
    }

    loadWithProjects(data) {
        let dfd = q.defer();
        SpaceService.loadWithProjects(data).then(function (data) {
            dfd.resolve(data);
        }).catch(function (err) {
            dfd.reject(err);
        });
        return dfd.promise;
    }

    insert(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const username = req.body.username;

        SpaceService.insert(dbname_prefix, username, req.body.data, req.formData).then(function () {
            dfd.resolve(true);
        }).catch(function (err) {
            dfd.reject({
                mes: err.mes ? err.mes : "Unexpected error occurred while create space",
            });
        });
        return dfd.promise;
    }

    update(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const username = req.body.username;

        SpaceService.update(dbname_prefix, username, req.body.id, req.body.data).then(function () {
            dfd.resolve(true);
        }).catch(function (err) {
            dfd.reject({
                mes: err.mes ? err.mes : "Unexpected error occurred while update space",
            });
        });
        return dfd.promise;
    }

    loadMembers(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const username = req.body.username;
        const spaceId = req.body.id;

        SpaceService.loadMembers(dbname_prefix, username, spaceId).then(function (data) {
            dfd.resolve(data);
        }).catch(function (err) {
            dfd.reject(err);
        });
        return dfd.promise;
    }

    delete(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const username = req.body.username;
        const id = req.body.id;

        SpaceService.delete(dbname_prefix, username, id).then(function (data) {
            dfd.resolve(data);
        }).catch(function (err) {
            dfd.reject({
                mes: err.mes ? err.mes : "Unexpected error occurred while deleting space",
            });
        });
        return dfd.promise;
    }

    hide(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const username = req.body.username;
        const id = req.body.id;

        SpaceService.hide(dbname_prefix, username, id).then(function (data) {
            dfd.resolve(data);
        }).catch(function (err) {
            dfd.reject({
                mes: err.mes ? err.mes : "Unexpected error occurred while hiding space",
            });
        });
        return dfd.promise;
    }

    pin(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const username = req.body.username;
        const id = req.body.id;

        SpaceService.pin(dbname_prefix, username, id).then(function (data) {
            dfd.resolve(data);
        }).catch(function (err) {
            dfd.reject({
                mes: err.mes ? err.mes : "Unexpected error occurred while pinning space",
            });
        });
        return dfd.promise;
    }

    addMember(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const username = req.body.username;
        const spaceId = req.body.id;
        const memberData = req.body.member;

        SpaceService.addMember(dbname_prefix, username, spaceId, memberData).then(function (data) {
            dfd.resolve(data);
        }).catch(function (err) {
            dfd.reject({
                mes: err.mes ? err.mes : "Failed to add member",
            });
        });
        return dfd.promise;
    }

    loadTaskInSpace(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const username = req.body.username;
        const spaceId = req.body.id;

        SpaceService.loadTaskInSpace(dbname_prefix, username, spaceId).then(function (data) {
            dfd.resolve(data);
        }).catch(function (err) {
            dfd.reject({
                mes: err.mes ? err.mes : "Failed to load task in space",
            });
        });
        return dfd.promise;
    }

    invite(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const username = req.body.username;
        const spaceId = req.body.id;
        const email = req.body.email;

        SpaceService.inviteMember(dbname_prefix, username, spaceId, email).then(function (data) {
            dfd.resolve(data);
        }).catch(function (err) {
            dfd.reject(err);
        });
        return dfd.promise;
    }

    acceptInvite(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const username = req.body.username;
        const token = req.body.token;

        SpaceService.acceptInvitation(dbname_prefix, username, token).then(function (data) {
            dfd.resolve(data);
        }).catch(function (err) {
            dfd.reject(err);
        });
        return dfd.promise;
    }

    getInvitationDetails(req) {
        let dfd = q.defer();
        const token = req.body.token;

        SpaceService.getInvitationDetails(token).then(function (data) {
            dfd.resolve(data);
        }).catch(function (err) {
            dfd.reject(err);
        });
        return dfd.promise;
    }
    removeMember(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const username = req.body.username;
        const spaceId = req.body.id;
        const memberUsername = req.body.memberUsername;

        SpaceService.removeMember(dbname_prefix, username, spaceId, memberUsername).then(function (data) {
            dfd.resolve(data);
        }).catch(function (err) {
            dfd.reject({
                mes: err.mes ? err.mes : "Failed to remove member",
            });
        });
        return dfd.promise;
    }
    archiveSpace(data) {
        let dfd = q.defer();
        const dbname_prefix = data._service[0].dbname_prefix;
        const username = data.username;
        SpaceService.archiveSpace(dbname_prefix, username, data.id).then(function () {
            dfd.resolve(true);
        }).catch(function (err) { dfd.reject({ mes: err.mes || "Failed to archive space" }); });
        return dfd.promise;
    }

    unarchiveSpace(data) {
        let dfd = q.defer();
        const dbname_prefix = data._service[0].dbname_prefix;
        const username = data.username;
        SpaceService.unarchiveSpace(dbname_prefix, username, data.id).then(function () {
            dfd.resolve(true);
        }).catch(function (err) { dfd.reject({ mes: err.mes || "Failed to unarchive space" }); });
        return dfd.promise;
    }

    loadArchived(data) {
        let dfd = q.defer();
        const dbname_prefix = data._service[0].dbname_prefix;
        const username = data.username;
        SpaceService.loadArchived(dbname_prefix, username).then(function (result) {
            dfd.resolve(result);
        }).catch(function (err) { dfd.reject({ mes: err.mes || "Failed to load archived spaces" }); });
        return dfd.promise;
    }
}

exports.SpaceController = new SpaceController();
