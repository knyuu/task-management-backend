const express = require('express');
const router = express.Router();
const { MyTasksController } = require('./controller');
const { PermissionProvider } = require('../../../shared/permission/permission.provider');
const { statusHTTP } = require('../../../utils/setting');
const { Router } = require('../../../shared/router/router.provider');
const { MultiTenant } = require('../../../shared/multi_tenant/provider');

router.post('/assigned',
    MultiTenant.match({ module_key: ["office"] }),
    PermissionProvider.check(["Authorized"]),
    Router.trycatchFunction("post/office/mytasks/assigned", function (req, res) {
        return function () {
            MyTasksController.getAssigned(req.body).then(function (data) {
                res.send(data);
                res.end();
                data = undefined;
                res = undefined;
                req = undefined;
            }, function (err) {
                res.status(statusHTTP.internalServer);
                Router.LogAndMessage(res, "post/office/mytasks/assigned", err);
                res.end();
                err = undefined;
                res = undefined;
                req = undefined;
            });
        };
    })
);

router.post('/today-overdue',
    MultiTenant.match({ module_key: ["office"] }),
    PermissionProvider.check(["Authorized"]),
    Router.trycatchFunction("post/office/mytasks/today-overdue", function (req, res) {
        return function () {
            MyTasksController.getTodayOverdue(req.body).then(function (data) {
                res.send(data);
                res.end();
                data = undefined;
                res = undefined;
                req = undefined;
            }, function (err) {
                res.status(statusHTTP.internalServer);
                Router.LogAndMessage(res, "post/office/mytasks/today-overdue", err);
                res.end();
                err = undefined;
                res = undefined;
                req = undefined;
            });
        };
    })
);

module.exports = router;
