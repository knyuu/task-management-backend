const { MongoDBCore } = require('./shared/mongodb/mongodb.core');
const MongoConst = require('./shared/mongodb/mongodb.const');
require('dotenv').config();

async function listUsers() {
    const dbname_prefix = "localhost_3005";
    const dbname = "";
    const db_full_name = "localhost_3005";

    console.log(`Searching for users in database: ${db_full_name}...`);
    try {
        const mongoConn = await MongoDBCore.getConnect({
            connectString: process.env.MONGODB_CONNECT_STRING || MongoConst.connectString,
            useNewUrlParser: true
        });

        const db = mongoConn.db(db_full_name);
        const users = await db.collection('user').find({}).limit(5).toArray();

        if (users.length === 0) {
            console.log("⚠️ No users found in this database!");
        } else {
            console.log(`✅ Found ${users.length} users:`);
            users.forEach(u => console.log(`- ${u.username} (Email: ${u.email}, Rules: ${JSON.stringify(u.rule)}, Lang: ${JSON.stringify(u.language)})`));
        }
        process.exit(0);
    } catch (err) {
        console.error("❌ Database access failed:", err);
        process.exit(1);
    }
}

listUsers();
