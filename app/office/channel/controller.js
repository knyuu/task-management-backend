const q = require('q');
const { ChannelService } = require('./service');
const { SocketProvider } = require('../../../shared/socket/provider');

class ChannelController {
    constructor() { }

    load(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const username = req.body.username;

        ChannelService.load(dbname_prefix, username)
            .then(function (data) { dfd.resolve(data); })
            .catch(function (err) { dfd.reject(err); });

        return dfd.promise;
    }

    loadBySpace(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const username = req.body.username;
        const spaceId = req.body.space_id;

        ChannelService.loadBySpace(dbname_prefix, username, spaceId)
            .then(function (data) { dfd.resolve(data); })
            .catch(function (err) { dfd.reject(err); });

        return dfd.promise;
    }

    loadDetails(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const username = req.body.username;
        const channelId = req.body.channel_id;

        ChannelService.loadDetails(dbname_prefix, username, channelId)
            .then(function (data) { dfd.resolve(data); })
            .catch(function (err) { dfd.reject(err); });

        return dfd.promise;
    }

    insert(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const username = req.body.username;

        ChannelService.insert(dbname_prefix, username, req.body.data)
            .then(function () { dfd.resolve(true); })
            .catch(function (err) {
                dfd.reject({ mes: err.mes || 'Failed to create channel' });
            });

        return dfd.promise;
    }

    update(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const username = req.body.username;

        ChannelService.update(dbname_prefix, username, req.body.channel_id, req.body.data)
            .then(function () { dfd.resolve(true); })
            .catch(function (err) {
                dfd.reject({ mes: err.mes || 'Failed to update channel' });
            });

        return dfd.promise;
    }

    delete(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const username = req.body.username;

        ChannelService.delete(dbname_prefix, username, req.body.channel_id)
            .then(function () { dfd.resolve(true); })
            .catch(function (err) {
                dfd.reject({ mes: err.mes || 'Failed to delete channel' });
            });

        return dfd.promise;
    }

    loadMessages(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const channelId = req.body.channel_id;
        const limit = req.body.limit || 50;
        const before = req.body.before || null;

        ChannelService.loadMessages(dbname_prefix, channelId, limit, before)
            .then(function (data) { dfd.resolve(data); })
            .catch(function (err) { dfd.reject(err); });

        return dfd.promise;
    }

    sendMessage(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const username = req.body.username;
        const channelId = req.body.channel_id;
        const text = req.body.text;
        const replyTo = req.body.reply_to || null;

        ChannelService.sendMessage(dbname_prefix, username, channelId, text, 'text', replyTo)
            .then(function (data) {
                SocketProvider.IOEmitToRoom(`channel_${channelId}`, 'channel:new_message', data);
                dfd.resolve(data);
            })
            .catch(function (err) { dfd.reject(err); });

        return dfd.promise;
    }

    findOrCreateDM(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const username = req.body.username;
        const targetEmail = req.body.target_email;

        ChannelService.findOrCreateDM(dbname_prefix, username, targetEmail)
            .then(function (data) { dfd.resolve(data); })
            .catch(function (err) { dfd.reject(err); });

        return dfd.promise;
    }

    editMessage(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const username = req.body.username;
        const channelId = req.body.channel_id;

        ChannelService.editMessage(dbname_prefix, username, req.body.message_id, req.body.text)
            .then(function () {
                SocketProvider.IOEmitToRoom(`channel_${channelId}`, 'channel:edit_message', {
                    message_id: req.body.message_id,
                    text: req.body.text,
                    edited: true,
                    channel_id: channelId
                });
                dfd.resolve(true);
            })
            .catch(function (err) { dfd.reject({ mes: err.mes || 'Failed to edit message' }); });

        return dfd.promise;
    }

    deleteMessage(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const username = req.body.username;
        const channelId = req.body.channel_id;

        ChannelService.deleteMessage(dbname_prefix, username, req.body.message_id)
            .then(function () {
                SocketProvider.IOEmitToRoom(`channel_${channelId}`, 'channel:delete_message', {
                    message_id: req.body.message_id,
                    channel_id: channelId
                });
                dfd.resolve(true);
            })
            .catch(function (err) { dfd.reject({ mes: err.mes || 'Failed to delete message' }); });

        return dfd.promise;
    }

    reactToMessage(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const username = req.body.username;
        const channelId = req.body.channel_id;

        ChannelService.reactToMessage(dbname_prefix, username, req.body.message_id, req.body.emoji)
            .then(function (data) {
                SocketProvider.IOEmitToRoom(`channel_${channelId}`, 'channel:reaction', {
                    message_id: req.body.message_id,
                    reactions: data,
                    channel_id: channelId
                });
                dfd.resolve(data);
            })
            .catch(function (err) { dfd.reject(err); });

        return dfd.promise;
    }

    markRead(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const username = req.body.username;
        const channelId = req.body.channel_id;

        ChannelService.markRead(dbname_prefix, username, channelId)
            .then(function (data) {
                SocketProvider.IOEmitToRoom(`channel_${channelId}`, 'channel:read_update', data);
                dfd.resolve(data);
            })
            .catch(function (err) { dfd.reject(err); });

        return dfd.promise;
    }

