const { MongoDBProvider } = require('../../../shared/mongodb/db.provider');
const q = require('q');
const { ObjectId } = require('mongodb');

const PROJECT_COLLECTION = 'project';

class ProjectService {
    constructor() { }

    load(dbname_prefix, username, data) {
        let filter = data || {};
        const pipeline = [
            {
                $match: {
                    $and: [
                        { "members.username": username },
                        { isdeleted: { $ne: true } },
                        { isarchived: { $ne: true } },
                        filter
                    ]
                }
            }
        ];
        return MongoDBProvider.loadAggregate_onOffice(dbname_prefix, PROJECT_COLLECTION, pipeline);
    }

    count(dbname_prefix, data) {
        return MongoDBProvider.count_onOffice(dbname_prefix, PROJECT_COLLECTION, data);
    }

    loadDetails(dbname_prefix, username, project_id) {
        return MongoDBProvider.load_onOffice(dbname_prefix, PROJECT_COLLECTION, {
            $and: [
                { _id: new ObjectId(project_id) },
                { isactive: true },
                { "members.username": username }
            ]
        });
    }

    insert(dbname_prefix, username, data) {
        return MongoDBProvider.insert_onOffice(dbname_prefix, PROJECT_COLLECTION, username, data);
    }

    update(dbname_prefix, username, id, data) {
        return MongoDBProvider.update_onOffice(
            dbname_prefix,
            PROJECT_COLLECTION,
            username,
            { _id: new ObjectId(id) },
            { $set: data }
        );
    }

    delete(dbname_prefix, username, id) {
        return MongoDBProvider.delete_onOffice(
            dbname_prefix,
            PROJECT_COLLECTION,
            username,
            { _id: new ObjectId(id) }
        );
    }

    loadProjectBySpace(dbname_prefix, username, space_id) {
        const pipeline = [
            {
                $match: {
                    $and: [
                        { space_id: space_id },
                        { isactive: true },
                        { isarchived: { $ne: true } },
                        { "members.username": username }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'task',
                    let: { projectId: { $toString: '$_id' } },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$project_id', '$$projectId'] },
                                isdeleted: { $ne: true },
                                isactive: true
                            }
                        },
                        { $count: 'total' }
                    ],
                    as: '_taskCount'
                }
            },
            {
                $addFields: {
                    taskCount: {
                        $ifNull: [{ $arrayElemAt: ['$_taskCount.total', 0] }, 0]
                    }
                }
            },
            {
                $project: { _taskCount: 0 }
            }
        ];
        return MongoDBProvider.loadAggregate_onOffice(dbname_prefix, PROJECT_COLLECTION, pipeline);
    }
    archiveProject(dbname_prefix, username, id) {
        return MongoDBProvider.update_onOffice(dbname_prefix, PROJECT_COLLECTION, username, { _id: new ObjectId(id) }, { $set: { isarchived: true } });
    }

    unarchiveProject(dbname_prefix, username, id) {
        return MongoDBProvider.update_onOffice(dbname_prefix, PROJECT_COLLECTION, username, { _id: new ObjectId(id) }, { $set: { isarchived: false } });
    }

    loadArchived(dbname_prefix, username) {
        const pipeline = [
            { $match: { isarchived: true, isdeleted: { $ne: true }, "members.username": username } },
            { $sort: { _id: -1 } }
        ];
        return MongoDBProvider.loadAggregate_onOffice(dbname_prefix, PROJECT_COLLECTION, pipeline);
    }
}

exports.ProjectService = new ProjectService();
