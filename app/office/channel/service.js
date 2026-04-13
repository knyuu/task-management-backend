const { MongoDBProvider } = require('../../../shared/mongodb/db.provider');
const q = require('q');
const { ObjectId } = require('mongodb');
const InvitationEmailProvider = require('../../../shared/invitation/invitation-email.provider');

const CHANNEL_COLLECTION = 'channel';
const MESSAGE_COLLECTION = 'message';

class ChannelService {
    constructor() { }

    /**
     * Load all channels the user has access to
     */
    load(dbname_prefix, username) {
        const pipeline = [
            {
                $match: {
                    members: username,
                    isdeleted: { $ne: true }
                }
            },
            { $sort: { 'last_message.timestamp': -1, created: -1 } }
        ];
        return MongoDBProvider.loadAggregate_onOffice(dbname_prefix, CHANNEL_COLLECTION, pipeline);
    }

    /**
     * Find or create a direct message channel between two users
     */
    findOrCreateDM(dbname_prefix, username, targetEmail) {
        let dfd = q.defer();
        const self = this;

        // Sort member names to create a consistent lookup, normalized to lowercase
        const members = [(username || '').toLowerCase(), (targetEmail || '').toLowerCase()].sort();

        // Try to find existing DM
        MongoDBProvider.load_onOffice(dbname_prefix, CHANNEL_COLLECTION, {
            type: 'direct',
            members: { $all: members, $size: 2 },
            isdeleted: { $ne: true }
        }, 1, 0).then(function (existing) {
            if (existing && existing.length > 0) {
                dfd.resolve(existing[0]);
            } else {
                // Create new DM channel
                const channelData = {
                    name: targetEmail,
                    space_id: null,
                    type: 'direct',
                    description: '',
                    created_by: username,
                    members: members,
                    is_default: false,
                    isdeleted: false,
                    created: new Date(),
                    last_message: null
                };
                MongoDBProvider.insert_onOffice(dbname_prefix, CHANNEL_COLLECTION, username, channelData)
                    .then(function (result) {
                        const inserted = result.ops ? result.ops[0] : channelData;
                        dfd.resolve(inserted);
                    })
                    .catch(function (err) {
                        dfd.reject({ mes: 'Failed to create DM channel', err });
                    });
            }
        }).catch(function (err) {
            dfd.reject(err);
        });

        return dfd.promise;
    }

    /**
     * Load channels for a specific space
     */
    loadBySpace(dbname_prefix, username, spaceId) {
        const pipeline = [
            {
                $match: {
                    space_id: spaceId,
                    members: username,
                    isdeleted: { $ne: true }
                }
            },
            { $sort: { is_default: -1, created: 1 } }
        ];
        return MongoDBProvider.loadAggregate_onOffice(dbname_prefix, CHANNEL_COLLECTION, pipeline);
    }

    /**
     * Load channel details
     */
    loadDetails(dbname_prefix, username, channelId) {
        if (!channelId || typeof channelId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(channelId)) {
            let dfd = q.defer();
            dfd.reject({ mes: 'Invalid channel_id' });
            return dfd.promise;
        }
        return MongoDBProvider.load_onOffice(dbname_prefix, CHANNEL_COLLECTION, {
            _id: new ObjectId(channelId),
            members: username,
            isdeleted: { $ne: true }
        });
    }

    /**
     * Create a new channel in a space
     */
    insert(dbname_prefix, username, data) {
        let dfd = q.defer();

        const channelData = {
            name: data.name,
            space_id: data.space_id,
            type: data.type || 'space',
            description: data.description || '',
            created_by: username,
            members: data.members || [username],
            is_default: data.is_default || false,
            isdeleted: false,
            created: new Date(),
            last_message: null
        };

        MongoDBProvider.insert_onOffice(dbname_prefix, CHANNEL_COLLECTION, username, channelData)
            .then(function (result) {
                dfd.resolve(result);
            })
            .catch(function (err) {
                dfd.reject({ mes: 'Failed to create channel', err });
            });

        return dfd.promise;
    }

