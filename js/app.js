import { signUp, login, logout, onUserStatusChanged, loginWithGoogle, sendPasswordReset, sendVerificationEmail } from './auth.js';
import { createListing, getListings, getListingById, startChat, deleteListing, getUserListings, incrementListingViews, addComment, getComments, getUserChats, getChatMessages, sendMessage, subscribeToNotifications, markNotificationRead, markAllNotificationsRead, deleteChat, subscribeToChatMessages, getUserById, addReview, getReviews, deleteNotification, getChatById, deleteAllNotifications, updateUserProfile } from './db.js';
import { uploadImage } from './storage.js';
import { showView, renderListings, renderListingDetails, updateAuthUI, renderProfile, renderComments, renderChatList, renderChatMessages, renderNotifications, showChatWindow, showChatList, renderReviews } from './ui.js';

let currentUser = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log("App initializing...");
        setupEventListeners();
        console.log("Event listeners set up.");

        // Auth State Listener
        onUserStatusChanged((user) => {
            console.log("Auth state changed:", user ? "Logged in" : "Logged out");
            currentUser = user;
            updateAuthUI(user);
            if (user) {
                if (user.emailVerified) {
                    loadHome();
                    setupRealtimeListeners(user.uid);
                } else {
                    document.getElementById('verify-email-address').textContent = user.email;
                    showView('view-verify-email');
                }
            } else {
                showView('view-login');
            }
        });
    } catch (error) {
        console.error("App initialization failed:", error);
        alert(`App failed to load: ${error.name}: ${error.message}`);
    }
});

