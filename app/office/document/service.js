const { MongoDBProvider } = require('../../../shared/mongodb/db.provider');
const q = require('q');
const { ObjectId } = require('mongodb');

const DOC_COLLECTION = 'document';

class DocumentService {
    constructor() { }

    load(dbname_prefix, username, spaceId) {
        const pipeline = [
            {
                $match: {
                    $and: [
                        { space_id: spaceId },
                        { isdeleted: { $ne: true } }
                    ]
                }
            },
            { $sort: { updated_at: -1 } }
        ];
        return MongoDBProvider.loadAggregate_onOffice(dbname_prefix, DOC_COLLECTION, pipeline);
    }

    loadDetails(dbname_prefix, id) {
        return MongoDBProvider.load_onOffice(dbname_prefix, DOC_COLLECTION, {
            _id: new ObjectId(id),
            isdeleted: { $ne: true }
        });
    }

    insert(dbname_prefix, username, data) {
        let dfd = q.defer();
        const doc = {
            title: data.title || 'Untitled Document',
            content: data.content || '',
            space_id: data.space_id,
            created_by: username,
            updated_by: username,
            created_at: new Date().getTime(),
            updated_at: new Date().getTime(),
            isdeleted: false
        };
        MongoDBProvider.insert_onOffice(dbname_prefix, DOC_COLLECTION, username, doc).then(function (result) {
            dfd.resolve(result.ops ? result.ops[0] : result);
        }).catch(function (err) {
            dfd.reject(err);
        });
        return dfd.promise;
    }

    update(dbname_prefix, username, id, data) {
        const updateData = { ...data, updated_by: username, updated_at: new Date().getTime() };
        return MongoDBProvider.update_onOffice(
            dbname_prefix,
            DOC_COLLECTION,
            username,
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
    }

    delete(dbname_prefix, username, id) {
        return MongoDBProvider.update_onOffice(
            dbname_prefix,
            DOC_COLLECTION,
            username,
            { _id: new ObjectId(id) },
            { $set: { isdeleted: true, updated_by: username, updated_at: new Date().getTime() } }
        );
    }
}

exports.DocumentService = new DocumentService();
