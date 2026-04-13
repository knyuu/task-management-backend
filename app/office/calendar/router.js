const express = require('express');
const router = express.Router();
const { CalendarController } = require('./controller');
const { PermissionProvider } = require('../../../shared/permission/permission.provider');
const { statusHTTP } = require('../../../utils/setting');
const { Router } = require('../../../shared/router/router.provider');
const { MultiTenant } = require('../../../shared/multi_tenant/provider');

router.post('/tasks',
    MultiTenant.match({ module_key: ["office"] }),
    PermissionProvider.check(["Authorized"]),
    Router.trycatchFunction("post/office/calendar/tasks", function (req, res) {
        return function () {
            CalendarController.getTasksByRange(req.body).then(function (data) {
                res.send(data);
                res.end();
                data = undefined;
                res = undefined;
                req = undefined;
            }, function (err) {
                res.status(statusHTTP.internalServer);
                Router.LogAndMessage(res, "post/office/calendar/tasks", err);
                res.end();
                err = undefined;
                res = undefined;
                req = undefined;
            });
        };
    })
);

module.exports = router;
