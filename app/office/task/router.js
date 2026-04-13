const express = require('express');
const router = express.Router();
const { TaskController } = require('./controller');
const { validation } = require('./validation');
const { PermissionProvider } = require('../../../shared/permission/permission.provider');
const { statusHTTP } = require('../../../utils/setting');
const { Router } = require('../../../shared/router/router.provider');
const { MultiTenant } = require('../../../shared/multi_tenant/provider');

router.post('/load', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.load, Router.trycatchFunction("post/office/task/load", function (req, res) {
    return function () {
        TaskController.load(req.body).then(function (data) {
            res.send(data);
            res.end();
            data = undefined;
            res = undefined;
            req = undefined;
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/task/load", err);
            res.end();
            err = undefined;
            res = undefined;
            req = undefined;
        });
    }
}));

router.post('/count', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.count, Router.trycatchFunction("post/office/task/count", function (req, res) {
    return function () {
        TaskController.count(req.body).then(function (data) {
            res.send({ count: data });
            res.end();
            data = undefined;
            res = undefined;
            req = undefined;
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/task/count", err);
            res.end();
            err = undefined;
            res = undefined;
            req = undefined;
        });
    }
}));

router.post('/loaddetails', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.loadDetails, Router.trycatchFunction("post/office/task/loaddetails", function (req, res) {
    return function () {
        TaskController.loadDetails(req.body).then(function (data) {
            res.send(data);
            res.end();
            data = undefined;
            res = undefined;
            req = undefined;
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/task/loaddetails", err);
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
    Router.trycatchFunction("post/office/task/insert", function (req, res) {
        return function () {
            TaskController.insert(req.body, req.formData).then(function (data) {
                res.send({ status: true, data: data });
                res.end();
                data = undefined;
                res = undefined;
                req = undefined;
            }, function (err) {
                res.status(statusHTTP.internalServer);
                Router.LogAndMessage(res, "post/office/task/insert", err);
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
    Router.trycatchFunction("post/office/task/update", function (req, res) {
        return function () {
            TaskController.update(req.body, req.formData).then(function (data) {
                res.send({ status: true, data: data });
                res.end();
                data = undefined;
                res = undefined;
                req = undefined;
            }, function (err) {
                res.status(statusHTTP.internalServer);
                Router.LogAndMessage(res, "post/office/task/update", err);
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
    Router.trycatchFunction("post/office/task/delete", function (req, res) {
        return function () {
            TaskController.delete(req.body).then(function (data) {
                res.send({ status: true });
                res.end();
                data = undefined;
                res = undefined;
                req = undefined;
            }, function (err) {
                res.status(statusHTTP.internalServer);
                Router.LogAndMessage(res, "post/office/task/delete", err);
                res.end();
                err = undefined;
                res = undefined;
                req = undefined;
            });
        }
    })
);

router.post('/load-task-by-project', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.loadTaskByProject, Router.trycatchFunction("post/office/task/load-task-by-project", function (req, res) {
    return function () {
        TaskController.loadTaskByProject(req.body).then(function (data) {
            res.send({ status: true, data: data });
            res.end();
            data = undefined;
            res = undefined;
            req = undefined;
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/task/load-task-by-project", err);
            res.end();
            err = undefined;
            res = undefined;
            req = undefined;
        });
    }
}));

router.post('/add-comment', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.addComment, Router.trycatchFunction("post/office/task/add-comment", function (req, res) {
    return function () {
        TaskController.addComment(req.body).then(function (data) {
            res.send({ status: true, data: data });
            res.end();
            data = undefined;
            res = undefined;
            req = undefined;
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/task/add-comment", err);
            res.end();
            err = undefined;
            res = undefined;
            req = undefined;
        });
    }
}));

router.post('/update-comment', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.updateComment, Router.trycatchFunction("post/office/task/update-comment", function (req, res) {
    return function () {
        TaskController.updateComment(req.body).then(function (data) {
            res.send({ status: true, data: data });
            res.end();
            data = undefined;
            res = undefined;
            req = undefined;
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/task/update-comment", err);
            res.end();
            err = undefined;
            res = undefined;
            req = undefined;
        });
    }
}));

router.post('/delete-comment', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.deleteComment, Router.trycatchFunction("post/office/task/delete-comment", function (req, res) {
    return function () {
        TaskController.deleteComment(req.body).then(function (data) {
            res.send({ status: true, data: data });
            res.end();
            data = undefined;
            res = undefined;
            req = undefined;
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/task/delete-comment", err);
            res.end();
            err = undefined;
            res = undefined;
            req = undefined;
        });
    }
}));

router.post('/load-archived', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.loadArchived, Router.trycatchFunction("post/office/task/load-archived", function (req, res) {
    return function () {
        TaskController.loadArchived(req.body).then(function (data) {
            res.send({ status: true, data: data });
            res.end();
            data = undefined; res = undefined; req = undefined;
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/task/load-archived", err);
            res.end();
            err = undefined; res = undefined; req = undefined;
        });
    }
}));

router.post('/unarchive', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.unarchive, Router.trycatchFunction("post/office/task/unarchive", function (req, res) {
    return function () {
        TaskController.unarchive(req.body).then(function (data) {
            res.send({ status: true });
            res.end();
            data = undefined; res = undefined; req = undefined;
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/task/unarchive", err);
            res.end();
            err = undefined; res = undefined; req = undefined;
        });
    }
}));

router.post('/duplicate', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.duplicate, Router.trycatchFunction("post/office/task/duplicate", function (req, res) {
    return function () {
        TaskController.duplicate(req.body).then(function (data) {
            res.send({ status: true, data: data });
            res.end();
            data = undefined; res = undefined; req = undefined;
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/task/duplicate", err);
            res.end();
            err = undefined; res = undefined; req = undefined;
        });
    }
}));

router.post('/archive', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.archive, Router.trycatchFunction("post/office/task/archive", function (req, res) {
    return function () {
        TaskController.archive(req.body).then(function (data) {
            res.send({ status: true });
            res.end();
            data = undefined; res = undefined; req = undefined;
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/task/archive", err);
            res.end();
            err = undefined; res = undefined; req = undefined;
        });
    }
}));

router.post('/send-email', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.sendEmail, Router.trycatchFunction("post/office/task/send-email", function (req, res) {
    return function () {
        TaskController.sendEmail(req.body).then(function (data) {
            res.send({ status: true });
            res.end();
            data = undefined; res = undefined; req = undefined;
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/task/send-email", err);
            res.end();
            err = undefined; res = undefined; req = undefined;
        });
    }
}));

module.exports = router;

