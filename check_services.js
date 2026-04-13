const { MongoDBCore } = require('./shared/mongodb/mongodb.core');
const MongoConst = require('./shared/mongodb/mongodb.const');
const { RedisCore } = require('./shared/redis/redis.core');
const RedisConst = require('./shared/redis/redis.const');
require('dotenv').config();

async function checkConnections() {
    console.log("Checking MongoDB...");
    try {
        const mongoConn = await MongoDBCore.getConnect({
            connectString: process.env.MONGODB_CONNECT_STRING || MongoConst.connectString,
            useNewUrlParser: true
        });
        console.log("✅ MongoDB Connected Successfully");
    } catch (err) {
        console.error("❌ MongoDB Connection Failed:", err);
    }

    console.log("\nChecking Redis...");
    try {
        const redisClient = RedisCore.getConnect({
            host: process.env.REDIS_HOST || RedisConst.host,
            port: process.env.REDIS_PORT || RedisConst.port,
            password: process.env.REDIS_PASSWORD || RedisConst.password
        });

        // Need to wait a bit or use a command to check connection
        redisClient.ping((err, res) => {
            if (err) {
                console.error("❌ Redis Ping Failed:", err);
            } else {
                console.log("✅ Redis Ping Successful:", res);
            }
            process.exit(0);
        });
    } catch (err) {
        console.error("❌ Redis Connection Failed:", err);
        process.exit(1);
    }
}

checkConnections();