    getUnreadCounts(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const username = req.body.username;

        ChannelService.getUnreadCounts(dbname_prefix, username)
            .then(function (data) { dfd.resolve(data); })
            .catch(function (err) { dfd.reject(err); });

        return dfd.promise;
    }

    getReadReceipts(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const channelId = req.body.channel_id;

        ChannelService.getReadReceipts(dbname_prefix, channelId)
            .then(function (data) { dfd.resolve(data); })
            .catch(function (err) { dfd.reject(err); });

        return dfd.promise;
    }
    getMemberAvatars(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const usernames = req.body.usernames || [];

        ChannelService.getMemberAvatars(dbname_prefix, usernames)
            .then(function (users) {
                // Return only the fields we need
                const result = (users || []).map(u => ({
                    username: u.username,
                    avatar_url: u.avatar_url || (u.avatar && u.avatar.url) || null,
                    title: u.title || u.username
                }));
                dfd.resolve(result);
            })
            .catch(function (err) { dfd.reject(err); });

        return dfd.promise;
    }
    pinMessage(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const username = req.body.username;
        const channelId = req.body.channel_id;
        const messageId = req.body.message_id;

        ChannelService.pinMessage(dbname_prefix, username, channelId, messageId)
            .then(function () {
                SocketProvider.IOEmitToRoom(`channel_${channelId}`, 'channel:pin_update', {
                    channel_id: channelId, message_id: messageId, pinned: true, pinned_by: username
                });
                dfd.resolve(true);
            })
            .catch(function (err) { dfd.reject(err); });

        return dfd.promise;
    }

    unpinMessage(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const username = req.body.username;
        const channelId = req.body.channel_id;
        const messageId = req.body.message_id;

        ChannelService.unpinMessage(dbname_prefix, username, channelId, messageId)
            .then(function () {
                SocketProvider.IOEmitToRoom(`channel_${channelId}`, 'channel:pin_update', {
                    channel_id: channelId, message_id: messageId, pinned: false
                });
                dfd.resolve(true);
            })
            .catch(function (err) { dfd.reject(err); });

        return dfd.promise;
    }

    getPinnedMessages(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const channelId = req.body.channel_id;

        ChannelService.getPinnedMessages(dbname_prefix, channelId)
            .then(function (data) { dfd.resolve(data); })
            .catch(function (err) { dfd.reject(err); });

        return dfd.promise;
    }

    uploadAttachment(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const username = req.body.username;
        const { FileProvider } = require('../../../shared/file/file.provider');

        FileProvider.upload(req, 'chat_attachment', undefined, 'office/channel', 'office/channel', username)
            .then(function (result) {
                // Build attachment metadata from uploaded files
                const attachments = (result.Files || []).map(f => ({
                    name: f.originalname || f.named || 'file',
                    named: f.named,
                    nameLib: f.nameLib || 'chat_attachment',
                    size: f.size || 0,
                    type: f.mimetype || 'application/octet-stream',
                    timePath: f.timePath || ''
                }));
                dfd.resolve(attachments);
            })
            .catch(function (err) {
                dfd.reject({ mes: 'Upload failed', err });
            });

        return dfd.promise;
    }

    sendMessageWithAttachments(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const username = req.body.username;
        const channelId = req.body.channel_id;
        const text = req.body.text || '';
        const type = req.body.type || 'file';
        const attachments = req.body.attachments || [];
        const replyTo = req.body.reply_to || null;

        ChannelService.sendMessageWithAttachments(dbname_prefix, username, channelId, text, type, attachments, replyTo)
            .then(function (data) {
                SocketProvider.IOEmitToRoom(`channel_${channelId}`, 'channel:new_message', data);
                dfd.resolve(data);
            })
            .catch(function (err) { dfd.reject(err); });

        return dfd.promise;
    }
    toggleMuteChannel(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const username = req.body.username;
        const channelId = req.body.channel_id;

        ChannelService.toggleMuteChannel(dbname_prefix, username, channelId)
            .then(function (data) { dfd.resolve(data); })
            .catch(function (err) { dfd.reject(err); });

        return dfd.promise;
    }

    getChannelMembers(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const username = req.body.username;
        const channelId = req.body.channel_id;

        ChannelService.getChannelMembers(dbname_prefix, username, channelId)
            .then(function (data) { dfd.resolve(data); })
            .catch(function (err) { dfd.reject(err); });

        return dfd.promise;
    }
    addMembers(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const username = req.body.username;
        const channelId = req.body.channel_id;
        const newMembers = req.body.members;

        ChannelService.addMembers(dbname_prefix, username, channelId, newMembers)
            .then(function (data) { dfd.resolve(data); })
            .catch(function (err) { dfd.reject(err); });

        return dfd.promise;
    }

    removeMember(req) {
        let dfd = q.defer();
        const dbname_prefix = req.body._service[0].dbname_prefix;
        const username = req.body.username;
        const channelId = req.body.channel_id;
        const memberToRemove = req.body.member;

        ChannelService.removeMember(dbname_prefix, username, channelId, memberToRemove)
            .then(function (data) { dfd.resolve(data); })
            .catch(function (err) { dfd.reject(err); });

        return dfd.promise;
    }
}

exports.ChannelController = new ChannelController();
