import { db } from './firebase-config.js';
import {
    collection,
    addDoc,
    getDocs,
    doc,
    getDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    updateDoc,
    deleteDoc,
    increment,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- Listings ---

export async function createListing(listingData, user) {
    try {
        const docRef = await addDoc(collection(db, "listings"), {
            ...listingData,
            sellerId: user.uid,
            sellerName: user.displayName,
            university: user.email.split('@')[1], // Enforce same university visibility logic if needed
            status: 'active',
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating listing:", error);
        throw error;
    }
}

export async function getListings(filters = {}) {
    try {
        let q;
        // If filtering by category, we might run into index issues with orderBy("createdAt").
        // So we'll fetch by category (and status) then sort client-side.
        if (filters.category) {
            q = query(collection(db, "listings"), where("status", "==", "active"), where("category", "==", filters.category));
        } else {
            q = query(collection(db, "listings"), where("status", "==", "active"), orderBy("createdAt", "desc"));
        }

        const querySnapshot = await getDocs(q);
        const listings = [];
        querySnapshot.forEach((doc) => {
            listings.push({ id: doc.id, ...doc.data() });
        });

        // Client-side sort if we removed the orderBy from query (or just always to be safe)
        if (filters.category) {
            listings.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        }

        return listings;
    } catch (error) {
        console.error("Error getting listings:", error);
        throw error;
    }
}

export async function getUserListings(userId) {
    try {
        // Removed orderBy temporarily to avoid needing a composite index immediately
        const q = query(collection(db, "listings"), where("sellerId", "==", userId));
        const querySnapshot = await getDocs(q);
        const listings = [];
        querySnapshot.forEach((doc) => {
            listings.push({ id: doc.id, ...doc.data() });
        });
        // Sort client-side
        listings.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        return listings;
    } catch (error) {
        console.error("Error getting user listings:", error);
        throw error;
    }
}

export async function getListingById(id) {
    try {
        const docRef = doc(db, "listings", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting listing:", error);
        throw error;
    }


}

export async function incrementListingViews(id) {
    try {
        const docRef = doc(db, "listings", id);
        await updateDoc(docRef, {
            views: increment(1)
        });
    } catch (error) {
        console.error("Error incrementing views:", error);
        // Don't throw, just log
    }
}

// --- Comments ---

export async function addComment(listingId, user, text) {
    try {
        await addDoc(collection(db, "listings", listingId, "comments"), {
            userId: user.uid,
            userName: user.displayName,
            text: text,
            createdAt: serverTimestamp()
        });

        // Notify seller (if not self)
        // This would ideally be done via Cloud Functions, but we can try client-side trigger
        // For now, we'll just add the comment.
    } catch (error) {
        console.error("Error adding comment:", error);
        throw error;
    }
}

export async function getComments(listingId) {
    try {
        const q = query(collection(db, "listings", listingId, "comments"), orderBy("createdAt", "asc"));
        const querySnapshot = await getDocs(q);
        const comments = [];
        querySnapshot.forEach((doc) => {
            comments.push({ id: doc.id, ...doc.data() });
        });
        return comments;
    } catch (error) {
        console.error("Error getting comments:", error);
        throw error;
    }
}

// --- Notifications ---

export function subscribeToNotifications(userId, callback) {
    const q = query(collection(db, "users", userId, "notifications"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        const notifications = [];
        snapshot.forEach((doc) => {
            notifications.push({ id: doc.id, ...doc.data() });
        });
        callback(notifications);
    });
}

export async function markNotificationRead(userId, notificationId) {
    try {
        const docRef = doc(db, "users", userId, "notifications", notificationId);
        await updateDoc(docRef, {
            read: true
        });
    } catch (error) {
        console.error("Error marking notification read:", error);
    }
}

export async function markAllNotificationsRead(userId) {
    try {
        const q = query(collection(db, "users", userId, "notifications"), where("read", "==", false));
        const snapshot = await getDocs(q);
        const batch = []; // Firestore batch would be better but let's do simple loop for now or Promise.all
        const promises = [];
        snapshot.forEach((doc) => {
            promises.push(updateDoc(doc.ref, { read: true }));
        });
        await Promise.all(promises);
    } catch (error) {
        console.error("Error marking all read:", error);
    }
}

// --- Chat ---

export async function startChat(listingId, sellerId, currentUserId) {
    try {
        // Check if chat already exists
        const q = query(
            collection(db, "chats"),
            where("listingId", "==", listingId),
            where("participants", "array-contains", currentUserId)
        );
        const querySnapshot = await getDocs(q);

        let existingChatId = null;
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.participants.includes(sellerId)) {
                existingChatId = doc.id;
            }
        });

        if (existingChatId) {
            return { id: existingChatId, isNew: false };
        }

        // Create new chat
        const chatData = {
            participants: [currentUserId, sellerId],
            listingId: listingId,
            lastMessage: "",
            lastMessageTime: serverTimestamp(),
            createdAt: serverTimestamp()
        };
        const docRef = await addDoc(collection(db, "chats"), chatData);
        return { id: docRef.id, isNew: true };
    } catch (error) {
        console.error("Error starting chat:", error);
        throw error;
    }
}

export async function getUserById(userId) {
    try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { uid: docSnap.id, ...docSnap.data() };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting user:", error);
        return null;
    }
}

