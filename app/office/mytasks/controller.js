const { MyTasksService } = require('./service');
const q = require('q');

class MyTasksController {
    constructor() { }

    getAssigned(body) {
        let dfd = q.defer();
        const dbname_prefix = body._service[0].dbname_prefix;
        const username = body.session.username || body.username;
        MyTasksService.getAssignedTasks(dbname_prefix, username).then(function (data) {
            dfd.resolve(data);
        }).catch(function (err) {
            dfd.reject(err);
        });
        return dfd.promise;
    }

    getTodayOverdue(body) {
        let dfd = q.defer();
        const dbname_prefix = body._service[0].dbname_prefix;
        const username = body.session.username || body.username;
        MyTasksService.getTodayAndOverdue(dbname_prefix, username).then(function (data) {
            dfd.resolve(data);
        }).catch(function (err) {
            dfd.reject(err);
        });
        return dfd.promise;
    }
}

exports.MyTasksController = new MyTasksController();
