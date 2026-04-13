const express = require('express');
const router = express.Router();
const { ProjectController } = require('./controller');
const { validation } = require('./validation');
const { PermissionProvider } = require('../../../shared/permission/permission.provider');
const { statusHTTP } = require('../../../utils/setting');
const { Router } = require('../../../shared/router/router.provider');
const { MultiTenant } = require('../../../shared/multi_tenant/provider');

router.post('/load', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.load, Router.trycatchFunction("post/office/project/load", function (req, res) {
    return function () {
        ProjectController.load(req.body).then(function (data) {
            res.send(data);
            res.end();
            data = undefined;
            res = undefined;
            req = undefined;
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/project/load", err);
            res.end();
            err = undefined;
            res = undefined;
            req = undefined;
        });
    }
}));

router.post('/count', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.count, Router.trycatchFunction("post/office/project/count", function (req, res) {
    return function () {
        ProjectController.count(req.body).then(function (data) {
            res.send({ count: data });
            res.end();
            data = undefined;
            res = undefined;
            req = undefined;
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/project/count", err);
            res.end();
            err = undefined;
            res = undefined;
            req = undefined;
        });
    }
}));

router.post('/loaddetails', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.loadDetails, Router.trycatchFunction("post/office/project/loaddetails", function (req, res) {
    return function () {
        ProjectController.loadDetails(req.body).then(function (data) {
            res.send(data);
            res.end();
            data = undefined;
            res = undefined;
            req = undefined;
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/project/loaddetails", err);
            res.end();
            err = undefined;
            res = undefined;
            req = undefined;
        });
    }
}));

router.post('/insert',
    MultiTenant.match({ module_key: ["office"] }),
    PermissionProvider.check(["Authorized"]),
    validation.insert,
    Router.trycatchFunction("post/office/project/insert", function (req, res) {
        return function () {
            ProjectController.insert(req.body).then(function (data) {
                res.send(data);
                res.end();
                data = undefined;
                res = undefined;
                req = undefined;
            }, function (err) {
                res.status(statusHTTP.internalServer);
                Router.LogAndMessage(res, "post/office/project/insert", err);
                res.end();
                err = undefined;
                res = undefined;
                req = undefined;
            });
        }
    })
);

router.post('/update',
    MultiTenant.match({ module_key: ["office"] }),
    PermissionProvider.check(["Authorized"]),
    validation.update,
    Router.trycatchFunction("post/office/project/update", function (req, res) {
        return function () {
            ProjectController.update(req.body, req.formData).then(function (data) {
                res.send({ status: true, data: data });
                res.end();
                data = undefined;
                res = undefined;
                req = undefined;
            }, function (err) {
                res.status(statusHTTP.internalServer);
                Router.LogAndMessage(res, "post/office/project/update", err);
                res.end();
                err = undefined;
                res = undefined;
                req = undefined;
            });
        }
    })
);

router.post('/delete',
    MultiTenant.match({ module_key: ["office"] }),
    PermissionProvider.check(["Authorized"]),
    validation.delete,
    Router.trycatchFunction("post/office/project/delete", function (req, res) {
        return function () {
            ProjectController.delete(req.body).then(function (data) {
                res.send({ status: true });
                res.end();
                data = undefined;
                res = undefined;
                req = undefined;
            }, function (err) {
                res.status(statusHTTP.internalServer);
                Router.LogAndMessage(res, "post/office/project/delete", err);
                res.end();
                err = undefined;
                res = undefined;
                req = undefined;
            });
        }
    })
);

router.post('/load-project-by-space', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.loadProjectBySpace, Router.trycatchFunction("post/office/project/load-project-by-space", function (req, res) {
    return function () {
        ProjectController.loadProjectBySpace(req.body).then(function (data) {
            res.send({ status: true, data: data });
            res.end();
            data = undefined;
            res = undefined;
            req = undefined;
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/project/load-project-by-space", err);
            res.end();
            err = undefined;
            res = undefined;
            req = undefined;
        });
    }
}));

router.post('/archive', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.archiveProject, Router.trycatchFunction("post/office/project/archive", function (req, res) {
    return function () {
        ProjectController.archiveProject(req.body).then(function () {
            res.send({ status: true }); res.end(); res = undefined; req = undefined;
        }, function (err) {
            res.status(statusHTTP.internalServer); Router.LogAndMessage(res, "post/office/project/archive", err); res.end(); res = undefined; req = undefined;
        });
    }
}));

router.post('/unarchive', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.unarchiveProject, Router.trycatchFunction("post/office/project/unarchive", function (req, res) {
    return function () {
        ProjectController.unarchiveProject(req.body).then(function () {
            res.send({ status: true }); res.end(); res = undefined; req = undefined;
        }, function (err) {
            res.status(statusHTTP.internalServer); Router.LogAndMessage(res, "post/office/project/unarchive", err); res.end(); res = undefined; req = undefined;
        });
    }
}));

router.post('/load-archived', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.loadArchived, Router.trycatchFunction("post/office/project/load-archived", function (req, res) {
    return function () {
        ProjectController.loadArchived(req.body).then(function (data) {
            res.send({ status: true, data: data }); res.end(); data = undefined; res = undefined; req = undefined;
        }, function (err) {
            res.status(statusHTTP.internalServer); Router.LogAndMessage(res, "post/office/project/load-archived", err); res.end(); res = undefined; req = undefined;
        });
    }
}));

module.exports = router;

