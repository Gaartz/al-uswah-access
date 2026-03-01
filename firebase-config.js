/* ============================================
   Firebase Configuration — Al Uswah Access
   ============================================ */

const firebaseConfig = {
    apiKey: "AIzaSyDO0qMiwxG6mvKY-asnzPJaM3mHbTCRMqc",
    authDomain: "al-uswah-access-4c93f.firebaseapp.com",
    projectId: "al-uswah-access-4c93f",
    storageBucket: "al-uswah-access-4c93f.firebasestorage.app",
    messagingSenderId: "382230487653",
    appId: "1:382230487653:web:78d98daf9ecb5eeadb9c8c",
    measurementId: "G-CKTH5GBCCB"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

// Set persistence to LOCAL so user stays logged in
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

console.log('[Firebase] Initialized — project:', firebaseConfig.projectId);
