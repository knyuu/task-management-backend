const { StoreConst } = require('./store.const');
const { HTTPRequestProvider } = require('../../../shared/httpRequest/http.provider');
const q = require('q');

let accessToken = null;
let expireDate = null;
let basUrl = null;

class VngCloudConfig {
    constructor() {}

    getToken() {
        let dfd = q.defer();

        try {
            const url = StoreConst.vngTokenUrl;
            const body = {
                auth: {
                    identity: {
                        methods: ['password'],
                        password: {
                            user: {
                                domain: {
                                    name: 'default',
                                },
                                name: StoreConst.vngUsername,
                                password: StoreConst.vngPassword,
                            },
                        },
                    },
                    scope: {
                        project: {
                            domain: {
                                name: 'default',
                            },
                            id: StoreConst.vngStorageProjectEranin,
                        },
                    },
                },
            };
            const options = {
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                },
            };

            HTTPRequestProvider.post(url, body, options)
                .then((response) => {
                    accessToken = response.headers['x-subject-token'];
                    expireDate = new Date(response.data.token.expires_at);
                    const findCatalog = response.data.token.catalog.find((item) => item.type === 'object-store');
                    const findEndpoint = findCatalog.endpoints.find((c) => c.interface === 'public');
                    basUrl = findEndpoint.url;
                    dfd.resolve({ accessToken, basUrl });
                })
                .catch((error) => {
                    console.log('🚀🚀 ~ VngCloudConfig ~ getToken ~ error:', error);
                    dfd.reject();
                });
        } catch (error) {
            console.log('🚀🚀 ~ VngCloudConfig ~ getToken ~ error:', error);
            throw new Error('Failed to obtain token');
        }
        return dfd.promise;
    }

    getAccessToken() {
        let dfd = q.defer();

        // If token is not set or has expired, get a new one
        if (!accessToken || !basUrl || !expireDate || new Date() >= expireDate) {
            this.getToken().then((res) => {
                dfd.resolve(res);
            });
        } else {
            dfd.resolve({ accessToken, basUrl });
        }
        return dfd.promise;
    }

    getSecretKey() {
        let dfd = q.defer();
        const options = {
            headers: {
                'X-Auth-Token': accessToken,
            },
        };
        HTTPRequestProvider.get(basUrl,options)
            .then((response) => {
                let secretKey = response.headers['x-account-meta-temp-url-key'];
                dfd.resolve(secretKey);
            })
            .catch((error) => {
                dfd.reject();
            });
        return dfd.promise;
    }
}

exports.VngCloudConfig = new VngCloudConfig();
