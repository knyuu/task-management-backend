const express = require('express');
const router = express.Router();
const { ChannelController } = require('./controller');
const { validation } = require('./validation');
const { SessionProvider } = require('../../../shared/redis/session.provider');
const { PermissionProvider } = require('../../../shared/permission/permission.provider');
const { statusHTTP } = require('../../../utils/setting');
const { Router } = require('../../../shared/router/router.provider');
const { MultiTenant } = require('../../../shared/multi_tenant/provider');

// Load all channels for user
router.post('/load', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.load, Router.trycatchFunction("post/office/channel/load", function (req, res) {
    return function () {
        ChannelController.load(req).then(function (data) {
            res.send(data);
            res.end();
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/channel/load", err);
            res.end();
        });
    }
}));

// Load channels by space
router.post('/load_by_space', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.loadBySpace, Router.trycatchFunction("post/office/channel/load_by_space", function (req, res) {
    return function () {
        ChannelController.loadBySpace(req).then(function (data) {
            res.send(data);
            res.end();
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/channel/load_by_space", err);
            res.end();
        });
    }
}));

// Load channel details
router.post('/details', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.loadDetails, Router.trycatchFunction("post/office/channel/details", function (req, res) {
    return function () {
        ChannelController.loadDetails(req).then(function (data) {
            res.send(data);
            res.end();
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/channel/details", err);
            res.end();
        });
    }
}));

// Create channel
router.post('/insert', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.insert, Router.trycatchFunction("post/office/channel/insert", function (req, res) {
    return function () {
        ChannelController.insert(req).then(function (data) {
            res.send({ status: data });
            res.end();
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/channel/insert", err);
            res.end();
        });
    }
}));

// Update channel
router.post('/update', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.update, Router.trycatchFunction("post/office/channel/update", function (req, res) {
    return function () {
        ChannelController.update(req).then(function (data) {
            res.send({ status: data });
            res.end();
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/channel/update", err);
            res.end();
        });
    }
}));

// Delete channel
router.post('/delete', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.delete, Router.trycatchFunction("post/office/channel/delete", function (req, res) {
    return function () {
        ChannelController.delete(req).then(function (data) {
            res.send({ status: data });
            res.end();
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/channel/delete", err);
            res.end();
        });
    }
}));

// Load messages
router.post('/messages', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.loadMessages, Router.trycatchFunction("post/office/channel/messages", function (req, res) {
    return function () {
        ChannelController.loadMessages(req).then(function (data) {
            res.send(data);
            res.end();
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/channel/messages", err);
            res.end();
        });
    }
}));

// Send message
router.post('/send', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.sendMessage, Router.trycatchFunction("post/office/channel/send", function (req, res) {
    return function () {
        ChannelController.sendMessage(req).then(function (data) {
            res.send(data);
            res.end();
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/channel/send", err);
            res.end();
        });
    }
}));

// Find or create direct message channel
router.post('/dm', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.findOrCreateDM, Router.trycatchFunction("post/office/channel/dm", function (req, res) {
    return function () {
        ChannelController.findOrCreateDM(req).then(function (data) {
            res.send(data);
            res.end();
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/channel/dm", err);
            res.end();
        });
    }
}));

// Edit message
router.post('/edit_message', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.editMessage, Router.trycatchFunction("post/office/channel/edit_message", function (req, res) {
    return function () {
        ChannelController.editMessage(req).then(function (data) {
            res.send({ status: data });
            res.end();
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/channel/edit_message", err);
            res.end();
        });
    }
}));

// Delete message
router.post('/delete_message', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.deleteMessage, Router.trycatchFunction("post/office/channel/delete_message", function (req, res) {
    return function () {
        ChannelController.deleteMessage(req).then(function (data) {
            res.send({ status: data });
            res.end();
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/channel/delete_message", err);
            res.end();
        });
    }
}));

// React to message
router.post('/react', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.reactToMessage, Router.trycatchFunction("post/office/channel/react", function (req, res) {
    return function () {
        ChannelController.reactToMessage(req).then(function (data) {
            res.send(data);
            res.end();
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/channel/react", err);
            res.end();
        });
    }
}));

// Mark channel as read
router.post('/mark_read', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.markRead, Router.trycatchFunction("post/office/channel/mark_read", function (req, res) {
    return function () {
        ChannelController.markRead(req).then(function (data) {
            res.send(data);
            res.end();
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/channel/mark_read", err);
            res.end();
        });
    }
}));

