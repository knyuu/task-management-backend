const zaloOaConst = require('./zalo-oa.const');
const axios = require('axios');
const qs = require('qs');
const { MongoDBProvider } = require('@shared/mongodb/db.provider');

class ZaloOaProvider {
    constructor() {
        this.baseURL = zaloOaConst.domain || 'http://127.0.0.1:8080';
        this.appId = zaloOaConst.appId;
        this.secretKey = zaloOaConst.secretKey;
        this.domainAuth = zaloOaConst.domainAuth;
        this.domainBusiness = zaloOaConst.domainBusiness;
        this.statusInvalidToken = [-216, -124];
    }

    async getCurrentRefeshToken(dbname_prefix) {
        const filter = {
            master_key: 'refresh_token_zalo_oa'
        }
        const refresh_token = await MongoDBProvider.load_onManagement(dbname_prefix, 'directory', filter);
        if (refresh_token.length > 0) {
            return refresh_token[0].value;
        }
        return null;
    }

    async updateRefreshToken(dbname_prefix, refresh_token) {
        const filter = {
            master_key: 'refresh_token_zalo_oa'
        }
        const update = {
            $set: {
                value: refresh_token
            }
        }
        return MongoDBProvider.update_onManagement(dbname_prefix, 'directory', 'system', filter, update);
    }

    async updateToken(dbname_prefix, token, expires_in) {
        const dateExpired = new Date();
        dateExpired.setSeconds(dateExpired.getSeconds() + expires_in);
        const filter = {
            master_key: 'access_token_zalo_oa'
        }
        const update = {
            $set: {
                value: token,
                expired: dateExpired.getTime()
            }
        }
        return MongoDBProvider.update_onManagement(dbname_prefix, 'directory', 'system', filter, update);
    }

    async getAccessTokenFromDB(dbname_prefix) {
        const filter = {
            master_key: 'access_token_zalo_oa'
        }
        const token_data = await MongoDBProvider.load_onManagement(dbname_prefix, 'directory', filter);
        if (token_data.length > 0) {
            return {
                token: token_data[0].value,
                expired: token_data[0].expired
            };
        }
        return null;
    }

    async getToken(dbname_prefix) {
        try {
            // Get current refresh token from DB
            const currentRefreshToken = await this.getCurrentRefeshToken(dbname_prefix);
            const params = qs.stringify({
                refresh_token: currentRefreshToken,
                app_id: this.appId,
                grant_type: 'refresh_token'
            });
    
            const response = await axios.post('https://oauth.zaloapp.com/v4/oa/access_token', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'secret_key': this.secretKey
                }
            });
            if(response.data.error && response.data.error !== 0){
                throw response.data;
            }
            
            // Update refresh token if provided in response
            if (response.data.refresh_token) {
                await this.updateRefreshToken(dbname_prefix, response.data.refresh_token);
            }
            
            // Update access token
            await this.updateToken(dbname_prefix, response.data.access_token, response.data.expires_in);
    
            return response.data;
        } catch (error) {
            console.log('Error getting access token:', error);
            throw error;
        }
    }

    async _getValidAccessToken(dbname_prefix) {
        let accessToken = null;
        let needNewToken = false;
        
        const tokenData = await this.getAccessTokenFromDB(dbname_prefix);
        if (tokenData && tokenData.token && tokenData.expired) {
            const now = new Date();
            const expiryDate = new Date(tokenData.expired);
            
            // Check if token is expired or will expire in less than 1 hour
            const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
            
            if (expiryDate > oneHourFromNow) {
                // Token is still valid for more than 1 hour
                accessToken = tokenData.token;
            } else {
                // Token is about to expire or has expired
                needNewToken = true;
            }
        } else {
            // No token in DB
            needNewToken = true;
        }
        // Get new token if needed
        if (needNewToken) {
            const tokenResponse = await this.getToken(dbname_prefix);
            accessToken = tokenResponse.access_token;
        }
        
        return accessToken;
    }

    async _makeRequestWithTokenRetry(dbname_prefix, requestFn) {
        try {
            let accessToken = await this._getValidAccessToken(dbname_prefix);
            if(!accessToken){
                throw new Error('Không thể lấy access token');
            }
            try {
                const response = await requestFn(accessToken);
                console.log({response})
                if(response.error !== 0){
                    throw response;
                }
                return response;
            } catch (error) {
                const status = error.data ? error.data.error : error.error; 
                console.log({'debug: ': status})
                if (this.statusInvalidToken.includes(status)) {
                    console.log('Token expired during request, refreshing token and retrying...');
                    
                    // Get new token with fresh refresh
                    const newTokenResponse = await this.getToken(dbname_prefix);
                    accessToken = newTokenResponse.access_token;
                    
                    // Try again with new token
                    const retryResponse = await requestFn(accessToken);
                    return retryResponse;
                }
                
                throw error;
            }
        } catch (error) {
            console.log('Error in request flow:', error);
            throw error;
        }
    }

    async sendMessage(dbname_prefix, recipient, message) {
        return this._makeRequestWithTokenRetry(dbname_prefix, async (accessToken) => {
            const response = await axios.post(`${this.baseURL}/v3.0/oa/message/cs`, {
                recipient,
                message
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'access_token': accessToken
                }
            });
            
            console.log('Message sent successfully:', response.data);
            return response.data;
        });
    }

    /**
     * Gửi tin nhắn mẫu qua Zalo OA
     * @param {string} dbname_prefix - Tiền tố tên database 
     * @param {Object} payload - Dữ liệu tin nhắn mẫu
     * @param {string} payload.phone - Số điện thoại người nhận (định dạng 84xxxxxxxxx)
     * @param {string} payload.template_id - ID mẫu tin nhắn
     * @param {Object} payload.template_data - Dữ liệu động cho mẫu tin nhắn
     * @param {string} payload.tracking_id - ID theo dõi tin nhắn
     * @returns {Promise<Object>} Kết quả gửi tin nhắn từ Zalo OA
     */
    async sendTemplateMessage(dbname_prefix, payload) {
        return this._makeRequestWithTokenRetry(dbname_prefix, async (accessToken) => {
            const response = await axios.post(`${this.domainBusiness}/message/template`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'access_token': accessToken
                }
            });

            if(response.data.error){
                throw response;
            }
            
            console.log('Template message sent successfully:', response.data);
            return response.data;
        });
    }
}

exports.ZaloOaProvider = new ZaloOaProvider(); 