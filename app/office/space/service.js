const { MongoDBProvider } = require('../../../shared/mongodb/db.provider');
const q = require('q');
const { ObjectId } = require('mongodb');
const { ChannelService } = require('../channel/service');
const { DEFAULT_STATUSES } = require('./const');
const { optimizeImageIfPossible } = require('../../../shared/file/image-optimizer');
const InvitationEmailProvider = require('../../../shared/invitation/invitation-email.provider');
const InvitationTokenProvider = require('../../../shared/invitation/invitation-token.provider');
const { FileProvider } = require('../../../shared/file/file.provider');
const settings = require('../../../utils/setting');

const SPACE_COLLECTION = 'space';
const PROJECT_COLLECTION = 'project';
const TASK_COLLECTION = 'task';

class SpaceService {
    constructor() { }

    load(dbname_prefix, username, data) {
        let filter = (data && data.filter) ? data.filter : {};
        const pipeline = [
            {
                $match: {
                    $and: [
                        { "members.username": username },
                        { isdeleted: { $ne: true } },
                        { isarchived: { $ne: true } },
                        { $or: [{ hidden_by: { $exists: false } }, { hidden_by: { $ne: username } }] },
                        filter
                    ]
                }
            }
        ];
        if (data && data.sort) {
            pipeline.push({ $sort: data.sort });
        }
        if (data && data.offset) {
            pipeline.push({ $skip: data.offset });
        }
        if (data && data.top) {
            pipeline.push({ $limit: data.top });
        }
        
        // Add isPinned status for current user
        pipeline.push({
            $addFields: {
                isPinned: {
                    $cond: {
                        if: { $isArray: "$pinned_by" },
                        then: { $in: [username, "$pinned_by"] },
                        else: false
                    }
                }
            }
        });

        return MongoDBProvider.loadAggregate_onOffice(dbname_prefix, SPACE_COLLECTION, pipeline);
    }

    loadHidden(dbname_prefix, username) {
        const pipeline = [
            {
                $match: {
                    $and: [
                        { "members.username": username },
                        { isdeleted: { $ne: true } },
                        { hidden_by: username }
                    ]
                }
            }
        ];
        return MongoDBProvider.loadAggregate_onOffice(dbname_prefix, SPACE_COLLECTION, pipeline);
    }

    count(dbname_prefix, data) {
        return MongoDBProvider.count_onOffice(dbname_prefix, SPACE_COLLECTION, data);
    }

    loadDetails(dbname_prefix, username, id) {
        return MongoDBProvider.load_onOffice(dbname_prefix, SPACE_COLLECTION, {
            $and: [
                { _id: new ObjectId(id) },
                { "members.username": username }
            ]
        }).then(function(spaces) {
            if (spaces && spaces.length > 0) {
                spaces[0].isPinned = (spaces[0].pinned_by || []).includes(username);
            }
            return spaces;
        });
    }

    loadWithProjects(dbname_prefix, data) {
        return MongoDBProvider.load_onOffice(dbname_prefix, SPACE_COLLECTION, data);
    }

    insert(dbname_prefix, username, data, formData) {
        let dfd = q.defer();
        data.projects = [];

        // Handle File Attachment (Space Icon Image)
        if (formData && formData.HttpFiles && formData.HttpFiles.length > 0) {
            // Find the file that matches the field name 'image' (custom for space icon)
            const iconFile = formData.HttpFiles[0]; // For now taking the first file
            if (iconFile) {
                data.avatar = {
                    named: iconFile.named,
                    timePath: iconFile.timePath,
                    filename: iconFile.filename,
                    mimetype: iconFile.mimetype,
                    fileSize: iconFile.fileSize
                };
                
                // Optimize on backend
                optimizeImageIfPossible({
                    dbname_prefix,
                    nameLib: 'office',
                    fileInfo: data.avatar,
                    maxSize: 512
                });
            }
        }

        if (!data.statuses || (Array.isArray(data.statuses) && data.statuses.length === 0)) {
            data.statuses = DEFAULT_STATUSES;
        }

        data.members = data.members || [];
        const isOwner = data.members.some(m => m.username === username && m.role === 'owner');
        if (!isOwner) {
            data.members = data.members.filter(m => m.username !== username);
            data.members.push({
                username: username,
                role: 'owner',
                status: 'active',
                joined_at: Date.now()
            });
        }

        MongoDBProvider.insert_onOffice(dbname_prefix, SPACE_COLLECTION, username, data).then(function (spaceResult) {
            const spaceId = spaceResult.ops[0]._id;

            const projectData = {
                name: "Project 1",
                description: "",
                space_id: spaceId.toString(),
                isPrivate: false,
                isactive: true,
                members: data.members // Inherit members from space
            };

            MongoDBProvider.insert_onOffice(dbname_prefix, PROJECT_COLLECTION, username, projectData).then(function (projectResult) {
                const projectId = projectResult.ops[0]._id;

                // Update space with new project ID
                MongoDBProvider.update_onOffice(dbname_prefix, SPACE_COLLECTION, username,
                    { _id: spaceId },
                    { $set: { projects: [projectId.toString()] } }
                ).then(function () {
                    dfd.resolve(spaceResult);
                }, function (err) {
                    dfd.reject({ mes: "Failed to update space with project", err });
                });
            }, function (err) {
                dfd.reject({ mes: "Failed to create default project", err });
            });
        }, function (err) {
            dfd.reject(err);
        });

        return dfd.promise;
    }