function setupEventListeners() {
    const safeAddEventListener = (id, event, handler) => {
        if (!handler) {
            console.error(`Handler for event '${event}' on ID '${id}' is undefined!`);
            return;
        }
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener(event, handler);
        } else {
            console.warn(`Element with ID '${id}' not found for event '${event}'`);
        }
    };

    // Navigation
    safeAddEventListener('nav-home', 'click', loadHome);
    safeAddEventListener('nav-sell', 'click', () => {
        if (currentUser) showView('view-create');
        else showView('view-login');
    });
    safeAddEventListener('nav-login', 'click', () => showView('view-login'));
    safeAddEventListener('nav-logout', 'click', handleLogout);
    safeAddEventListener('nav-profile', 'click', () => {
        if (currentUser) loadUserProfile(currentUser.uid);
    });
    safeAddEventListener('nav-chat', 'click', () => {
        if (currentUser) loadChat();
    });
    safeAddEventListener('nav-notifications', 'click', (e) => {
        e.preventDefault();
        const dropdown = document.getElementById('notification-dropdown');
        if (dropdown) dropdown.classList.toggle('hidden');
    });
    safeAddEventListener('mark-all-read', 'click', () => {
        if (currentUser) markAllNotificationsRead(currentUser.uid);
    });
    safeAddEventListener('delete-all-notifs', 'click', async () => {
        if (currentUser && confirm("Are you sure you want to delete all notifications?")) {
            await deleteAllNotifications(currentUser.uid);
        }
    });

    // Notification Delete & Click Delegation
    const notifList = document.getElementById('notification-list');
    if (notifList) {
        notifList.addEventListener('click', async (e) => {
            const btn = e.target.closest('.btn-delete-notif');
            if (btn && currentUser) {
                e.preventDefault();
                e.stopPropagation(); // Prevent triggering item click
                const id = btn.dataset.id;
                try {
                    await deleteNotification(currentUser.uid, id);
                } catch (error) {
                    console.error("Failed to delete notification", error);
                }
                return;
            }

            // Handle Notification Item Click
            const item = e.target.closest('.notification-item');
            if (item && currentUser) {
                const chatId = item.dataset.chatId;
                if (chatId) {
                    // Close dropdown
                    document.getElementById('notification-dropdown').classList.add('hidden');

                    // Mark as read
                    const notifId = item.dataset.id;
                    markNotificationRead(currentUser.uid, notifId);

                    // Redirect to Chat
                    try {
                        const chat = await getChatById(chatId);
                        if (chat) {
                            const partnerId = chat.participants.find(p => p !== currentUser.uid);
                            const partner = await getUserById(partnerId);
                            const partnerName = partner ? partner.displayName : "User";

                            await loadChat(); // Ensure chat view and list are loaded
                            loadChatMessages(chatId, partnerName);
                        }
                    } catch (err) {
                        console.error("Error redirecting to chat:", err);
                    }
                }
            }
        });
    }

    safeAddEventListener('profile-logout-btn', 'click', handleLogout);

    // Auth Forms
    safeAddEventListener('login-form', 'submit', handleLogin);
    safeAddEventListener('signup-form', 'submit', handleSignup);
    safeAddEventListener('show-signup', 'click', (e) => {
        e.preventDefault();
        document.getElementById('login-container').classList.add('hidden');
        document.getElementById('signup-container').classList.remove('hidden');
    });
    safeAddEventListener('show-login', 'click', (e) => {
        e.preventDefault();
        document.getElementById('signup-container').classList.add('hidden');
        document.getElementById('login-container').classList.remove('hidden');
    });

    // Forgot Password
    safeAddEventListener('show-forgot-password', 'click', (e) => {
        e.preventDefault();
        document.getElementById('login-container').classList.add('hidden');
        document.getElementById('forgot-password-container').classList.remove('hidden');
    });
    safeAddEventListener('back-to-login', 'click', (e) => {
        e.preventDefault();
        document.getElementById('forgot-password-container').classList.add('hidden');
        document.getElementById('login-container').classList.remove('hidden');
    });
    safeAddEventListener('forgot-password-form', 'submit', handleForgotPassword);

    // Email Verification
    safeAddEventListener('btn-check-verification', 'click', async () => {
        if (currentUser) {
            const btn = document.getElementById('btn-check-verification');
            const originalText = btn.textContent;
            btn.textContent = "Checking...";
            btn.disabled = true;
            try {
                await currentUser.reload();
                if (currentUser.emailVerified) {
                    alert("Email verified successfully!");
                    loadHome();
                    setupRealtimeListeners(currentUser.uid);
                } else {
                    alert("Email not yet verified. Please check your inbox or click Resend.");
                }
            } catch (error) {
                console.error("Error checking verification", error);
                alert("Error checking status. Please try again.");
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
            }
        }
    });

    safeAddEventListener('btn-resend-verification', 'click', async () => {
        if (currentUser) {
            const btn = document.getElementById('btn-resend-verification');
            btn.disabled = true;
            try {
                await sendVerificationEmail(currentUser);
                alert("Verification link resent to " + currentUser.email);
            } catch (error) {
                alert("Failed to resend link: " + error.message);
            } finally {
                btn.disabled = false;
            }
        }
    });

    safeAddEventListener('btn-back-to-login-verify', 'click', async (e) => {
        e.preventDefault();
        await handleLogout();
    });

    // Google Login
    safeAddEventListener('google-login-btn', 'click', handleGoogleLogin);
    safeAddEventListener('google-signup-btn', 'click', handleGoogleLogin);

    // Create Listing
    safeAddEventListener('create-listing-form', 'submit', handleCreateListing);

    // Global Event Delegation for dynamic elements
    document.body.addEventListener('click', (e) => {
        // Close notification dropdown if clicking outside
        const dropdown = document.getElementById('notification-dropdown');
        const navItem = document.getElementById('nav-notifications');
        if (dropdown && !dropdown.classList.contains('hidden')) {
            if (!dropdown.contains(e.target) && (!navItem || !navItem.contains(e.target))) {
                dropdown.classList.add('hidden');
            }
        }

        if (e.target.classList.contains('btn-details')) {
            const id = e.target.dataset.id;
            loadListingDetails(id);
        }
        if (e.target.id === 'btn-contact-seller') {
            const sellerId = e.target.dataset.sellerId;
            const listingId = e.target.dataset.listingId;
            handleContactSeller(listingId, sellerId);
        }
        if (e.target.closest('#btn-delete-listing')) {
            const id = e.target.closest('#btn-delete-listing').dataset.id;
            handleDeleteListing(id);
        }
    });
    // Filters
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            loadHome();
        });
    }
    const searchFilter = document.getElementById('search-filter');
    if (searchFilter) {
        searchFilter.addEventListener('input', () => {
            loadHome();
        });
    }

    // Mobile Category Scroll
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all
            categoryItems.forEach(i => i.classList.remove('active'));
            // Add active class to clicked
            item.classList.add('active');

            // Update hidden select
            const category = item.dataset.category;
            const select = document.getElementById('category-filter');
            if (select) {
                select.value = category;
                loadHome();
            }
        });
    });

    // Mobile Bottom Navigation
    safeAddEventListener('mobile-nav-home', 'click', (e) => {
        e.preventDefault();
        loadHome();
        updateMobileNavState('mobile-nav-home');
    });

    safeAddEventListener('mobile-nav-search', 'click', (e) => {
        e.preventDefault();
        loadHome();
        setTimeout(() => {
            const searchInput = document.getElementById('search-filter');
            if (searchInput) {
                searchInput.focus();
                searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
        updateMobileNavState('mobile-nav-search');
    });

    safeAddEventListener('mobile-nav-sell', 'click', (e) => {
        e.preventDefault();
        if (currentUser) {
            showView('view-create');
            updateMobileNavState('mobile-nav-sell');
        } else {
            showView('view-login');
        }
    });

    safeAddEventListener('mobile-nav-chat', 'click', (e) => {
        e.preventDefault();
        if (currentUser) {
            loadChat();
            updateMobileNavState('mobile-nav-chat');
        } else {
            showView('view-login');
        }
    });

    const btnBackToBrowse = document.getElementById('btn-back-to-browse');
    if (btnBackToBrowse) {
        const handleBack = (e) => {
            e.preventDefault();
            loadHome();
        };
        btnBackToBrowse.addEventListener('click', handleBack);
        btnBackToBrowse.addEventListener('touchstart', handleBack);
    }

    safeAddEventListener('mobile-nav-profile', 'click', (e) => {
        e.preventDefault();
        if (currentUser) {
            loadUserProfile(currentUser.uid);
            updateMobileNavState('mobile-nav-profile');
        } else {
            showView('view-login');
        }
    });

    // Delegated Event Listeners for Dynamic Content
    document.body.addEventListener('click', (e) => {
        // View Details
        const btnDetails = e.target.closest('.btn-details');
        if (btnDetails) {
            const id = btnDetails.dataset.id;
            loadListingDetails(id);
        }

        // View Seller Profile
        const sellerLink = e.target.closest('.seller-link');
        if (sellerLink) {
            const sellerId = sellerLink.dataset.sellerId;
            if (sellerId) {
                loadUserProfile(sellerId);
            }
        }
    });

    function updateMobileNavState(activeId) {
        document.querySelectorAll('.bottom-nav .nav-item').forEach(item => item.classList.remove('active'));
        const activeItem = document.getElementById(activeId);
        if (activeItem) activeItem.classList.add('active');

        // Handle center button active state separately if needed, or just highlight it
        if (activeId === 'mobile-nav-sell') {
            // Optional: Add specific style for active sell button
        }
    }

    // Comments
    safeAddEventListener('comment-form', 'submit', handleCommentSubmit);

    // Reviews
    // Since review form is dynamic (inside details), we use delegation or add listener after render.
    // Delegation is safer here since we have a global listener block.
    // But let's add it to the global delegation block for simplicity if possible, or just check target.
    // Actually, let's just add it to the global click/submit listener if we had one for forms.
    // We don't have a global form submit listener. Let's add one for 'review-form' specifically in delegation style
    // or just add it here assuming it might be present? No, it's dynamic.
    // Better approach: Add listener in `loadListingDetails` or use document-level delegation for submit.
    document.addEventListener('submit', (e) => {
        if (e.target && e.target.id === 'review-form') {
            handleReviewSubmit(e);
        }
    });

    // Edit Profile
    safeAddEventListener('btn-edit-profile', 'click', () => {
        if (!currentUser) return;
        document.getElementById('edit-name').value = currentUser.displayName || '';
        document.getElementById('edit-phone').value = currentUser.phoneNumber || '';
        document.getElementById('edit-course').value = currentUser.course || '';
        document.getElementById('edit-year').value = currentUser.year || '';
        document.getElementById('edit-division').value = currentUser.division || '';

        // Load current photo
        const previewImg = document.getElementById('edit-photo-preview');
        const previewIcon = document.getElementById('edit-photo-icon');
        if (currentUser.photoURL) {
            previewImg.src = currentUser.photoURL;
            previewImg.style.display = 'block';
            previewIcon.style.display = 'none';
        } else {
            previewImg.src = '';
            previewImg.style.display = 'none';
            previewIcon.style.display = 'block';
        }

        document.getElementById('edit-profile-modal').classList.remove('hidden');
    });

    safeAddEventListener('close-edit-profile', 'click', () => {
        document.getElementById('edit-profile-modal').classList.add('hidden');
    });

    // Handle Photo Preview
    safeAddEventListener('edit-photo', 'change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewImg = document.getElementById('edit-photo-preview');
                const previewIcon = document.getElementById('edit-photo-icon');
                previewImg.src = e.target.result;
                previewImg.style.display = 'block';
                previewIcon.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });

    safeAddEventListener('edit-profile-form', 'submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('edit-name').value;
        const phone = document.getElementById('edit-phone').value;
        const course = document.getElementById('edit-course').value;
        const year = document.getElementById('edit-year').value;
        const division = document.getElementById('edit-division').value;
        const photoFile = document.getElementById('edit-photo').files[0];

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;

        try {
            let photoURL = currentUser.photoURL;

            if (photoFile) {
                photoURL = await uploadImage(photoFile);
            }

            await updateUserProfile(currentUser.uid, {
                displayName: name,
                phoneNumber: phone,
                course: course,
                year: year,
                division: division,
                photoURL: photoURL
            });

            // Update local user object
            currentUser.displayName = name;
            currentUser.phoneNumber = phone;
            currentUser.course = course;
            currentUser.year = year;
            currentUser.division = division;
            currentUser.photoURL = photoURL;

            document.getElementById('edit-profile-modal').classList.add('hidden');
            loadUserProfile(currentUser.uid); // Refresh view
            alert("Profile updated successfully!");
        } catch (error) {
            alert("Failed to update profile: " + error.message);
        } finally {
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });

    // Star Rating Widget Interaction
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('star-item')) {
            const value = parseInt(e.target.dataset.value);
            const widget = e.target.closest('.star-rating-widget');
            const input = widget.querySelector('input[name="rating"]');

            // Set value
            input.value = value;

            // Update visual state
            updateStarWidget(widget, value);
        }
    });

    document.addEventListener('mouseover', (e) => {
        if (e.target.classList.contains('star-item')) {
            const value = parseInt(e.target.dataset.value);
            const widget = e.target.closest('.star-rating-widget');
            updateStarWidget(widget, value, true);
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.classList.contains('star-item')) {
            const widget = e.target.closest('.star-rating-widget');
            const input = widget.querySelector('input[name="rating"]');
            const currentValue = input.value ? parseInt(input.value) : 0;
            updateStarWidget(widget, currentValue);
        }
    });

    // Chat
    safeAddEventListener('chat-form', 'submit', handleSendMessage);
    safeAddEventListener('chat-list', 'click', (e) => {
        // Handle Delete
        if (e.target.closest('.btn-delete-chat')) {
            e.stopPropagation(); // Prevent opening the chat
            const chatId = e.target.closest('.btn-delete-chat').dataset.id;
            handleDeleteChat(chatId);
            return;
        }

        const item = e.target.closest('.chat-item');
        if (item) {
            const chatId = item.dataset.id;
            const partnerName = item.dataset.partnerName;
            loadChatMessages(chatId, partnerName);

            // Highlight active
            document.querySelectorAll('.chat-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        }
    });

    // Back button for mobile chat
    safeAddEventListener('btn-back-chat', 'click', (e) => {
        e.preventDefault();
        showChatList();
        // Optional: Clear active state if desired, but keeping it is fine
        // document.querySelectorAll('.chat-item').forEach(i => i.classList.remove('active'));
    });
}

async function handleDeleteChat(chatId) {
    if (!confirm("Are you sure you want to delete this conversation?")) return;
    try {
        await deleteChat(chatId);
        loadChat(); // Refresh list
        // If deleted chat was open, clear view
        if (currentChatId === chatId) {
            document.getElementById('chat-messages').innerHTML = '<div class="empty-chat-state"><i class="ri-message-2-line"></i><p>Select a conversation to start chatting</p></div>';
            document.getElementById('chat-header').classList.add('hidden');
            document.getElementById('chat-form').classList.add('hidden');
            currentChatId = null;
        }
    } catch (error) {
        console.error("Failed to delete chat", error);
        alert("Failed to delete chat");
    }
}
async function handleDeleteListing(id) {
    if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) return;

    try {
        await deleteListing(id);
        alert("Listing deleted successfully.");
        loadHome();
    } catch (error) {
        alert("Failed to delete listing: " + error.message);
    }
}

