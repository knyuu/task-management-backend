const { CalendarService } = require('./service');
const q = require('q');

class CalendarController {
    constructor() { }

    getTasksByRange(body) {
        let dfd = q.defer();
        const dbname_prefix = body._service[0].dbname_prefix;
        const username = body.session.username || body.username;
        const startDate = body.startDate;
        const endDate = body.endDate;

        if (!startDate || !endDate) {
            dfd.reject({ mes: "startDate and endDate are required" });
            return dfd.promise;
        }

        CalendarService.getTasksByDateRange(dbname_prefix, username, startDate, endDate).then(function (data) {
            dfd.resolve(data);
        }).catch(function (err) {
            dfd.reject(err);
        });
        return dfd.promise;
    }
}

exports.CalendarController = new CalendarController();
