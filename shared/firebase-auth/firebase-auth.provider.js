const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

class FirebaseAuthProvider {
    constructor() {
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;

        try {
            // Option 1: Load from environment variables (preferred for security)
            if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
                const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId: process.env.FIREBASE_PROJECT_ID,
                        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                        privateKey: privateKey,
                    })
                });

                this.initialized = true;
                console.log('✅ Firebase Admin SDK initialized from environment variables');
                return;
            }

            // Option 2: Fallback to JSON file
            const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');

            if (fs.existsSync(serviceAccountPath)) {
                const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });

                this.initialized = true;
                console.log('✅ Firebase Admin SDK initialized from service account file');
            } else {
                console.warn('⚠️ Firebase credentials not found. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env');
                console.warn('⚠️ Google Login via Firebase will not work.');
            }
        } catch (error) {
            console.error('❌ Failed to initialize Firebase Admin SDK:', error);
        }
    }

    /**
     * Verify Firebase ID Token
     * @param {string} idToken 
     * @returns {Promise<Object>} Decoded token
     */
    async verifyIdToken(idToken) {
        if (!this.initialized) {
            throw new Error('Firebase Admin SDK is not initialized. Please provide Firebase credentials in .env');
        }

        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            return decodedToken;
        } catch (error) {
            console.error('Error verifying Firebase ID token:', error);
            throw error;
        }
    }
}

exports.FirebaseAuthProvider = new FirebaseAuthProvider();
