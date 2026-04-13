require("dotenv").config();
const q = require("q");
const PNT_TENANT = require("../multi_tenant/pnt-tenant");
const settings = require("../mongodb/mongodb.const");
const { MongoDBProvider } = require("../mongodb/db.provider.js");
var _initResource = require("../init").init;

const IndexConst = {
    office: require("../../app/office/indexConcern"),
    management: require("../../app/management/indexConcern"),
    basic: require("../../app/basic/indexConcern"),
    education: require("../../app/education/indexConcern"),
};

function logStart(name) {
    console.log(`--- Bắt đầu ${name} ---`);
}
function logEnd(name) {
    console.log(`--- Kết thúc ${name} ---`);
}
function logError(name, error) {
    console.error(`!!! Lỗi ở ${name}:`, error, error && error.stack);
}

function initResource() {
    logStart('initResource');
    const result = Promise.all([_initResource.initMongoDB(), _initResource.initRedis()]);
    result.then(() => logEnd('initResource')).catch(e => logError('initResource', e));
    return result;
}

function migrateCollection() {
    logStart('migrateCollection');
    const dfdAr = [];

    // Only create tenant and user collections in management database
    dfdAr.push(MongoDBProvider.createCollection_onManagement(PNT_TENANT["dbname_prefix"], "tenant"));
    dfdAr.push(MongoDBProvider.createCollection_onManagement(PNT_TENANT["dbname_prefix"], "user"));

    return q.all(dfdAr).then(
        function () {
            logEnd('migrateCollection');
            console.log("Migrate collection done (tenant, user only)");
        },
        function (err) {
            logError('migrateCollection', err);
            console.error(err);
        },
    );
}

function clearAllIndex(){
    logStart('clearAllIndex');
    const dfdAr = [];
    dfdAr.push(MongoDBProvider.clearAllIndexes(PNT_TENANT["dbname_prefix"], settings.connectName.office));
    dfdAr.push(MongoDBProvider.clearAllIndexes(PNT_TENANT["dbname_prefix"], settings.connectName.basic));
    dfdAr.push(MongoDBProvider.clearAllIndexes(PNT_TENANT["dbname_prefix"], settings.connectName.management));
    dfdAr.push(MongoDBProvider.clearAllIndexes(PNT_TENANT["dbname_prefix"], settings.connectName.education));

    const result = q.all(dfdAr);
    result.then(() => logEnd('clearAllIndex')).catch(e => logError('clearAllIndex', e));
    return result;
}

function migrateIndex() {
    logStart('migrateIndex');
    const dfdAr = [];

    // Only create indexes for tenant and user collections in management database
    if (IndexConst.management && Array.isArray(IndexConst.management)) {
        IndexConst.management.forEach((collection) => {
            // Only process tenant and user collections
            if (collection.nameCollection === "tenant" || collection.nameCollection === "user") {
                if (collection.items && Array.isArray(collection.items)) {
                    for (const item of collection.items) {
                        dfdAr.push(MongoDBProvider.createIndex_onManagement(
                            PNT_TENANT["dbname_prefix"],
                            collection.nameCollection,
                            item.keys,
                            item.type
                        ));
                    }
                }
            }
        });
    }

    if (dfdAr.length === 0) {
        console.log("No indexes to migrate for tenant and user");
        logEnd('migrateIndex');
        return q.resolve();
    }

    return q.all(dfdAr).then(function () {
        logEnd('migrateIndex');
        console.log("Migrate index done (tenant, user only)");
    });
}

function migrateService() {
    logStart('migrateService');
    const dfdAr = [];

    // Convert _id from string to ObjectID if needed
    const serviceData = { ...PNT_TENANT };
    if (serviceData._id && serviceData._id.$oid) {
        const { ObjectID } = require('mongodb');
        serviceData._id = new ObjectID(serviceData._id.$oid);
    }
    // Remove $oid wrapper if exists
    delete serviceData._id?.$oid;

    // Check if service already exists
    return MongoDBProvider.load(
        undefined, // No dbname_prefix for host database
        settings.connectName.host.business,
        "service",
        {
            $or: [
                { domain: { $eq: serviceData.domain } },
                { sub_domain: { $eq: serviceData.sub_domain } },
                { dbname_prefix: { $eq: serviceData.dbname_prefix } }
            ]
        },
        1,
        0
    ).then(function (existingService) {
        if (existingService[0]) {
            console.log("Service already exists, skipping insert");
            logEnd('migrateService');
            return q.resolve();
        } else {
            // Insert service into theera_business database
            dfdAr.push(
                MongoDBProvider.insert(
                    undefined, // No dbname_prefix for host database
                    settings.connectName.host.business,
                    "service",
                    "system",
                    serviceData
                )
            );
            return q.all(dfdAr).then(function () {
                logEnd('migrateService');
                console.log("Migrate service done");
            });
        }
    }, function (err) {
        logError('migrateService', err);
        return q.reject(err);
    });
}

// Removed migrateSetting - no need to migrate data

function clearDB() {
    logStart('clearDB');
    const dfdAr = [];
    dfdAr.push(MongoDBProvider.clearAllData(PNT_TENANT["dbname_prefix"], settings.connectName.office));
    dfdAr.push(MongoDBProvider.clearAllData(PNT_TENANT["dbname_prefix"], settings.connectName.basic));
    dfdAr.push(MongoDBProvider.clearAllData(PNT_TENANT["dbname_prefix"], settings.connectName.management));
    dfdAr.push(MongoDBProvider.clearAllData(PNT_TENANT["dbname_prefix"], settings.connectName.education));
    return q.all(dfdAr).then(
        function () {
            logEnd('clearDB');
            console.log("Clear DB");
        },
        function (err) {
            logError('clearDB', err);
            console.error(err);
        },
    );
}

function rollbackMigrate() {
    logStart('rollbackMigrate');
    return clearDB().then(() => {
        logEnd('rollbackMigrate');
        console.log("rollback successfully");
    });
}

initResource().then(async function () {
    try {
        // await clearDB();
        // await clearAllIndex();
        await migrateService(); // Migrate service first so system can find tenant
        await migrateCollection(); // Only create tenant and user collections
        await migrateIndex(); // Only create indexes for tenant and user

        console.log('Migrate done (tenant and user only, no data migration)')
    } catch (e) {
        console.error(e);
        // await rollbackMigrate();
    }

    process.exit(0);
});