    update(dbname_prefix, username, id, data) {
        return MongoDBProvider.update_onOffice(
            dbname_prefix,
            SPACE_COLLECTION,
            username,
            { _id: new ObjectId(id) },
            { $set: data }
        );
    }

    delete(dbname_prefix, username, id) {
        let dfd = q.defer();
        // Only owner can delete
        MongoDBProvider.load_onOffice(dbname_prefix, SPACE_COLLECTION, {
            _id: new ObjectId(id),
            "members": { $elemMatch: { username: username, role: "owner" } }
        }, 1, 0).then(function (spaces) {
            if (!spaces || !spaces[0]) {
                dfd.reject({ mes: "Only the space owner can delete this space" });
                return;
            }
            MongoDBProvider.update_onOffice(
                dbname_prefix,
                SPACE_COLLECTION,
                username,
                { _id: new ObjectId(id) },
                { $set: { isdeleted: true } }
            ).then(function () {
                dfd.resolve(true);
            }).catch(function (err) {
                dfd.reject(err);
            });
        }).catch(function (err) {
            dfd.reject(err);
        });
        return dfd.promise;
    }

    hide(dbname_prefix, username, id) {
        let dfd = q.defer();
        MongoDBProvider.load_onOffice(dbname_prefix, SPACE_COLLECTION, {
            _id: new ObjectId(id),
            "members.username": username
        }, 1, 0).then(function (spaces) {
            if (!spaces || !spaces[0]) {
                dfd.reject({ mes: "Space not found" });
                return;
            }
            const hiddenBy = spaces[0].hidden_by || [];
            const isHidden = hiddenBy.includes(username);
            const update = isHidden
                ? { $pull: { hidden_by: username } }
                : { $addToSet: { hidden_by: username } };
            MongoDBProvider.update_onOffice(
                dbname_prefix,
                SPACE_COLLECTION,
                username,
                { _id: new ObjectId(id) },
                update
            ).then(function () {
                dfd.resolve({ hidden: !isHidden });
            }).catch(function (err) {
                dfd.reject(err);
            });
        }).catch(function (err) {
            dfd.reject(err);
        });
        return dfd.promise;
    }

    pin(dbname_prefix, username, id) {
        let dfd = q.defer();
        MongoDBProvider.load_onOffice(dbname_prefix, SPACE_COLLECTION, {
            _id: new ObjectId(id),
            "members.username": username
        }, 1, 0).then(function (spaces) {
            if (!spaces || !spaces[0]) {
                dfd.reject({ mes: "Space not found" });
                return;
            }
            const pinnedBy = spaces[0].pinned_by || [];
            const isPinned = pinnedBy.includes(username);
            const update = isPinned
                ? { $pull: { pinned_by: username } }
                : { $addToSet: { pinned_by: username } };
            
            MongoDBProvider.update_onOffice(
                dbname_prefix,
                SPACE_COLLECTION,
                username,
                { _id: new ObjectId(id) },
                update
            ).then(function () {
                dfd.resolve({ pinned: !isPinned });
            }).catch(function (err) {
                dfd.reject(err);
            });
        }).catch(function (err) {
            dfd.reject(err);
        });
        return dfd.promise;
    }

