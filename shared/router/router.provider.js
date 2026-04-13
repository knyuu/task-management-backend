const trycatch = require("trycatch");

const { LogProvider } = require("../log_nohierarchy/log.provider");
const { statusHTTP, messageHTTP } = require("../../utils/setting");
const BaseError = require("../error/BaseError");
const { PerformanceTracker } = require("../performance/performance.tracker");
const { endTracking } = require("../performance/Performance.middleware");
class Router {
    constructor() { }

    LogAndMessage(res, api, obj) {
        if (res.statusCode === 200) {
            res.status(statusHTTP.internalServer);
        }
        if (obj instanceof BaseError) {
            res.status(obj.statusCode);
        }
        if (obj.err) {
            let errorDetails = obj.err;
            if (obj.err instanceof Error) {
                errorDetails = { message: obj.err.message, stack: obj.err.stack };
            }
            LogProvider.error(JSON.stringify(errorDetails), obj.path, "api", api);
        }
        if (!obj.mes) {
            res.send({ mes: messageHTTP.internalServer });
        } else {
            res.send({ mes: obj.mes });
        }
    }


    trycatchFunction(apiName, func) {
        return async function (req, res) {
            let obj = new Router();
            let myfunc = func(req, res);

            try {
                if (req._performanceId) {
                    PerformanceTracker.checkpoint(req._performanceId, 'Middleware Completed', {
                        api: apiName
                    });
                }
                myfunc();
                res.on('finish', () => {
                    endTracking(req, 'success');
                });

            } catch (err) {
                res.status(statusHTTP.internalServer);
                res.set("Connection", "close");
                console.error("[Router Catch]", err);
                obj.LogAndMessage(res, apiName, { path: "router.trycatch", err: err });
                res.end();
                endTracking(req, 'error', err);
                err = undefined;
                res = undefined;
                req = undefined;
                obj = undefined;
                myfunc = undefined;
                apiName = undefined;
                func = undefined;
                process.abort();

            }
        }
    }

}

exports.Router = new Router();
