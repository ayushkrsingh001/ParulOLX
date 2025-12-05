// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/setup#available-libraries
const firebaseConfig = {
    apiKey: "AIzaSyBdEKHYMblxuxfYPBvACAMEHnSR-m2fF-U",
    authDomain: "parulolx.firebaseapp.com",
    projectId: "parulolx",
    storageBucket: "parulolx.firebasestorage.app",
    messagingSenderId: "392039663484",
    appId: "1:392039663484:web:15700a2a18cf42e3f986f9",
    measurementId: "G-SKKWCX5X9J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
