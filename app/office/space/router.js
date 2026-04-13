const express = require('express');
const router = express.Router();
const { SpaceController } = require('./controller');
const { validation } = require('./validation');
const { SessionProvider } = require('../../../shared/redis/session.provider');
const { PermissionProvider } = require('../../../shared/permission/permission.provider');
const { statusHTTP } = require('../../../utils/setting');
const { Router } = require('../../../shared/router/router.provider');
const { MultiTenant } = require('../../../shared/multi_tenant/provider');
const resolveFormData = require('../../../shared/middleware/form-data');

router.post('/load', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.load, Router.trycatchFunction("post/office/space/load", function (req, res) {
    return function () {
        SpaceController.load(req).then(function (data) {
            res.send(data);
            res.end();
            data = undefined;
            res = undefined;
            req = undefined;
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/space/load", err);
            res.end();
            err = undefined;
            res = undefined;
            req = undefined;
        });
    }
}));

router.post('/load-hidden', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), Router.trycatchFunction("post/office/space/load-hidden", function (req, res) {
    return function () {
        SpaceController.loadHidden(req).then(function (data) {
            res.send(data);
            res.end();
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/space/load-hidden", err);
            res.end();
        });
    }
}));

router.post('/count', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.count, Router.trycatchFunction("post/office/space/count", function (req, res) {
    return function () {
        SpaceController.count(req.body).then(function (data) {
            res.send({ count: data });
            res.end();
            data = undefined;
            res = undefined;
            req = undefined;
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/space/count", err);
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
    resolveFormData('office', null, 'space_icon', 'space'),
    validation.insert,
    Router.trycatchFunction("post/office/space/insert", function (req, res) {
        return function () {
            SpaceController.insert(req).then(function () {
                res.send(true);
                res.end();
                data = undefined;
                res = undefined;
                req = undefined;
            }, function (err) {
                res.status(statusHTTP.internalServer);
                Router.LogAndMessage(res, "post/office/space/insert", err);
                res.end();
                err = undefined;
                res = undefined;
                req = undefined;
            });
        }
    }));

router.post('/update',
    MultiTenant.match({ module_key: ["office"] }),
    PermissionProvider.check(["Authorized"]),
    validation.update,
    Router.trycatchFunction("post/office/space/update", function (req, res) {
        return function () {
            SpaceController.update(req).then(function () {
                res.send(true);
                res.end();
                data = undefined;
                res = undefined;
                req = undefined;
            }, function (err) {
                res.status(statusHTTP.internalServer);
                Router.LogAndMessage(res, "post/office/space/update", err);
                res.end();
                err = undefined;
                res = undefined;
                req = undefined;
            });
        }
    }));

router.post('/load-details', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.loadDetails, Router.trycatchFunction("post/office/project/load-details", function (req, res) {
    return function () {
        SpaceController.loadDetails(req).then(function (data) {
            res.send(data);
            res.end();
            data = undefined;
            res = undefined;
            req = undefined;
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/project/load-details", err);
            res.end();
            err = undefined;
            res = undefined;
            req = undefined;
        });
    }
}));

router.post('/load-space-member',
    MultiTenant.match({ module_key: ["office"] }),
    PermissionProvider.check(["Authorized"]),
    validation.loadMembers,
    Router.trycatchFunction("post/office/space/load-space-member", function (req, res) {
        return function () {
            SpaceController.loadMembers(req).then(function (data) {
                res.send(data);
                res.end();
                data = undefined;
                res = undefined;
                req = undefined;
            }, function (err) {
                res.status(statusHTTP.internalServer);
                Router.LogAndMessage(res, "post/office/space/load-space-member", err);
                res.end();
                err = undefined;
                res = undefined;
                req = undefined;
            });
        }
    }));

router.post('/delete',
    MultiTenant.match({ module_key: ["office"] }),
    PermissionProvider.check(["Authorized"]),
    validation.delete,
    Router.trycatchFunction("post/office/space/delete", function (req, res) {
        return function () {
            SpaceController.delete(req).then(function (data) {
                res.send(data);
                res.end();
            }, function (err) {
                res.status(statusHTTP.internalServer);
                Router.LogAndMessage(res, "post/office/space/delete", err);
                res.end();
            });
        }
    }));

router.post('/hide',
    MultiTenant.match({ module_key: ["office"] }),
    PermissionProvider.check(["Authorized"]),
    validation.hide,
    Router.trycatchFunction("post/office/space/hide", function (req, res) {
        return function () {
            SpaceController.hide(req).then(function (data) {
                res.send(data);
                res.end();
            }, function (err) {
                res.status(statusHTTP.internalServer);
                Router.LogAndMessage(res, "post/office/space/hide", err);
                res.end();
            });
        }
    }));

router.post('/pin',
    MultiTenant.match({ module_key: ["office"] }),
    PermissionProvider.check(["Authorized"]),
    validation.pin,
    Router.trycatchFunction("post/office/space/pin", function (req, res) {
        return function () {
            SpaceController.pin(req).then(function (data) {
                res.send(data);
                res.end();
            }, function (err) {
                res.status(statusHTTP.internalServer);
                Router.LogAndMessage(res, "post/office/space/pin", err);
                res.end();
            });
        }
    }));

router.post('/add-member',
    MultiTenant.match({ module_key: ["office"] }),
    PermissionProvider.check(["Authorized"]),
    validation.addMember,
    Router.trycatchFunction("post/office/space/add-member", function (req, res) {
        return function () {
            SpaceController.addMember(req).then(function (data) {
                res.send(data);
                res.end();
            }, function (err) {
                res.status(statusHTTP.internalServer);
                Router.LogAndMessage(res, "post/office/space/add-member", err);
                res.end();
            });
        }
    }));

router.post('/load-task-in-space',
    MultiTenant.match({ module_key: ["office"] }),
    PermissionProvider.check(["Authorized"]),
    validation.loadTaskInSpace,
    Router.trycatchFunction("post/office/space/load-task-in-space", function (req, res) {
        return function () {
            SpaceController.loadTaskInSpace(req).then(function (data) {
                res.send(data);
                res.end();
            }, function (err) {
                res.status(statusHTTP.internalServer);
                Router.LogAndMessage(res, "post/office/space/load-task-in-space", err);
                res.end();
            });
        }
    }));

router.post('/invite',
    MultiTenant.match({ module_key: ["office"] }),
    PermissionProvider.check(["Authorized"]),
    validation.invite,
    Router.trycatchFunction("post/office/space/invite", function (req, res) {
        return function () {
            SpaceController.invite(req).then(function (data) {
                res.send(data);
                res.end();
            }, function (err) {
                res.status(statusHTTP.internalServer);
                Router.LogAndMessage(res, "post/office/space/invite", err);
                res.end();
            });
        }
    }));

router.post('/accept-invite',
    MultiTenant.match({ module_key: ["office"] }),
    PermissionProvider.check(["Authorized"]),
    validation.acceptInvite,
    Router.trycatchFunction("post/office/space/accept-invite", function (req, res) {
        return function () {
            SpaceController.acceptInvite(req).then(function (data) {
                res.send(data);
                res.end();
            }, function (err) {
                res.status(statusHTTP.internalServer);
                Router.LogAndMessage(res, "post/office/space/accept-invite", err);
                res.end();
            });
        }
    }));

router.post('/get-invitation-details',
    Router.trycatchFunction("post/office/space/get-invitation-details", function (req, res) {
        return function () {
            SpaceController.getInvitationDetails(req).then(function (data) {
                res.send(data);
                res.end();
            }, function (err) {
                res.status(statusHTTP.internalServer);
                Router.LogAndMessage(res, "post/office/space/get-invitation-details", err);
                res.end();
            });
        }
    }));

router.post('/remove-member',
    MultiTenant.match({ module_key: ["office"] }),
    PermissionProvider.check(["Authorized"]),
    validation.removeMember,
    Router.trycatchFunction("post/office/space/remove-member", function (req, res) {
        return function () {
            SpaceController.removeMember(req).then(function (data) {
                res.send(data);
                res.end();
            }, function (err) {
                res.status(statusHTTP.internalServer);
                Router.LogAndMessage(res, "post/office/space/remove-member", err);
                res.end();
            });
        }
    }));

router.post('/archive', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.archiveSpace, Router.trycatchFunction("post/office/space/archive", function (req, res) {
    return function () {
        SpaceController.archiveSpace(req.body).then(function () {
            res.send({ status: true }); res.end(); res = undefined; req = undefined;
        }, function (err) {
            res.status(statusHTTP.internalServer); Router.LogAndMessage(res, "post/office/space/archive", err); res.end(); res = undefined; req = undefined;
        });
    }
}));

router.post('/unarchive', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.unarchiveSpace, Router.trycatchFunction("post/office/space/unarchive", function (req, res) {
    return function () {
        SpaceController.unarchiveSpace(req.body).then(function () {
            res.send({ status: true }); res.end(); res = undefined; req = undefined;
        }, function (err) {
            res.status(statusHTTP.internalServer); Router.LogAndMessage(res, "post/office/space/unarchive", err); res.end(); res = undefined; req = undefined;
        });
    }
}));

router.post('/load-archived', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.loadArchived, Router.trycatchFunction("post/office/space/load-archived", function (req, res) {
    return function () {
        SpaceController.loadArchived(req.body).then(function (data) {
            res.send({ status: true, data: data }); res.end(); data = undefined; res = undefined; req = undefined;
        }, function (err) {
            res.status(statusHTTP.internalServer); Router.LogAndMessage(res, "post/office/space/load-archived", err); res.end(); res = undefined; req = undefined;
        });
    }
}));

module.exports = router;