export async function sendMessage(chatId, senderId, text) {
    try {
        // Add message to subcollection
        await addDoc(collection(db, "chats", chatId, "messages"), {
            senderId: senderId,
            text: text,
            timestamp: serverTimestamp()
        });

        // Update chat summary
        const chatRef = doc(db, "chats", chatId);
        await updateDoc(chatRef, {
            lastMessage: text,
            lastMessageTime: serverTimestamp()
        });

        // Get chat participants to notify recipient
        const chatSnap = await getDoc(chatRef);
        if (chatSnap.exists()) {
            const data = chatSnap.data();
            const recipientId = data.participants.find(p => p !== senderId);

            if (recipientId) {
                await addDoc(collection(db, "users", recipientId, "notifications"), {
                    type: 'message',
                    message: `New message: ${text.substring(0, 30)}${text.length > 30 ? '...' : ''}`,
                    chatId: chatId,
                    senderId: senderId,
                    read: false,
                    createdAt: serverTimestamp()
                });
            }
        }
    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
}

export async function getUserChats(userId) {
    try {
        const q = query(collection(db, "chats"), where("participants", "array-contains", userId));
        const querySnapshot = await getDocs(q);
        const chats = [];
        querySnapshot.forEach((doc) => {
            chats.push({ id: doc.id, ...doc.data() });
        });
        // Client-side sort
        chats.sort((a, b) => (b.lastMessageTime?.seconds || 0) - (a.lastMessageTime?.seconds || 0));
        return chats;
    } catch (error) {
        console.error("Error getting chats:", error);
        throw error;
    }
}

export async function getChatMessages(chatId) {
    try {
        const q = query(collection(db, "chats", chatId, "messages"), orderBy("timestamp", "asc"));
        const querySnapshot = await getDocs(q);
        const messages = [];
        querySnapshot.forEach((doc) => {
            messages.push({ id: doc.id, ...doc.data() });
        });
        return messages;
    } catch (error) {
        console.error("Error getting messages:", error);
        throw error;
    }
}

export function subscribeToChatMessages(chatId, callback) {
    const q = query(collection(db, "chats", chatId, "messages"));
    return onSnapshot(q, (snapshot) => {
        const messages = [];
        snapshot.forEach((doc) => {
            messages.push({ id: doc.id, ...doc.data() });
        });
        // Client-side sort
        messages.sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0));
        callback(messages);
    });
}

export async function deleteListing(id) {
    try {
        await deleteDoc(doc(db, "listings", id));
    } catch (error) {
        console.error("Error deleting listing:", error);
        throw error;
    }
}

export async function deleteChat(chatId) {
    try {
        await deleteDoc(doc(db, "chats", chatId));
        // Optionally delete messages subcollection (requires cloud function or client-side loop)
        // For now, just deleting the chat document hides it from the list.
    } catch (error) {
        console.error("Error deleting chat:", error);
        throw error;
    }
}

// --- Reviews ---

export async function addReview(listingId, user, rating, text) {
    try {
        // 1. Add review to subcollection
        await addDoc(collection(db, "listings", listingId, "reviews"), {
            userId: user.uid,
            userName: user.displayName,
            rating: rating,
            text: text,
            createdAt: serverTimestamp()
        });

        // 2. Update Listing Aggregates (Average Rating & Count)
        // Note: In a real app, this should be a Cloud Function or a Transaction to be safe.
        // Here we will fetch all reviews and recalculate.
        const reviews = await getReviews(listingId);
        const totalRating = reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0);
        const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

        const listingRef = doc(db, "listings", listingId);
        await updateDoc(listingRef, {
            averageRating: averageRating,
            reviewCount: reviews.length
        });

    } catch (error) {
        console.error("Error adding review:", error);
        throw error;
    }
}

export async function getReviews(listingId) {
    try {
        const q = query(collection(db, "listings", listingId, "reviews"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const reviews = [];
        querySnapshot.forEach((doc) => {
            reviews.push({ id: doc.id, ...doc.data() });
        });
        return reviews;
    } catch (error) {
        console.error("Error getting reviews:", error);
        throw error;
    }
}