    /**
     * Update channel info
     */
    update(dbname_prefix, username, channelId, data) {
        return MongoDBProvider.update_onOffice(
            dbname_prefix,
            CHANNEL_COLLECTION,
            username,
            { _id: new ObjectId(channelId) },
            { $set: data }
        );
    }

    /**
     * Soft-delete a channel
     */
    delete(dbname_prefix, username, channelId) {
        return MongoDBProvider.update_onOffice(
            dbname_prefix,
            CHANNEL_COLLECTION,
            username,
            { _id: new ObjectId(channelId), is_default: { $ne: true } },
            { $set: { isdeleted: true } }
        );
    }

    /**
     * Load messages for a channel (paginated, newest first)
     */
    loadMessages(dbname_prefix, channelId, limit, before) {
        let dfd = q.defer();
        limit = limit || 50;

        let matchFilter = {
            channel_id: channelId,
            isdeleted: { $ne: true }
        };

        if (before) {
            matchFilter._id = { $lt: new ObjectId(before) };
        }

        const pipeline = [
            { $match: matchFilter },
            { $sort: { _id: -1 } },
            { $limit: limit }
        ];

        MongoDBProvider.loadAggregate_onOffice(dbname_prefix, MESSAGE_COLLECTION, pipeline)
            .then(function (messages) {
                // Reverse so oldest is first in the returned array
                dfd.resolve((messages || []).reverse());
            })
            .catch(function (err) {
                dfd.reject(err);
            });

        return dfd.promise;
    }

    /**
     * Send a message to a channel
     */
    sendMessage(dbname_prefix, username, channelId, text, type, replyTo) {
        let dfd = q.defer();

        const messageData = {
            channel_id: channelId,
            sender: username,
            text: text,
            type: type || 'text',
            attachments: [],
            edited: false,
            isdeleted: false,
            reply_to: replyTo || null,
            created: new Date()
        };

        MongoDBProvider.insert_onOffice(dbname_prefix, MESSAGE_COLLECTION, username, messageData)
            .then(function (result) {
                const insertedMessage = result.ops ? result.ops[0] : messageData;

                // Update last_message on channel
                MongoDBProvider.update_onOffice(
                    dbname_prefix,
                    CHANNEL_COLLECTION,
                    username,
                    { _id: new ObjectId(channelId) },
                    {
                        $set: {
                            last_message: {
                                text: text,
                                sender: username,
                                timestamp: messageData.created
                            }
                        }
                    }
                ).catch(function () { /* non-critical */ });

                dfd.resolve(insertedMessage);
            })
            .catch(function (err) {
                dfd.reject({ mes: 'Failed to send message', err });
            });

        return dfd.promise;
    }

    /**
     * Edit a message (only sender can edit)
     */
    editMessage(dbname_prefix, username, messageId, newText) {
        return MongoDBProvider.update_onOffice(
            dbname_prefix,
            MESSAGE_COLLECTION,
            username,
            { _id: new ObjectId(messageId), sender: username, isdeleted: { $ne: true } },
            { $set: { text: newText, edited: true, edited_at: new Date() } }
        );
    }

    /**
     * Soft-delete a message (only sender can delete)
     */
    deleteMessage(dbname_prefix, username, messageId) {
        return MongoDBProvider.update_onOffice(
            dbname_prefix,
            MESSAGE_COLLECTION,
            username,
            { _id: new ObjectId(messageId), sender: username },
            { $set: { isdeleted: true, deleted_at: new Date() } }
        );
    }

