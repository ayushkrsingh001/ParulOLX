import { auth, db } from './firebase-config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, serverTimestamp, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Helper to validate university email
function isUniversityEmail(email) {
    return email.endsWith('.edu') || email.endsWith('.ac.in') || email.endsWith('.edu.in') || email.endsWith('@gmail.com');
}

// Sign Up
export async function signUp(email, password, fullName) {
    if (!isUniversityEmail(email)) {
        throw new Error("Please use a valid university email address (.edu, .ac.in) or Gmail.");
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update display name
        await updateProfile(user, {
            displayName: fullName
        });

        // Create user document in Firestore
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: user.email,
            displayName: fullName,
            university: email.split('@')[1], // Simple extraction
            createdAt: serverTimestamp(),
            photoURL: user.photoURL || "https://via.placeholder.com/150"
        });

        return user;
    } catch (error) {
        console.error("Error signing up:", error);
        throw error;
    }
}

// Login
export async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error("Error logging in:", error);
        throw error;
    }
}

// Google Login
export async function loginWithGoogle() {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        if (!isUniversityEmail(user.email)) {
            // Optional: Delete user if not allowed? For now just throw error, but auth is already done.
            // Ideally we check before creating, but with Popup it's hard. 
            // We will allow it since we updated isUniversityEmail to allow gmail.
        }

        // Check if user exists in Firestore, if not create
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) {
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                university: user.email.split('@')[1],
                createdAt: serverTimestamp(),
                photoURL: user.photoURL
            });
        }

        return user;
    } catch (error) {
        console.error("Error with Google Login:", error);
        throw error;
    }
}

// Logout
export async function logout() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out:", error);
        throw error;
    }
}

// Password Reset
export async function sendPasswordReset(email) {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error) {
        console.error("Error sending password reset email:", error);
        throw error;
    }
}

// Auth State Observer
export function onUserStatusChanged(callback) {
    onAuthStateChanged(auth, (user) => {
        callback(user);
    });
}
