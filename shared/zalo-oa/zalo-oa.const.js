const { response } = require("express");


const {
    DOMAIN_ZALO_OA,
    APP_ID_ZALO_OA,
    SECRET_KEY_ZALO_OA,
    DOMAIN_AUTH_ZALO_OA,
    DOMAIN_BUSINESS_ZALO_OA,
} = process.env;

var obj = {
    domain: DOMAIN_ZALO_OA,
    appId: APP_ID_ZALO_OA,
    secretKey: SECRET_KEY_ZALO_OA,
    domainAuth: DOMAIN_AUTH_ZALO_OA,
    domainBusiness: DOMAIN_BUSINESS_ZALO_OA,
};

module.exports = obj;
