const express = require('express');
const router = express.Router();
const { DocumentController } = require('./controller');
const { validation } = require('./validation');
const { PermissionProvider } = require('../../../shared/permission/permission.provider');
const { statusHTTP } = require('../../../utils/setting');
const { Router } = require('../../../shared/router/router.provider');
const { MultiTenant } = require('../../../shared/multi_tenant/provider');

router.post('/load',
    MultiTenant.match({ module_key: ["office"] }),
    PermissionProvider.check(["Authorized"]),
    validation.load,
    Router.trycatchFunction("post/office/document/load", function (req, res) {
        return function () {
            DocumentController.load(req).then(function (data) {
                res.send(data);
                res.end();
            }, function (err) {
                res.status(statusHTTP.internalServer);
                Router.LogAndMessage(res, "post/office/document/load", err);
                res.end();
            });
        }
    }));

router.post('/load-details',
    MultiTenant.match({ module_key: ["office"] }),
    PermissionProvider.check(["Authorized"]),
    validation.loadDetails,
    Router.trycatchFunction("post/office/document/load-details", function (req, res) {
        return function () {
            DocumentController.loadDetails(req).then(function (data) {
                res.send(data);
                res.end();
            }, function (err) {
                res.status(statusHTTP.internalServer);
                Router.LogAndMessage(res, "post/office/document/load-details", err);
                res.end();
            });
        }
    }));

router.post('/insert',
    MultiTenant.match({ module_key: ["office"] }),
    PermissionProvider.check(["Authorized"]),
    validation.insert,
    Router.trycatchFunction("post/office/document/insert", function (req, res) {
        return function () {
            DocumentController.insert(req).then(function (data) {
                res.send(data);
                res.end();
            }, function (err) {
                res.status(statusHTTP.internalServer);
                Router.LogAndMessage(res, "post/office/document/insert", err);
                res.end();
            });
        }
    }));

router.post('/update',
    MultiTenant.match({ module_key: ["office"] }),
    PermissionProvider.check(["Authorized"]),
    validation.update,
    Router.trycatchFunction("post/office/document/update", function (req, res) {
        return function () {
            DocumentController.update(req).then(function (data) {
                res.send(data);
                res.end();
            }, function (err) {
                res.status(statusHTTP.internalServer);
                Router.LogAndMessage(res, "post/office/document/update", err);
                res.end();
            });
        }
    }));

router.post('/delete',
    MultiTenant.match({ module_key: ["office"] }),
    PermissionProvider.check(["Authorized"]),
    validation.delete,
    Router.trycatchFunction("post/office/document/delete", function (req, res) {
        return function () {
            DocumentController.delete(req).then(function (data) {
                res.send(data);
                res.end();
            }, function (err) {
                res.status(statusHTTP.internalServer);
                Router.LogAndMessage(res, "post/office/document/delete", err);
                res.end();
            });
        }
    }));

module.exports = router;