    loadMembers(dbname_prefix, username, spaceId) {
        let dfd = q.defer();

        MongoDBProvider.load_onOffice(dbname_prefix, SPACE_COLLECTION, {
            $and: [
                { _id: new ObjectId(spaceId) },
                { "members.username": username },
                { isdeleted: { $ne: true } }
            ]
        }, 1, 0).then(function (spaces) {
            if (!spaces || !spaces[0]) {
                dfd.reject({ mes: "Space not found" });
                return;
            }

            const members = (spaces[0].members || []).map(m => ({
                username: m.username,
                role: m.role,
                status: m.status
            }));

            // Load user titles/emails from management DB (best-effort)
            const usernames = members.map(m => m.username);
            MongoDBProvider.load_onManagement(dbname_prefix, "user", { username: { $in: usernames } }, usernames.length, 0, {}, {
                username: true,
                title: true,
                email: true,
                avatar_url: true,
                avatar: true
            }).then(function (users) {
                const byUsername = new Map((users || []).map(u => [u.username, u]));
                const enriched = members.map(m => {
                    const u = byUsername.get(m.username);
                    return {
                        ...m,
                        title: u?.title || m.username,
                        email: u?.email || m.username,
                        avatar_url: u?.avatar_url || null
                    };
                });
                dfd.resolve(enriched);
            }).catch(function () {
                // If management lookup fails, still return basic members
                dfd.resolve(members);
            });
        }).catch(function (err) {
            dfd.reject(err);
        });

        return dfd.promise;
    }

    addMember(dbname_prefix, username, spaceId, memberData) {
        let dfd = q.defer();
        if (memberData.username) memberData.username = memberData.username.toLowerCase();
        if (memberData.email) memberData.email = memberData.email.toLowerCase();
        // First verify the requesting user is a member of the space
        MongoDBProvider.load_onOffice(dbname_prefix, SPACE_COLLECTION, {
            _id: new ObjectId(spaceId),
            "members.username": username,
            isdeleted: { $ne: true }
        }, 1, 0).then(function (spaces) {
            if (!spaces || !spaces[0]) {
                dfd.reject({ mes: "Space not found or access denied" });
                return;
            }
            // Check if member already exists
            const existing = (spaces[0].members || []).find(m => m.username === memberData.username);
            if (existing) {
                dfd.reject({ mes: "Member already exists in this space" });
                return;
            }
            // Add member
            MongoDBProvider.update_onOffice(
                dbname_prefix,
                SPACE_COLLECTION,
                username,
                { _id: new ObjectId(spaceId) },
                { $push: { members: memberData } }
            ).then(function () {
                dfd.resolve(true);
            }).catch(function (err) {
                dfd.reject(err);
            });
        }).catch(function (err) {
            dfd.reject(err);
        });
        return dfd.promise;
    }

    loadTaskInSpace(dbname_prefix, username, spaceId) {
        return MongoDBProvider.load_onOffice(dbname_prefix, TASK_COLLECTION, {
            $and: [
                { space_id: spaceId },
                { isdeleted: { $ne: true } }
            ]
        });
    }

    inviteMember(dbname_prefix, inviterUsername, spaceId, email) {
        let dfd = q.defer();
        const self = this;
        email = email.toLowerCase();

        // 1. Check if space exists and inviter is owner/admin
        MongoDBProvider.load_onOffice(dbname_prefix, SPACE_COLLECTION, {
            _id: new ObjectId(spaceId),
            "members.username": inviterUsername,
            isdeleted: { $ne: true }
        }, 1, 0).then(function (spaces) {
            if (!spaces || !spaces[0]) {
                dfd.reject({ mes: "Space not found or access denied" });
                return;
            }

            const space = spaces[0];
            const inviter = space.members.find(m => m.username === inviterUsername);
            if (inviter.role !== 'owner' && inviter.role !== 'admin') {
                dfd.reject({ mes: "Only owners or admins can invite new members" });
                return;
            }

            // 2. Check if user already a member
            const existingMember = space.members.find(m => m.email === email || m.username === email);
            if (existingMember) {
                dfd.reject({ mes: "User is already a member of this space" });
                return;
            }

            // 3. Create invitation token
            console.log(`[SpaceService] Creating invitation for ${email} in space ${spaceId}`);
            InvitationTokenProvider.createInvitation('space', spaceId, email, inviterUsername, 'member', dbname_prefix)
                .then(function (invitation) {
                    console.log(`[SpaceService] Invitation token created: ${invitation.token}`);
                    // 4. Send email
                    InvitationEmailProvider.sendSpaceInvitation(email, inviterUsername, space.title || space.name, invitation.token)
                        .then(function (emailResult) {
                            console.log(`[SpaceService] Email provider result:`, emailResult);
                            dfd.resolve({ mes: "Invitation sent successfully" });
                        }, function (err) {
                            console.error(`[SpaceService] Email sending failed:`, err);
                            dfd.reject(err);
                        });
                }, function (err) {
                    console.error(`[SpaceService] Invitation token creation failed:`, err);
                    dfd.reject(err);
                });

        }).catch(function (err) {
            dfd.reject(err);
        });

        return dfd.promise;
    }