    /**
     * Toggle emoji reaction on a message
     */
    reactToMessage(dbname_prefix, username, messageId, emoji) {
        let dfd = q.defer();

        MongoDBProvider.load_onOffice(dbname_prefix, MESSAGE_COLLECTION, {
            _id: new ObjectId(messageId),
            isdeleted: { $ne: true }
        }, 1, 0).then(function (messages) {
            if (!messages || messages.length === 0) {
                dfd.reject({ mes: 'Message not found' });
                return;
            }
            const msg = messages[0];
            let reactions = msg.reactions || [];
            const existingIdx = reactions.findIndex(r => r.emoji === emoji);

            if (existingIdx >= 0) {
                const userIdx = reactions[existingIdx].users.indexOf(username);
                if (userIdx >= 0) {
                    reactions[existingIdx].users.splice(userIdx, 1);
                    if (reactions[existingIdx].users.length === 0) {
                        reactions.splice(existingIdx, 1);
                    }
                } else {
                    reactions[existingIdx].users.push(username);
                }
            } else {
                reactions.push({ emoji, users: [username] });
            }

            MongoDBProvider.update_onOffice(
                dbname_prefix, MESSAGE_COLLECTION, username,
                { _id: new ObjectId(messageId) },
                { $set: { reactions } }
            ).then(function () {
                dfd.resolve(reactions);
            }).catch(function (err) {
                dfd.reject(err);
            });
        }).catch(function (err) {
            dfd.reject(err);
        });

        return dfd.promise;
    }

    /**
     * Create a default #general channel for a space
     */
    createDefaultChannel(dbname_prefix, username, spaceId, spaceName, members) {
        return this.insert(dbname_prefix, username, {
            name: spaceName,
            space_id: spaceId,
            type: 'space',
            description: `Kênh chung của ${spaceName}`,
            members: members,
            is_default: true
        });
    }

    /**
     * Mark channel as read by user — stores in read_receipts array
     * read_receipts: [ { username: "user@email.com", read_at: Date }, ... ]
     */
    markRead(dbname_prefix, username, channelId) {
        let dfd = q.defer();
        const now = new Date();

        // Load channel first to safely handle any format
        MongoDBProvider.load_onOffice(dbname_prefix, CHANNEL_COLLECTION, {
            _id: new ObjectId(channelId)
        }, 1, 0).then(function (channels) {
            if (!channels || channels.length === 0) {
                dfd.reject({ mes: 'Channel not found' });
                return;
            }

            // Get existing receipts, ensure it's an array
            let receipts = channels[0].read_receipts;
            if (!Array.isArray(receipts)) receipts = [];

            // Remove old entry for this user, add new one
            receipts = receipts.filter(r => r.username !== username);
            receipts.push({ username: username, read_at: now });

            // Save back
            return MongoDBProvider.update_onOffice(
                dbname_prefix,
                CHANNEL_COLLECTION,
                username,
                { _id: new ObjectId(channelId) },
                { $set: { read_receipts: receipts } }
            ).then(function () {
                dfd.resolve({ channel_id: channelId, username, read_at: now });
            });
        }).catch(function (err) {
            dfd.reject(err);
        });

        return dfd.promise;
    }

    /**
     * Get unread message counts for all channels the user is a member of
     */
    getUnreadCounts(dbname_prefix, username) {
        let dfd = q.defer();

        // First load all channels user is member of
        MongoDBProvider.load_onOffice(dbname_prefix, CHANNEL_COLLECTION, {
            members: username,
            isdeleted: { $ne: true }
        }).then(function (channels) {
            if (!channels || channels.length === 0) {
                dfd.resolve([]);
                return;
            }

            const promises = channels.map(function (ch) {
                const rawReceipts = ch.read_receipts;
                const receipts = Array.isArray(rawReceipts) ? rawReceipts : [];
                const userReceipt = receipts.find(r => r.username === username);
                const lastRead = userReceipt ? new Date(userReceipt.read_at) : new Date(0);

                // Count messages after lastRead using simple count
                return MongoDBProvider.count_onOffice(dbname_prefix, MESSAGE_COLLECTION, {
                    channel_id: ch._id.toString(),
                    isdeleted: { $ne: true },
                    created: { $gt: lastRead },
                    sender: { $ne: username }
                }).then(function (count) {
                    return {
                        channel_id: ch._id.toString(),
                        unread: count || 0
                    };
                });
            });

            q.all(promises).then(function (counts) {
                dfd.resolve(counts.filter(c => c.unread > 0));
            }).catch(function (err) {
                dfd.reject(err);
            });
        }).catch(function (err) {
            dfd.reject(err);
        });

        return dfd.promise;
    }