// Get unread counts
router.post('/unread_counts', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.getUnreadCounts, Router.trycatchFunction("post/office/channel/unread_counts", function (req, res) {
    return function () {
        ChannelController.getUnreadCounts(req).then(function (data) {
            res.send(data);
            res.end();
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/channel/unread_counts", err);
            res.end();
        });
    }
}));

// Get read receipts for a channel
router.post('/read_receipts', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.getReadReceipts, Router.trycatchFunction("post/office/channel/read_receipts", function (req, res) {
    return function () {
        ChannelController.getReadReceipts(req).then(function (data) {
            res.send(data);
            res.end();
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/channel/read_receipts", err);
            res.end();
        });
    }
}));

// Get member avatars
router.post('/member_avatars', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.getMemberAvatars, Router.trycatchFunction("post/office/channel/member_avatars", function (req, res) {
    return function () {
        ChannelController.getMemberAvatars(req).then(function (data) {
            res.send(data);
            res.end();
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/channel/member_avatars", err);
            res.end();
        });
    }
}));

// Pin a message
router.post('/pin_message', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.pinMessage, Router.trycatchFunction("post/office/channel/pin_message", function (req, res) {
    return function () {
        ChannelController.pinMessage(req).then(function (data) {
            res.send(data);
            res.end();
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/channel/pin_message", err);
            res.end();
        });
    }
}));

// Unpin a message
router.post('/unpin_message', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.unpinMessage, Router.trycatchFunction("post/office/channel/unpin_message", function (req, res) {
    return function () {
        ChannelController.unpinMessage(req).then(function (data) {
            res.send(data);
            res.end();
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/channel/unpin_message", err);
            res.end();
        });
    }
}));

// Get pinned messages
router.post('/pinned_messages', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.getPinnedMessages, Router.trycatchFunction("post/office/channel/pinned_messages", function (req, res) {
    return function () {
        ChannelController.getPinnedMessages(req).then(function (data) {
            res.send(data);
            res.end();
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/channel/pinned_messages", err);
            res.end();
        });
    }
}));

// Upload attachment
router.post('/upload_attachment', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), Router.trycatchFunction("post/office/channel/upload_attachment", function (req, res) {
    return function () {
        ChannelController.uploadAttachment(req).then(function (data) {
            res.send(data);
            res.end();
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/channel/upload_attachment", err);
            res.end();
        });
    }
}));

// Send message with attachments
router.post('/send_with_attachments', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.sendMessageWithAttachments, Router.trycatchFunction("post/office/channel/send_with_attachments", function (req, res) {
    return function () {
        ChannelController.sendMessageWithAttachments(req).then(function (data) {
            res.send(data);
            res.end();
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/channel/send_with_attachments", err);
            res.end();
        });
    }
}));

// Toggle mute channel notifications
router.post('/toggle_mute', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.toggleMuteChannel, Router.trycatchFunction("post/office/channel/toggle_mute", function (req, res) {
    return function () {
        ChannelController.toggleMuteChannel(req).then(function (data) {
            res.send(data);
            res.end();
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/channel/toggle_mute", err);
            res.end();
        });
    }
}));

// Get channel members with profile details
router.post('/channel_members', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.getChannelMembers, Router.trycatchFunction("post/office/channel/channel_members", function (req, res) {
    return function () {
        ChannelController.getChannelMembers(req).then(function (data) {
            res.send(data);
            res.end();
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/channel/channel_members", err);
            res.end();
        });
    }
}));

// Add members to channel (owner only)
router.post('/add_members', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.addMembers, Router.trycatchFunction("post/office/channel/add_members", function (req, res) {
    return function () {
        ChannelController.addMembers(req).then(function (data) {
            res.send(data);
            res.end();
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/channel/add_members", err);
            res.end();
        });
    }
}));

// Remove member from channel (owner only)
router.post('/remove_member', MultiTenant.match({ module_key: ["office"] }), PermissionProvider.check(["Authorized"]), validation.removeMember, Router.trycatchFunction("post/office/channel/remove_member", function (req, res) {
    return function () {
        ChannelController.removeMember(req).then(function (data) {
            res.send(data);
            res.end();
        }, function (err) {
            res.status(statusHTTP.internalServer);
            Router.LogAndMessage(res, "post/office/channel/remove_member", err);
            res.end();
        });
    }
}));

module.exports = router;