    acceptInvitation(dbname_prefix, username, token) {
        let dfd = q.defer();
        const self = this;

        // 1. Validate token
        InvitationTokenProvider.getInvitation(token).then(function (invitation) {
            if (invitation.type !== 'space') {
                dfd.reject({ mes: "Invalid invitation type" });
                return;
            }

            const spaceId = invitation.resourceId;

            // 2. Check if space exists
            MongoDBProvider.load_onOffice(dbname_prefix, SPACE_COLLECTION, {
                _id: new ObjectId(spaceId),
                isdeleted: { $ne: true }
            }, 1, 0).then(function (spaces) {
                if (!spaces || !spaces[0]) {
                    dfd.reject({ mes: "Space no longer exists" });
                    return;
                }

                const space = spaces[0];
                const existingMember = space.members.find(m => m.email === invitation.email || m.username === username);

                if (existingMember && existingMember.status === 'active') {
                    // User already a member, just mark invite as used
                    InvitationTokenProvider.markInvitationAsAccepted(token);
                    dfd.resolve({ mes: "Invitation accepted successfully", spaceId });
                    return;
                }

                if (existingMember) {
                    // Update existing "invited" member
                    MongoDBProvider.update_onOffice(
                        dbname_prefix,
                        SPACE_COLLECTION,
                        username,
                        { 
                            _id: new ObjectId(spaceId),
                            "members.email": invitation.email 
                        },
                        { $set: { 
                            "members.$.status": 'active',
                            "members.$.username": username,
                            "members.$.role": invitation.role || 'member',
                            "members.$.joined_at": Date.now()
                        } }
                    ).then(function () {
                        InvitationTokenProvider.markInvitationAsAccepted(token);
                        dfd.resolve({ mes: "Invitation accepted successfully", spaceId });
                    }).catch(err => dfd.reject(err));
                } else {
                    // Not in list yet, add them now
                    MongoDBProvider.update_onOffice(
                        dbname_prefix,
                        SPACE_COLLECTION,
                        username,
                        { _id: new ObjectId(spaceId) },
                        { $addToSet: { members: {
                            username: username,
                            email: invitation.email,
                            role: invitation.role || 'member',
                            status: 'active',
                            joined_at: Date.now()
                        } } }
                    ).then(function () {
                        InvitationTokenProvider.markInvitationAsAccepted(token);
                        dfd.resolve({ mes: "Invitation accepted successfully", spaceId });
                    }).catch(err => dfd.reject(err));
                }

            }).catch(function (err) {
                dfd.reject(err);
            });

        }, function (err) {
            dfd.reject(err);
        });

        return dfd.promise;
    }

