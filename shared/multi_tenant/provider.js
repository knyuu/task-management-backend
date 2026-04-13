const { LogProvider } = require('../log_nohierarchy/log.provider');
const { MongoDBProvider } = require('../mongodb/db.provider');
const mongoDBSettings = require('../mongodb/mongodb.const');
const { messageHTTP, statusHTTP } = require('../../utils/setting');
const q = require('q');
const setting = require('../../utils/setting');

const PNT_TENANT = require('./pnt-tenant');

// ✅ PERFORMANCE: In-memory cache for loadService results
// Cache structure: { "domain_subdomain": { data: [...], timestamp: Date.now() } }
const serviceCache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

// Helper function to generate cache key
const getCacheKey = function(domain, subdomain) {
    return `${domain || ''}_${subdomain || ''}`;
};

// Helper function to check if cache is valid
const isCacheValid = function(cacheEntry) {
    if (!cacheEntry || !cacheEntry.timestamp) return false;
    return (Date.now() - cacheEntry.timestamp) < CACHE_TTL;
};
class MultiTenant {
    constructor() { }
    handleDomain(domain) {
        if (domain.indexOf("https://") !== -1) {
            if (domain.indexOf("https://www.") !== -1) {
                return domain.split("https://www.")[1];

            } else {
                return domain.split("https://")[1];

            }
        }
        if (domain.indexOf("http://www.") !== -1) {
            return domain.split("http://www.")[1];

        } else {
            return domain.split("http://")[1];

        }
    }

    handleSubdomain(domain) {
        if (domain.indexOf(setting.hostDomain) !== -1) {
            return domain.split(setting.hostDomain)[0];
        }
        return domain;
    }


    loadService(domain, subdomain, conditions) {
        let dfd = q.defer();

        // ✅ PERFORMANCE: Check in-memory cache first
        const cacheKey = getCacheKey(domain, subdomain);
        const cached = serviceCache[cacheKey];

        if (isCacheValid(cached)) {
            // Return cached data immediately
            dfd.resolve(cached.data);
            return dfd.promise;
        }

        let filter = {
            $and: [
                {
                    $or: [
                        { domain: { $eq: domain } },
                        { subdomain: { $eq: subdomain } }
                    ]
                },
                { status: { $in: ["Running", "Maintain"] } }
            ]
        };
        // if (conditions) {
        //     if (conditions.module_key) {
        //         filter.$and.push(
        //             { module_key: { $in: conditions.module_key } }
        //         );
        //     }

        //     if (conditions.package_key) {
        //         filter.$and.push(
        //             { package_key: { $in: conditions.package_key } }
        //         );
        //     }

        //     if (conditions.quantity_package) {
        //         filter.$and.push(
        //             { quantity_package: { $in: conditions.quantity_package } }
        //         );
        //     }
        // }

        MongoDBProvider.load(undefined, mongoDBSettings.connectName.host.business, "service", filter
        ).then(function (data) {
            const result = data[0] ? data : false;

            // ✅ PERFORMANCE: Cache the result
            serviceCache[cacheKey] = {
                data: result,
                timestamp: Date.now()
            };

            dfd.resolve(result);
        }, function (err) {
            dfd.reject(err);
            err = undefined;
        });
        return dfd.promise;
    }

    match(conditions) {
        return function (req, res, next) {

            req.body = req.body || {};
            req.body._service = [PNT_TENANT];
            next();
            return;
        }
    }

    isHost() {
        return function (req, res, next) {
            next();
            return;
        }
    }

    getActiveTenants() {
        let dfd = q.defer();
        let filter = {
            $and: [
                { status: { $in: ["Running"] } },
                { $expr: { $gt: ["expire_date", { $toLong: "$$NOW" }] } }
            ]
        };

        MongoDBProvider.load(undefined, mongoDBSettings.connectName.host.business, "service", filter)
            .then(function (data) {
                dfd.resolve(data);
            }, function (err) {
                dfd.reject(err);
                err = undefined;
            });
        return dfd.promise;
    }

    // Method to clear service cache (useful for testing or manual cache invalidation)
    clearCache() {
        Object.keys(serviceCache).forEach(key => delete serviceCache[key]);
    }
}

exports.MultiTenant = new MultiTenant();
