const { MongoDBProvider } = require('./shared/mongodb/db.provider');
require('dotenv').config();

async function checkInvitations() {
    try {
        const invitations = await MongoDBProvider.load_onManagement('', 'invitation', {}, 5, 0);
        console.log('Recent Invitations:', JSON.stringify(invitations, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error checking invitations:', err);
        process.exit(1);
    }
}

checkInvitations();
