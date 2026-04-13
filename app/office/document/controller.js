const q = require('q');
const { DocumentService } = require('./service');

class DocumentController {
    constructor() { }

    load(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const username = req.body.username;
        const spaceId = req.body.space_id;

        DocumentService.load(dbname_prefix, username, spaceId).then(function (data) {
            dfd.resolve(data);
        }).catch(function (err) {
            dfd.reject(err);
        });
        return dfd.promise;
    }

    loadDetails(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const id = req.body.id;

        DocumentService.loadDetails(dbname_prefix, id).then(function (data) {
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

        DocumentService.insert(dbname_prefix, username, req.body.data).then(function (data) {
            dfd.resolve(data);
        }).catch(function (err) {
            dfd.reject({
                mes: err.mes ? err.mes : "Unexpected error occurred while creating document",
            });
        });
        return dfd.promise;
    }

    update(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const username = req.body.username;

        DocumentService.update(dbname_prefix, username, req.body.id, req.body.data).then(function () {
            dfd.resolve(true);
        }).catch(function (err) {
            dfd.reject({
                mes: err.mes ? err.mes : "Unexpected error occurred while updating document",
            });
        });
        return dfd.promise;
    }

    delete(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const username = req.body.username;

        DocumentService.delete(dbname_prefix, username, req.body.id).then(function () {
            dfd.resolve(true);
        }).catch(function (err) {
            dfd.reject({
                mes: err.mes ? err.mes : "Unexpected error occurred while deleting document",
            });
        });
        return dfd.promise;
    }
}

exports.DocumentController = new DocumentController();