    getInvitationDetails(token) {
        let dfd = q.defer();
        const self = this;

        InvitationTokenProvider.getInvitationWithoutStatusCheck(token).then(function (invitation) {
            const dbname_prefix = invitation.dbname_prefix || '';
            const resourceId = invitation.resourceId;
            const inviterUsername = invitation.inviterUsername;

            // Fetch Space Info
            const findSpace = MongoDBProvider.load_onOffice(dbname_prefix, SPACE_COLLECTION, {
                _id: new ObjectId(resourceId)
            }, 1, 0);

            // Fetch Inviter Info
            const findInviter = MongoDBProvider.load_onManagement('', 'user', {
                username: inviterUsername
            }, 1, 0);

            q.all([findSpace, findInviter]).then(function (results) {
                const spaces = results[0];
                const users = results[1];

                if (!spaces || !spaces[0]) {
                    dfd.reject({ mes: "Space not found" });
                    return;
                }

                const space = spaces[0];
                const inviter = users && users[0] ? users[0] : { title: inviterUsername };

                let avatarUrl = inviter.avatar_url || null;

                if (!avatarUrl && inviter.avatar && inviter.avatar.name) {
                    // Manual upload - resolve via FileProvider (using empty prefix for global management users)
                    FileProvider.loadFile(
                        '', 
                        {},
                        inviter.avatar.nameLib || 'avatar',
                        inviter.avatar.name,
                        undefined,
                        undefined,
                        ['management', 'user'],
                        inviter.username
                    ).then(function (img) {
                        dfd.resolve({
                            spaceTitle: space.title || space.name,
                            inviterName: inviter.title || inviter.username,
                            inviterAvatar: img.url,
                            email: invitation.email,
                            type: invitation.type,
                            status: invitation.status,
                            resourceId: invitation.resourceId
                        });
                    }).catch(function () {
                        // Fallback to default
                        dfd.resolve({
                            spaceTitle: space.title || space.name,
                            inviterName: inviter.title || inviter.username,
                            inviterAvatar: settings.adminDomain + "/datasources/images/default/avatar_default.png",
                            email: invitation.email,
                            type: invitation.type,
                            status: invitation.status,
                            resourceId: invitation.resourceId
                        });
                    });
                } else {
                    dfd.resolve({
                        spaceTitle: space.title || space.name,
                        inviterName: inviter.title || inviter.username,
                        inviterAvatar: avatarUrl || (settings.adminDomain + "/datasources/images/default/avatar_default.png"),
                        email: invitation.email,
                        type: invitation.type,
                        status: invitation.status,
                        resourceId: invitation.resourceId
                    });
                }
            }).catch(function (err) {
                dfd.reject({ mes: "Error fetching invitation details", err });
            });

        }, function (err) {
            dfd.reject(err);
        });

        return dfd.promise;
    }
    removeMember(dbname_prefix, username, spaceId, memberUsername) {
        let dfd = q.defer();
        memberUsername = memberUsername.toLowerCase();
        
        // 1. Load the space and find the requester
        MongoDBProvider.load_onOffice(dbname_prefix, SPACE_COLLECTION, {
            _id: new ObjectId(spaceId),
            isdeleted: { $ne: true }
        }, 1, 0).then(function (spaces) {
            if (!spaces || !spaces[0]) {
                dfd.reject({ mes: "Space not found" });
                return;
            }

            const space = spaces[0];
            const members = space.members || [];
            const requester = members.find(m => m.username === username);
            const target = members.find(m => m.username === memberUsername);

            if (!requester) {
                dfd.reject({ mes: "You are not a member of this space" });
                return;
            }

            if (!target) {
                dfd.reject({ mes: "The user is not a member of this space" });
                return;
            }

            // 2. Permission Check
            const requesterRole = requester.role;
            const targetRole = target.role;

            if (requesterRole !== 'owner' && requesterRole !== 'admin') {
                dfd.reject({ mes: "Only owners or admins can remove members" });
                return;
            }

            if (requesterRole === 'admin' && targetRole === 'owner') {
                dfd.reject({ mes: "Admins cannot remove the space owner" });
                return;
            }

            // 3. Last Owner Check
            if (targetRole === 'owner') {
                const ownersCount = members.filter(m => m.role === 'owner').length;
                if (ownersCount <= 1) {
                    dfd.reject({ mes: "The space must have at least one owner" });
                    return;
                }
            }

            // 4. Perform Removal
            MongoDBProvider.update_onOffice(
                dbname_prefix,
                SPACE_COLLECTION,
                username,
                { _id: new ObjectId(spaceId) },
                { $pull: { members: { username: memberUsername } } }
            ).then(function () {
                dfd.resolve(true);
            }).catch(function (err) {
                dfd.reject(err);
            });
        }).catch(function (err) {
            dfd.reject(err);
        });
        return dfd.promise;
    }
    archiveSpace(dbname_prefix, username, id) {
        return MongoDBProvider.update_onOffice(dbname_prefix, SPACE_COLLECTION, username, { _id: new ObjectId(id) }, { $set: { isarchived: true } });
    }

    unarchiveSpace(dbname_prefix, username, id) {
        return MongoDBProvider.update_onOffice(dbname_prefix, SPACE_COLLECTION, username, { _id: new ObjectId(id) }, { $set: { isarchived: false } });
    }

    loadArchived(dbname_prefix, username) {
        const pipeline = [
            { $match: { isarchived: true, isdeleted: { $ne: true }, "members.username": username } },
            { $sort: { _id: -1 } }
        ];
        return MongoDBProvider.loadAggregate_onOffice(dbname_prefix, SPACE_COLLECTION, pipeline);
    }
}

exports.SpaceService = new SpaceService();
