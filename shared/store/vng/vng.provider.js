const q = require('q');
const { VngCloudConfig } = require('./config');
const { HTTPRequestProvider } = require('../../../shared/httpRequest/http.provider');
const { StoreConst } = require('./store.const');
const crypto = require('crypto');

class vngProvider {
    constructor() {}

    createFile(buffer, filePath, mimetype) {
        let dfd = q.defer();
        VngCloudConfig.getAccessToken()
            .then((res) => {
                const token = res.accessToken;
                const baseUrl = res.basUrl;
                const options = {
                    headers: {
                        'X-Auth-Token': token,
                        'Content-Type': mimetype,
                    },
                };
                const body = buffer;
                const url = baseUrl + '/' + StoreConst.vngStorageProject + '/' + filePath;
                HTTPRequestProvider.put(url, body, options)
                    .then((response) => {
                        dfd.resolve();
                    })
                    .catch((error) => {
                        console.log('🚀🚀 ~ VngCloudConfig ~ getToken ~ error:', error);
                        dfd.reject();
                    });
            })
            .catch((error) => {
                console.log('🚀🚀 ~ vngProvider ~ createFile ~ error:', error);
                dfd.reject();
            });

        return dfd.promise;
    }

    loadFile(filePath) {
        let dfd = q.defer();
        VngCloudConfig.getAccessToken()
            .then((res) => {
                VngCloudConfig.getSecretKey()
                    .then((secret) => {
                        const path = StoreConst.vngStorageProject + '/' + filePath;
                        const fullPath = `${res.basUrl.replace(/http.*\/v1/, '/v1')}/${path}`;
                        const expirationTime = Math.floor(Date.now() / 1000) + '3000';
                        const stringToSign = `GET\n${expirationTime}\n${fullPath}`;
                        const signature = crypto.createHmac('sha1', secret).update(stringToSign).digest('hex');
                        const tempUrl = `${res.basUrl}/${path}?temp_url_sig=${signature}&temp_url_expires=${expirationTime}`;
                        dfd.resolve(tempUrl);
                    })
                    .catch((error) => {
                        console.log('🚀🚀 ~ vngProvider ~ .then ~ error:', error);
                        dfd.reject();
                    });
            })
            .catch((error) => {
                dfd.reject();
            });

        return dfd.promise;
    }

    viewFile(filePath) {
        let dfd = q.defer();
        VngCloudConfig.getAccessToken()
            .then((res) => {
                VngCloudConfig.getSecretKey()
                    .then((secret) => {
                        const path = StoreConst.vngStorageProject + '/' + filePath;
                        const fullPath = `${res.basUrl.replace(/http.*\/v1/, '/v1')}/${path}`;
                        const expirationTime = Math.floor(Date.now() / 1000) + '3000';
                        const stringToSign = `GET\n${expirationTime}\n${fullPath}`;
                        const signature = crypto.createHmac('sha1', secret).update(stringToSign).digest('hex');
                        // const tempUrl = `${res.basUrl}/${path}?temp_url_sig=${signature}&temp_url_expires=${expirationTime}&inline`;
                        const tempUrl = `${res.basUrl}/${path}`;
                        dfd.resolve(tempUrl);
                    })
                    .catch((error) => {
                        console.log('🚀🚀 ~ vngProvider ~ .then ~ error:', error);
                        dfd.reject();
                    });
            })
            .catch((error) => {
                dfd.reject();
            });

        return dfd.promise;
    }

    // Update downloadBuffer in vngProvider
    downloadBuffer(filename) {
        const dfd = q.defer();
        VngCloudConfig.getAccessToken()
            .then(res => {
                // Encode filename để xử lý khoảng trắng và ký tự đặc biệt
                const encodedFilename = encodeURIComponent(filename);
                console.log("encodedFilename",encodedFilename);
                const url = `${res.basUrl}/${StoreConst.vngStorageProject}/${encodedFilename}`;
                
                const options = {
                    headers: {
                        'X-Auth-Token': res.accessToken,
                        'Accept': '*/*'
                    },
                    responseType: 'arraybuffer',
                    encoding: null
                };
                
                return HTTPRequestProvider.get(url, options);
            })
            .then(response => {
                dfd.resolve(response.data);
            })
            .catch(error => {
                console.log('Error downloading file buffer:', error);
                dfd.reject(error);
            });
    
        return dfd.promise;
    }
}

exports.vngProvider = new vngProvider();
