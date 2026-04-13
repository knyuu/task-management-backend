const {
    SECRET_KEY,
    JWT_SECRET
} = process.env

module.exports = {
    secretkey: SECRET_KEY,
    JWTOptions: {
        jwtSecret: JWT_SECRET,
        expiresIn: '15d', // Expired in 15 days
        longExpiresIn: '365d' // Refresh in 365 days
    }
};