    /**
     * Get read receipts for a channel (who has read and when)
     * Returns array: [ { username, read_at }, ... ]
     */
    getReadReceipts(dbname_prefix, channelId) {
        let dfd = q.defer();
        MongoDBProvider.load_onOffice(dbname_prefix, CHANNEL_COLLECTION, {
            _id: new ObjectId(channelId)
        }, 1, 0).then(function (channels) {
            if (!channels || channels.length === 0) {
                dfd.resolve([]);
                return;
            }
            const receipts = channels[0].read_receipts;
            // Handle old object format or missing field
            dfd.resolve(Array.isArray(receipts) ? receipts : []);
        }).catch(function (err) {
            dfd.reject(err);
        });
        return dfd.promise;
    }
    /**
     * Get avatar info for a list of usernames
     * Queries management DB 'user' collection for avatar_url and title
     */
    getMemberAvatars(dbname_prefix, usernames) {
        return MongoDBProvider.load_onManagement(dbname_prefix, 'user', {
            username: { $in: usernames }
        }, undefined, undefined, undefined, {
            username: true,
            avatar_url: true,
            title: true,
            avatar: true
        });
    }
    /**
     * Pin a message
     */
    pinMessage(dbname_prefix, username, channelId, messageId) {
        return MongoDBProvider.update_onOffice(
            dbname_prefix, MESSAGE_COLLECTION, username,
            { _id: new ObjectId(messageId), channel_id: channelId, isdeleted: { $ne: true } },
            { $set: { pinned: true, pinned_by: username, pinned_at: new Date() } }
        );
    }

    /**
     * Unpin a message
     */
    unpinMessage(dbname_prefix, username, channelId, messageId) {
        return MongoDBProvider.update_onOffice(
            dbname_prefix, MESSAGE_COLLECTION, username,
            { _id: new ObjectId(messageId), channel_id: channelId },
            { $set: { pinned: false }, $unset: { pinned_by: '', pinned_at: '' } }
        );
    }

    /**
     * Get pinned messages for a channel
     */
    getPinnedMessages(dbname_prefix, channelId) {
        return MongoDBProvider.load_onOffice(dbname_prefix, MESSAGE_COLLECTION, {
            channel_id: channelId,
            pinned: true,
            isdeleted: { $ne: true }
        }, 50, 0, { pinned_at: -1 });
    }

    /**
     * Send a message with attachments
     */
    sendMessageWithAttachments(dbname_prefix, username, channelId, text, type, attachments, replyTo) {
        let dfd = q.defer();

        const messageData = {
            channel_id: channelId,
            sender: username,
            text: text || '',
            type: type || 'file',
            attachments: attachments || [],
            edited: false,
            isdeleted: false,
            reply_to: replyTo || null,
            created: new Date()
        };

        MongoDBProvider.insert_onOffice(dbname_prefix, MESSAGE_COLLECTION, username, messageData)
            .then(function (result) {
                const insertedMessage = result.ops ? result.ops[0] : messageData;

                // Build last_message preview
                let previewText = text || '';
                if (!previewText && attachments && attachments.length > 0) {
                    const first = attachments[0];
                    if (first.type && first.type.startsWith('image')) previewText = '📷 Hình ảnh';
                    else if (first.type && first.type.startsWith('audio')) previewText = '🎤 Tin nhắn thoại';
                    else previewText = '📎 ' + (first.name || 'Tệp đính kèm');
                }

                MongoDBProvider.update_onOffice(
                    dbname_prefix, CHANNEL_COLLECTION, username,
                    { _id: new ObjectId(channelId) },
                    { $set: { last_message: { text: previewText, sender: username, timestamp: messageData.created } } }
                ).catch(function () { });

                dfd.resolve(insertedMessage);
            })
            .catch(function (err) {
                dfd.reject({ mes: 'Failed to send message', err });
            });

        return dfd.promise;
    }
    /**
     * Toggle mute/unmute a channel for a user
     * Stores muted users in `muted_by` array on the channel document
     */
    toggleMuteChannel(dbname_prefix, username, channelId) {
        let dfd = q.defer();

        MongoDBProvider.load_onOffice(dbname_prefix, CHANNEL_COLLECTION, {
            _id: new ObjectId(channelId),
            members: username,
            isdeleted: { $ne: true }
        }).then(function (channels) {
            if (!channels || channels.length === 0) {
                dfd.reject({ mes: 'Channel not found' });
                return;
            }
            const channel = channels[0];
            const mutedBy = channel.muted_by || [];
            const isMuted = mutedBy.includes(username);

            const update = isMuted
                ? { $pull: { muted_by: username } }
                : { $addToSet: { muted_by: username } };

            MongoDBProvider.update_onOffice(
                dbname_prefix, CHANNEL_COLLECTION, username,
                { _id: new ObjectId(channelId) },
                update
            ).then(function () {
                dfd.resolve({ muted: !isMuted });
            }).catch(function (err) {
                dfd.reject(err);
            });
        }).catch(function (err) {
            dfd.reject(err);
        });

        return dfd.promise;
    }

