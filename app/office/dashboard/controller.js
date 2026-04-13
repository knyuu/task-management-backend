const q = require('q');
const { DashboardService } = require('./service');

class DashboardController {
    constructor() { }

    async summary(data) {
        try {
            const dbname_prefix = data._service[0].dbname_prefix;
            const username = data.username;
            return await DashboardService.getSummary(dbname_prefix, username);
        } catch (err) {
            throw { mes: err.mes || "Unexpected error occurred while loading dashboard" };
        }
    }
}

exports.DashboardController = new DashboardController();
