const express = require('express');
const router = express.Router();
const { DashboardController } = require('./controller');
const { PermissionProvider } = require('../../../shared/permission/permission.provider');
const { statusHTTP } = require('../../../utils/setting');
const { Router } = require('../../../shared/router/router.provider');
const { MultiTenant } = require('../../../shared/multi_tenant/provider');

router.post('/summary',
    MultiTenant.match({ module_key: ["office"] }),
    PermissionProvider.check(["Authorized"]),
    Router.trycatchFunction("post/office/dashboard/summary", function (req, res) {
        return function () {
            DashboardController.summary(req.body).then(function (data) {
                res.send(data);
                res.end();
                data = undefined;
                res = undefined;
                req = undefined;
            }, function (err) {
                res.status(statusHTTP.internalServer);
                Router.LogAndMessage(res, "post/office/dashboard/summary", err);
                res.end();
                err = undefined;
                res = undefined;
                req = undefined;
            });
        }
    })
);

module.exports = router;