    /**
     * Get channel members with profile details
     */
    getChannelMembers(dbname_prefix, username, channelId) {
        let dfd = q.defer();

        MongoDBProvider.load_onOffice(dbname_prefix, CHANNEL_COLLECTION, {
            _id: new ObjectId(channelId),
            members: username,
            isdeleted: { $ne: true }
        }).then(function (channels) {
            if (!channels || channels.length === 0) {
                dfd.reject({ mes: 'Channel not found' });
                return;
            }
            const members = channels[0].members || [];
            if (members.length === 0) {
                dfd.resolve([]);
                return;
            }

            // Fetch profile details for all members
            MongoDBProvider.load_onManagement(dbname_prefix, 'user', {
                username: { $in: members }
            }, undefined, undefined, undefined, {
                username: true,
                avatar_url: true,
                avatar: true,
                title: true,
                email: true
            }).then(function (users) {
                const result = (users || []).map(u => ({
                    username: u.username,
                    avatar_url: u.avatar_url || (u.avatar && u.avatar.url) || null,
                    title: u.title || u.username,
                    email: u.email || ''
                }));
                dfd.resolve(result);
            }).catch(function (err) {
                dfd.reject(err);
            });
        }).catch(function (err) {
            dfd.reject(err);
        });

        return dfd.promise;
    }