async function loadHome() {
    showView('view-home');
    try {
        const categoryFilter = document.getElementById('category-filter');
        const searchFilter = document.getElementById('search-filter');
        const filters = {};
        if (categoryFilter && categoryFilter.value) {
            filters.category = categoryFilter.value;
        }
        if (searchFilter && searchFilter.value) {
            filters.search = searchFilter.value;
        }

        const listings = await getListings(filters);
        renderListings(listings);
    } catch (error) {
        console.error("Failed to load listings", error);
    }
}

async function loadListingDetails(id) {
    try {
        const listing = await getListingById(id);
        renderListingDetails(listing, currentUser);

        // Load Comments
        const comments = await getComments(id);
        renderComments(comments);

        // Increment Views
        incrementListingViews(id);

        // Load Reviews
        const reviews = await getReviews(id);
        renderReviews(reviews);

        // Store current listing ID for comment submission
        document.getElementById('comment-form').dataset.listingId = id;

        showView('view-details');
    } catch (error) {
        console.error("Failed to load details", error);
    }
}

async function loadUserProfile(userId) {
    try {
        let user = currentUser;
        let isOwnProfile = true;

        if (userId && (!currentUser || userId !== currentUser.uid)) {
            isOwnProfile = false;
            user = await getUserById(userId);
            if (!user) {
                alert("User not found");
                return;
            }
        }

        const listings = await getUserListings(userId);
        renderProfile(user, listings, isOwnProfile);
        showView('view-profile');
    } catch (error) {
        console.error("Failed to load profile", error);
        alert("Failed to load profile");
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
        await login(email, password);
        // Auth listener will handle redirect
        // Auth listener will handle redirect
    } catch (error) {
        alert("Login failed: " + error.message);
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
        await signUp(email, password, name);
        // Auth listener will handle redirect to verification view
        // Auth listener will handle redirect
    } catch (error) {
        alert("Signup failed: " + error.message);
    }
}