    /**
     * Add members to a channel (owner only)
     */
    addMembers(dbname_prefix, username, channelId, newMembers) {
        let dfd = q.defer();

        MongoDBProvider.load_onOffice(dbname_prefix, CHANNEL_COLLECTION, {
            _id: new ObjectId(channelId),
            isdeleted: { $ne: true }
        }).then(function (channels) {
            if (!channels || channels.length === 0) {
                dfd.reject({ mes: 'Channel not found' });
                return;
            }
            const channel = channels[0];
            if (channel.created_by !== username) {
                dfd.reject({ mes: 'Only the channel owner can add members' });
                return;
            }
            if (channel.type === 'direct') {
                dfd.reject({ mes: 'Cannot add members to a direct message' });
                return;
            }

            // Check which users exist in the system
            console.log('[addMembers] Channel:', channel.name, '| Owner:', channel.created_by, '| Members to add:', newMembers);

            MongoDBProvider.load_onManagement(dbname_prefix, 'user', {
                $or: [
                    { username: { $in: newMembers } },
                    { email: { $in: newMembers } }
                ]
            }, undefined, undefined, undefined, {
                username: true, email: true
            }).then(function (existingUsers) {
                console.log('[addMembers] DB user lookup result:', JSON.stringify(existingUsers));

                const existingUsernames = new Set();
                const existingEmails = new Set();
                (existingUsers || []).forEach(u => {
                    if (u.username) existingUsernames.add(u.username.toLowerCase());
                    if (u.email) existingEmails.add(u.email.toLowerCase());
                });

                console.log('[addMembers] Known usernames:', [...existingUsernames], '| Known emails:', [...existingEmails]);

                const toAdd = [];
                const toInvite = [];

                newMembers.forEach(m => {
                    const lower = m.toLowerCase();
                    if (existingUsernames.has(lower) || existingEmails.has(lower)) {
                        toAdd.push(m);
                    } else {
                        toInvite.push(m);
                    }
                });

                console.log('[addMembers] toAdd:', toAdd, '| toInvite:', toInvite);

                // Add existing users to channel
                const addPromise = toAdd.length > 0
                    ? MongoDBProvider.update_onOffice(
                        dbname_prefix, CHANNEL_COLLECTION, username,
                        { _id: new ObjectId(channelId) },
                        { $addToSet: { members: { $each: toAdd } } }
                    )
                    : q.resolve();

                addPromise.then(function () {
                    // Send invitation emails to non-registered users
                    if (toInvite.length > 0) {
                        console.log('[addMembers] Sending invitation emails to:', toInvite);
                    }

                    const emailPromises = toInvite.map(function (email) {
                        console.log('[addMembers] Calling sendChannelInvitation for:', email);
                        return InvitationEmailProvider.sendChannelInvitation(
                            email, username, channel.name
                        ).then(function (result) {
                            console.log('[addMembers] Email result for', email, ':', JSON.stringify(result));
                            return result;
                        }).catch(function (err) {
                            console.error('[addMembers] Email FAILED for', email, ':', JSON.stringify(err));
                            return { failed: true, email, error: err };
                        });
                    });

                    q.all(emailPromises).then(function (emailResults) {
                        console.log('[addMembers] All email results:', JSON.stringify(emailResults));
                        // Return updated members list + results
                        MongoDBProvider.load_onOffice(dbname_prefix, CHANNEL_COLLECTION, {
                            _id: new ObjectId(channelId)
                        }).then(function (updated) {
                            var result = {
                                members: updated[0].members,
                                added: toAdd,
                                invited: toInvite
                            };
                            console.log('[addMembers] FINAL result:', JSON.stringify(result));
                            dfd.resolve(result);
                        }).catch(function () {
                            dfd.resolve({
                                members: [...new Set([...channel.members, ...toAdd])],
                                added: toAdd,
                                invited: toInvite
                            });
                        });
                    });
                }).catch(function (err) {
                    console.error('[addMembers] Error adding to channel:', err);
                    dfd.reject(err);
                });
            }).catch(function (err) {
                console.error('[addMembers] Error looking up users:', err);
                dfd.reject(err);
            });
        }).catch(function (err) {
            console.error('[addMembers] Error loading channel:', err);
            dfd.reject(err);
        });

        return dfd.promise;
    }

    /**
     * Remove a member from a channel (owner only)
     */
    removeMember(dbname_prefix, username, channelId, memberToRemove) {
        let dfd = q.defer();

        MongoDBProvider.load_onOffice(dbname_prefix, CHANNEL_COLLECTION, {
            _id: new ObjectId(channelId),
            isdeleted: { $ne: true }
        }).then(function (channels) {
            if (!channels || channels.length === 0) {
                dfd.reject({ mes: 'Channel not found' });
                return;
            }
            const channel = channels[0];
            if (channel.created_by !== username) {
                dfd.reject({ mes: 'Only the channel owner can remove members' });
                return;
            }
            if (memberToRemove === username) {
                dfd.reject({ mes: 'Cannot remove yourself from the channel' });
                return;
            }

            MongoDBProvider.update_onOffice(
                dbname_prefix, CHANNEL_COLLECTION, username,
                { _id: new ObjectId(channelId) },
                { $pull: { members: memberToRemove } }
            ).then(function () {
                dfd.resolve({ removed: memberToRemove, members: channel.members.filter(m => m !== memberToRemove) });
            }).catch(function (err) {
                dfd.reject(err);
            });
        }).catch(function (err) {
            dfd.reject(err);
        });

        return dfd.promise;
    }
}

exports.ChannelService = new ChannelService();