async function handleForgotPassword(e) {
    e.preventDefault();
    const email = e.target.email.value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    try {
        await sendPasswordReset(email);
        alert("If an account exists with this email, a password reset link has been sent. Please check your inbox and spam folder.");
        e.target.reset();
        // Go back to login
        document.getElementById('forgot-password-container').classList.add('hidden');
        document.getElementById('login-container').classList.remove('hidden');
    } catch (error) {
        alert("Failed to send reset email: " + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

async function handleGoogleLogin() {
    try {
        await loginWithGoogle();
    } catch (error) {
        alert("Google Login failed: " + error.message);
    }
}

async function handleLogout() {
    await logout();
    showView('view-login');
}

async function handleCreateListing(e) {
    e.preventDefault();
    if (!currentUser) return;

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = "Posting... (Uploading Image)";

    const fileInput = form.image;
    let imageUrls = [];

    try {
        if (fileInput.files.length > 0) {
            // Upload all images
            for (let i = 0; i < fileInput.files.length; i++) {
                const url = await uploadImage(fileInput.files[i]);
                imageUrls.push(url);
            }
        }

        const listingData = {
            title: form.title.value,
            price: parseFloat(form.price.value),
            category: form.category.value,
            condition: form.condition.value,
            description: form.description.value,
            images: imageUrls
        };

        await createListing(listingData, currentUser);
        alert("Listing created successfully!");
        form.reset();
        loadHome();
    } catch (error) {
        console.error("Error creating listing", error);
        alert("Failed to create listing: " + error.message + "\n\nCheck if Firebase Storage Rules allow writes.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    }
}

async function handleContactSeller(listingId, sellerId) {
    if (!currentUser) {
        alert("Please login to contact seller");
        return;
    }
    if (currentUser.uid === sellerId) {
        alert("You cannot chat with yourself");
        return;
    }
    try {
        const { id: chatId, isNew } = await startChat(listingId, sellerId, currentUser.uid);

        if (isNew) {
            // Send automated initial messages
            const listing = await getListingById(listingId);
            if (listing) {
                // 1. Product Link/Details
                await sendMessage(chatId, currentUser.uid, `Product: ${listing.title} (₹${listing.price})`);
                // 2. Inquiry
                await sendMessage(chatId, currentUser.uid, `I want to know about ${listing.title} (${listing.category})`);
            }
        }

        loadChat();

        // Fetch seller details to get name
        let sellerName = "User";
        const seller = await getUserById(sellerId);
        if (seller) sellerName = seller.displayName;

        // Ideally select the new chat
        setTimeout(() => loadChatMessages(chatId, sellerName), 500);
    } catch (error) {
        console.error("Error starting chat", error);
    }
}

// --- New Features Logic ---

async function handleCommentSubmit(e) {
    e.preventDefault();
    if (!currentUser) {
        alert("Please login to comment");
        return;
    }
    const text = document.getElementById('comment-input').value;
    const listingId = e.target.dataset.listingId;

    try {
        await addComment(listingId, currentUser, text);
        document.getElementById('comment-input').value = '';
        // Reload comments
        const comments = await getComments(listingId);
        renderComments(comments);
    } catch (error) {
        alert("Failed to post comment");
    }
}

async function handleReviewSubmit(e) {
    e.preventDefault();
    if (!currentUser) {
        alert("Please login to review");
        return;
    }

    const form = e.target;
    const listingId = form.dataset.listingId;
    const rating = form.rating.value;
    const text = form.reviewText.value;

    if (!rating) {
        alert("Please select a star rating");
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    try {
        await addReview(listingId, currentUser, parseInt(rating), text);
        alert("Review submitted successfully!");
        form.reset();
        // Reload details to show new review and updated rating
        loadListingDetails(listingId);
    } catch (error) {
        console.error("Failed to submit review", error);
        alert("Failed to submit review");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Review";
    }
}

async function loadChat() {
    showView('view-chat');
    try {
        const chats = await getUserChats(currentUser.uid);

        // Fetch partner names
        const chatsWithNames = await Promise.all(chats.map(async (chat) => {
            const partnerId = chat.participants.find(p => p !== currentUser.uid);
            let partnerName = "User";
            let partnerPhotoURL = null;
            if (partnerId) {
                const partner = await getUserById(partnerId);
                if (partner) {
                    partnerName = partner.displayName;
                    partnerPhotoURL = partner.photoURL;
                }
            }
            return { ...chat, partnerName, partnerPhotoURL, partnerId };
        }));

        renderChatList(chatsWithNames, currentUser.uid);
    } catch (error) {
        console.error("Failed to load chats", error);
    }
}

let currentChatId = null;
let messageUnsubscribe = null;

async function loadChatMessages(chatId, partnerIdOrName) {
    currentChatId = chatId;
    document.getElementById('chat-header').classList.remove('hidden');
    document.getElementById('chat-form').classList.remove('hidden');

    // Show chat window (mobile toggle)
    showChatWindow();

    // Update Header Name
    // Update Header Name
    const nameEl = document.getElementById('chat-partner-name');
    const titleEl = document.getElementById('chat-item-title');

    // Reset title initially
    titleEl.textContent = "Loading...";

    // Fetch chat details to get listing ID
    try {
        const chat = await getChatById(chatId);
        if (chat && chat.listingId) {
            const listing = await getListingById(chat.listingId);
            // Set Product Title as Subtitle
            titleEl.textContent = listing ? listing.title : "Item Unavailable";
        } else {
            titleEl.textContent = "Item Inquiry";
        }
    } catch (err) {
        console.error("Error fetching chat details:", err);
        titleEl.textContent = "Chat";
    }

    if (typeof partnerIdOrName === 'string') {
        // It's a name passed from UI
        nameEl.textContent = partnerIdOrName;
    } else {
        // It's an ID (from contact seller), fetch name
        const user = await getUserById(partnerIdOrName);
        nameEl.textContent = user ? user.displayName : "User";
    }

    // Unsubscribe previous listener if any
    if (messageUnsubscribe) {
        messageUnsubscribe();
        messageUnsubscribe = null;
    }

    // Fetch partner photo URL
    let partnerPhotoURL = null;
    try {
        if (typeof partnerIdOrName !== 'string') {
            const user = await getUserById(partnerIdOrName);
            if (user) partnerPhotoURL = user.photoURL;
        } else {
            // Try to find partnerId from chat participants if we have chatId
            const chat = await getChatById(chatId);
            if (chat) {
                const partnerId = chat.participants.find(p => p !== currentUser.uid);
                if (partnerId) {
                    const user = await getUserById(partnerId);
                    if (user) partnerPhotoURL = user.photoURL;
                }
            }
        }
    } catch (e) {
        console.error("Error fetching partner photo:", e);
    }

    // Subscribe to real-time messages
    messageUnsubscribe = subscribeToChatMessages(chatId, (messages) => {
        renderChatMessages(messages, currentUser.uid, partnerPhotoURL, currentUser.photoURL);
    });

    // Highlight active chat in list (if list is loaded)
    document.querySelectorAll('.chat-item').forEach(item => {
        if (item.dataset.id === chatId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

async function handleSendMessage(e) {
    e.preventDefault();
    if (!currentChatId || !currentUser) return;

    const input = document.getElementById('message-input');
    const text = input.value;

    try {
        await sendMessage(currentChatId, currentUser.uid, text);
        input.value = '';
        // No need to manually refresh, listener will handle it
    } catch (error) {
        console.error("Failed to send message", error);
    }
}

function setupRealtimeListeners(userId) {
    subscribeToNotifications(userId, (notifications) => {
        renderNotifications(notifications);
    });
}

function updateStarWidget(widget, value, isHover = false) {
    const stars = widget.querySelectorAll('.star-item');
    stars.forEach(star => {
        const starValue = parseInt(star.dataset.value);
        if (starValue <= value) {
            star.classList.remove('ri-star-line');
            star.classList.add('ri-star-fill');
            star.classList.add(isHover ? 'hover' : 'active');
        } else {
            star.classList.remove('ri-star-fill');
            star.classList.add('ri-star-line');
            star.classList.remove('active', 'hover');
        }
    });
}
