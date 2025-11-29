// UI Helper Functions

export function showView(viewId) {
    // Hide notification dropdown if open
    const notifDropdown = document.getElementById('notification-dropdown');
    if (notifDropdown) notifDropdown.classList.add('hidden');

    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.add('hidden');
        view.classList.remove('active');
    });
    // Show specific view
    const view = document.getElementById(viewId);
    if (view) {
        view.classList.remove('hidden');
        view.classList.add('active');
    }
}

export function renderListings(listings, containerId = 'listings-container') {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (listings.length === 0) {
        container.innerHTML = '<p class="no-listings">No listings found.</p>';
        return;
    }

    listings.forEach(listing => {
        const card = document.createElement('div');
        card.className = 'item-card';

        let imageContent;
        if (listing.images && listing.images.length > 0) {
            imageContent = `<div class="card-image" style="background-image: url('${listing.images[0]}')">
                                ${listing.status === 'sold' ? '<div class="sold-badge">SOLD</div>' : ''}
                            </div>`;
        } else {
            imageContent = `<div class="card-image">
                                <div class="no-image-placeholder">
                                    <div class="placeholder-content">
                                        <i class="ri-image-line"></i>
                                        <span>No Preview</span>
                                    </div>
                                </div>
                                ${listing.status === 'sold' ? '<div class="sold-badge">SOLD</div>' : ''}
                            </div>`;
        }

        card.innerHTML = `
            ${imageContent}
            <div class="card-content">
                <div class="condition-badge">${listing.condition}</div>
                <h3>${listing.title}</h3>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <p class="price">₹${listing.price}</p>
                    ${generateStarRatingHTML(listing.averageRating, listing.reviewCount)}
                </div>
                <div class="card-actions">
                    <button class="btn-details wide" data-id="${listing.id}">View Details</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

export function renderListingDetails(listing, currentUser, containerId = 'listing-details-content') {
    const container = document.getElementById(containerId);
    if (!listing) return;

    const isOwner = currentUser && currentUser.uid === listing.sellerId;

    let imagesHtml = '';
    if (listing.images && listing.images.length > 0) {
        imagesHtml = `<div class="details-gallery" style="position: relative;">
            ${listing.images.map(img => `<img src="${img}" alt="${listing.title}">`).join('')}
            <button class="click-to-view-btn" id="btn-full-photo-details">
                <i class="ri-fullscreen-line"></i> Click to view
            </button>
        </div>`;
    } else {
        imagesHtml = `<div class="details-gallery">
            <div class="no-image-placeholder large">
                <i class="ri-image-line"></i>
                <span>No Images</span>
            </div>
        </div>`;
    }

    container.innerHTML = `
        ${imagesHtml}
        <div class="details-header">
            <div>
                <h2>${listing.title}</h2>
                <div class="details-meta">
                    <span><i class="ri-price-tag-3-line"></i> ${listing.category}</span> • 
                    <span><i class="ri-time-line"></i> Posted on ${listing.createdAt ? new Date(listing.createdAt.seconds * 1000).toLocaleDateString() : 'Recently'}</span>
                </div>
                
                <div style="margin: 1rem 0;">
                    ${generateStarRatingHTML(listing.averageRating, listing.reviewCount, true)}
                </div>

                <h3>Details</h3>
                <p><strong>Condition:</strong> <span class="condition-badge">${listing.condition}</span></p>
                <p>${listing.description}</p>
            </div>
            
            <div class="seller-box">
                <h3>Seller Information</h3>
                <p class="seller-link" data-seller-id="${listing.sellerId}" style="cursor: pointer; color: var(--primary-color); font-weight: 600; transition: color 0.2s;">
                    <i class="ri-user-smile-line"></i> ${listing.sellerName}
                </p>
                <p><i class="ri-building-2-line"></i> ${listing.university || 'University Student'}</p>
                ${isOwner ?
            `<button id="btn-delete-listing" class="btn-alt wide" style="border-color: var(--danger-color); color: var(--danger-color); margin-top: 1rem;" data-id="${listing.id}">
                        <i class="ri-delete-bin-line"></i> Delete Item
                    </button>` :
            `<button id="btn-contact-seller" class="btn-main wide" data-seller-id="${listing.sellerId}" data-listing-id="${listing.id}">
                        <i class="ri-chat-1-line"></i> Contact Seller
                    </button>`
        }
            </div>
        </div>

        <!-- Reviews Section -->
        <div class="reviews-section" style="margin-top: 3rem; border-top: 1px solid var(--border-color); padding-top: 2rem;">
            <h3>Reviews & Ratings</h3>
            
            <div class="reviews-summary-container">
                <div class="rating-big-display">
                    <div class="rating-number">${listing.averageRating ? listing.averageRating.toFixed(1) : '0.0'}</div>
                    ${generateStarRatingHTML(listing.averageRating, listing.reviewCount)}
                </div>
                <div id="rating-distribution" class="rating-distribution">
                    <!-- Distribution bars injected here -->
                </div>
            </div>

            ${!isOwner ? `
            <div class="review-form-box">
                <h4>Write a Review</h4>
                <form id="review-form" data-listing-id="${listing.id}">
                    <div class="star-rating-widget">
                        <i class="ri-star-line star-item" data-value="1"></i>
                        <i class="ri-star-line star-item" data-value="2"></i>
                        <i class="ri-star-line star-item" data-value="3"></i>
                        <i class="ri-star-line star-item" data-value="4"></i>
                        <i class="ri-star-line star-item" data-value="5"></i>
                        <input type="hidden" name="rating" id="rating-value" required>
                    </div>
                    <div class="input-group">
                        <textarea name="reviewText" rows="3" placeholder="Share your experience..." required></textarea>
                    </div>
                    <button type="submit" class="btn-main">Submit Review</button>
                </form>
            </div>
            ` : ''}

            <div id="reviews-list" class="reviews-container">
                <!-- Reviews injected here -->
            </div>
        </div>
    `;

    // Full Photo Logic
    const btnFullPhoto = document.getElementById('btn-full-photo-details');
    if (btnFullPhoto && listing.images && listing.images.length > 0) {
        btnFullPhoto.onclick = () => {
            const fullModal = document.getElementById('full-photo-modal');
            const fullImg = document.getElementById('full-photo-img');
            fullImg.src = listing.images[0];
            fullModal.classList.remove('hidden');

            // Close Full Photo
            const closeFull = document.getElementById('close-full-photo');
            closeFull.onclick = () => {
                fullModal.classList.add('hidden');
            };

            fullModal.onclick = (e) => {
                if (e.target === fullModal) {
                    fullModal.classList.add('hidden');
                }
            };
        };
    }
}

export function updateAuthUI(user) {
    const authLinks = document.getElementById('auth-links');
    const userLinks = document.getElementById('user-links');

    if (user) {
        authLinks.classList.add('hidden');
        userLinks.classList.remove('hidden');
        document.getElementById('user-name-display').textContent = user.displayName || 'Student';
    } else {
        authLinks.classList.remove('hidden');
        userLinks.classList.add('hidden');
    }
}

export function renderProfile(user, listings, isOwnProfile = true) {
    // Update Header
    const avatarContainer = document.querySelector('.profile-avatar');
    if (user.photoURL) {
        avatarContainer.innerHTML = `<img src="${user.photoURL}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    } else {
        avatarContainer.innerHTML = `<i class="ri-user-line"></i>`;
    }

    document.getElementById('profile-name').textContent = user.displayName || 'Student';
    document.getElementById('profile-email').innerHTML = `<i class="ri-mail-line"></i> ${user.email}`;

    let details = [];
    if (user.course) details.push(user.course);
    if (user.year) details.push(user.year);
    if (user.division) details.push(`Div: ${user.division}`);

    const detailsText = details.length > 0 ? details.join(' | ') : 'University Student';
    document.getElementById('profile-university').innerHTML = `<i class="ri-building-2-line"></i> ${detailsText}`;

    // Calculate Stats
    const activeCount = listings.filter(l => l.status === 'active').length;
    const soldCount = listings.filter(l => l.status === 'sold').length;

    document.getElementById('stat-active').textContent = activeCount;
    document.getElementById('stat-sold').textContent = soldCount;

    // Calculate Total Views (Only show for own profile)
    const viewsEl = document.getElementById('stat-views');
    const viewsCard = viewsEl ? viewsEl.closest('.stat-card') : null;

    if (isOwnProfile) {
        const totalViews = listings.reduce((acc, curr) => acc + (curr.views || 0), 0);
        if (viewsEl) viewsEl.textContent = totalViews;
        if (viewsCard) viewsCard.style.display = 'block';

        // Show Edit Profile Button
        const editBtn = document.getElementById('btn-edit-profile');
        if (editBtn) {
            editBtn.classList.remove('hidden');
            editBtn.style.display = 'inline-flex'; // Force display
        }
    } else {
        if (viewsCard) viewsCard.style.display = 'none';

        // Hide Edit Profile Button
        const editBtn = document.getElementById('btn-edit-profile');
        if (editBtn) {
            editBtn.classList.add('hidden');
            editBtn.style.display = 'none';
        }
    }

    // Display Phone Number if available
    const phoneDisplay = document.getElementById('profile-phone');
    if (user.phoneNumber) {
        if (!phoneDisplay) {
            const phoneP = document.createElement('p');
            phoneP.id = 'profile-phone';
            phoneP.innerHTML = `<i class="ri-phone-line"></i> ${user.phoneNumber}`;
            document.querySelector('.profile-text').appendChild(phoneP);
        } else {
            phoneDisplay.innerHTML = `<i class="ri-phone-line"></i> ${user.phoneNumber}`;
        }
    } else if (phoneDisplay) {
        phoneDisplay.remove();
    }

    // Hide/Show Logout Button
    const logoutBtn = document.getElementById('profile-logout-btn');
    if (logoutBtn) {
        if (isOwnProfile) {
            logoutBtn.style.removeProperty('display');
        } else {
            logoutBtn.style.setProperty('display', 'none', 'important');
        }
    }

    // Update Listings Heading
    const listingsHeading = document.getElementById('profile-listings-heading');
    if (listingsHeading) {
        listingsHeading.textContent = isOwnProfile ? 'My Listings' : `${user.displayName || 'User'}'s Listings`;
    }

    // Render Listings
    const container = document.getElementById('profile-listings-container');
    container.innerHTML = '';

    if (listings.length === 0) {
        container.innerHTML = '<p class="no-listings">No listings found.</p>';
        return;
    }

    listings.forEach(listing => {
        const card = document.createElement('div');
        card.className = 'item-card';

        let imageContent;
        if (listing.images && listing.images.length > 0) {
            imageContent = `<div class="card-image" style="background-image: url('${listing.images[0]}')">
                                ${listing.status === 'sold' ? '<div class="sold-badge">SOLD</div>' : ''}
                            </div>`;
        } else {
            imageContent = `<div class="card-image">
                                <div class="no-image-placeholder">
                                    <div class="placeholder-content">
                                        <i class="ri-image-line"></i>
                                        <span>No Preview</span>
                                    </div>
                                </div>
                                ${listing.status === 'sold' ? '<div class="sold-badge">SOLD</div>' : ''}
                            </div>`;
        }

        card.innerHTML = `
            ${imageContent}
            <div class="card-content">
                <div class="condition-badge">${listing.condition}</div>
                <h3>${listing.title}</h3>
                <p class="price">₹${listing.price}</p>
                <div class="card-actions">
                    <button class="btn-details wide" data-id="${listing.id}">View Details</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

export function renderComments(comments) {
    const container = document.getElementById('comments-list');
    container.innerHTML = '';

    if (comments.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); font-style: italic;">No comments yet. Be the first to ask!</p>';
        return;
    }

    comments.forEach(comment => {
        const div = document.createElement('div');
        div.className = 'comment-item';
        div.innerHTML = `
            <div class="comment-header">
                <span class="comment-author">${comment.userName || 'User'}</span>
                <span class="comment-date">${comment.createdAt ? new Date(comment.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}</span>
            </div>
            <div class="comment-text">${comment.text}</div>
        `;
        container.appendChild(div);
    });
}

export function showChatWindow() {
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
        chatContainer.classList.add('mobile-chat-active');
    }
}

export function showChatList() {
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
        chatContainer.classList.remove('mobile-chat-active');
    }
}

export function renderChatList(chats, currentUserId, activeChatId = null) {
    const container = document.getElementById('chat-list');
    container.innerHTML = '';

    if (chats.length === 0) {
        container.innerHTML = '<p style="padding: 1rem; color: var(--text-muted);">No conversations yet.</p>';
        return;
    }

    chats.forEach(chat => {
        const div = document.createElement('div');
        div.className = `chat-item ${chat.id === activeChatId ? 'active' : ''}`;
        div.dataset.id = chat.id;
        // Determine partner ID (simple logic assuming 2 participants)
        const partnerId = chat.participants.find(p => p !== currentUserId);
        // Use partnerName if available (fetched in app.js), else fallback
        const partnerName = chat.partnerName || "User";
        const initial = partnerName.charAt(0).toUpperCase();
        div.dataset.partnerName = partnerName;

        let avatarHtml;
        if (chat.partnerPhotoURL) {
            avatarHtml = `<img src="${chat.partnerPhotoURL}" class="chat-avatar-placeholder" style="object-fit: cover;">`;
        } else {
            avatarHtml = `<div class="chat-avatar-placeholder">${initial}</div>`;
        }

        div.innerHTML = `
            ${avatarHtml}
            <div style="flex-grow: 1;">
                <h4>${partnerName}</h4>
                <p>${chat.lastMessage || 'No messages'}</p>
            </div>
            <button class="btn-delete-chat" data-id="${chat.id}" title="Delete Chat">
                <i class="ri-delete-bin-line"></i>
            </button>
        `;
        container.appendChild(div);
    });
}

export function renderChatMessages(messages, currentUserId, partnerPhotoURL = null, currentUserPhotoURL = null) {
    const container = document.getElementById('chat-messages');
    container.innerHTML = '';

    if (messages.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); margin-top: 2rem;">Start the conversation!</p>';
        return;
    }

    messages.forEach(msg => {
        const isSent = msg.senderId === currentUserId;
        const row = document.createElement('div');
        row.className = `message-row ${isSent ? 'sent' : 'received'}`;

        const photoURL = isSent ? currentUserPhotoURL : partnerPhotoURL;

        if (photoURL) {
            const img = document.createElement('img');
            img.src = photoURL;
            img.className = 'chat-avatar';
            row.appendChild(img);
        } else {
            const placeholder = document.createElement('div');
            placeholder.className = 'chat-avatar placeholder';
            placeholder.innerHTML = '<i class="ri-user-line"></i>';
            row.appendChild(placeholder);
        }

        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${isSent ? 'sent' : 'received'}`;
        msgDiv.textContent = msg.text;

        row.appendChild(msgDiv);
        container.appendChild(row);
    });

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

export function renderNotifications(notifications) {
    const container = document.getElementById('notification-list');
    const badge = document.getElementById('notification-badge');
    container.innerHTML = '';

    // Toggle Delete All Button
    const deleteAllBtn = document.getElementById('delete-all-notifs');
    if (deleteAllBtn) {
        if (notifications.length > 5) {
            deleteAllBtn.style.display = 'block';
        } else {
            deleteAllBtn.style.display = 'none';
        }
    }

    const unreadCount = notifications.filter(n => !n.read).length;
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }

    // Chat Badge Logic
    const chatBadge = document.getElementById('chat-badge');
    if (chatBadge) {
        const unreadMessages = notifications.filter(n => !n.read && n.type === 'message').length;
        if (unreadMessages > 0) {
            chatBadge.classList.remove('hidden');
        } else {
            chatBadge.classList.add('hidden');
        }
    }

    if (notifications.length === 0) {
        container.innerHTML = '<p class="no-notifs">No new notifications</p>';
        return;
    }

    const initialDisplayCount = 5;
    const notificationsToShow = notifications.slice(0, initialDisplayCount);
    const remainingNotifications = notifications.slice(initialDisplayCount);

    const createNotificationElement = (notif) => {
        const div = document.createElement('div');
        div.className = `notification-item ${!notif.read ? 'unread' : ''}`;
        div.dataset.id = notif.id;
        if (notif.chatId) {
            div.dataset.chatId = notif.chatId;
        }

        // Determine icon based on type (if available) or message content
        let iconClass = 'ri-notification-3-line';
        if (notif.type === 'message') iconClass = 'ri-message-3-line';
        else if (notif.type === 'system') iconClass = 'ri-information-line';
        else if (notif.message.toLowerCase().includes('welcome')) iconClass = 'ri-sparkling-line';
        else if (notif.message.toLowerCase().includes('sold')) iconClass = 'ri-money-dollar-circle-line';

        const timeString = notif.createdAt ? new Date(notif.createdAt.seconds * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now';

        div.innerHTML = `
            <div class="notif-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="notif-content">
                <div class="notif-message">${notif.message}</div>
                <div class="notif-time">
                    <i class="ri-time-line" style="font-size: 0.8em;"></i> ${timeString}
                </div>
            </div>
            <button class="btn-delete-notif" data-id="${notif.id}" title="Dismiss">
                <i class="ri-close-line"></i>
            </button>
        `;
        return div;
    };

    notificationsToShow.forEach(notif => {
        container.appendChild(createNotificationElement(notif));
    });

    if (remainingNotifications.length > 0) {
        const showMoreBtn = document.createElement('button');
        showMoreBtn.className = 'btn-text wide';
        showMoreBtn.style.marginTop = '0.5rem';
        showMoreBtn.style.fontSize = '0.9rem';
        showMoreBtn.textContent = `Show ${remainingNotifications.length} more`;

        showMoreBtn.onclick = () => {
            showMoreBtn.remove();
            remainingNotifications.forEach(notif => {
                container.appendChild(createNotificationElement(notif));
            });
        };
        container.appendChild(showMoreBtn);
    }
}

export function renderReviews(reviews) {
    const container = document.getElementById('reviews-list');
    const distributionContainer = document.getElementById('rating-distribution');
    container.innerHTML = '';

    // Calculate Distribution
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => counts[r.rating] = (counts[r.rating] || 0) + 1);
    const total = reviews.length;

    if (distributionContainer) {
        distributionContainer.innerHTML = Object.keys(counts).sort((a, b) => b - a).map(star => {
            const count = counts[star];
            const percent = total > 0 ? (count / total) * 100 : 0;
            return `
                <div class="dist-row">
                    <span class="dist-star">${star} ★</span>
                    <div class="dist-bar-bg">
                        <div class="dist-bar-fill" style="width: ${percent}%"></div>
                    </div>
                    <span class="dist-count">${count}</span>
                </div>
            `;
        }).join('');
    }

    if (reviews.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted);">No reviews yet.</p>';
        return;
    }

    reviews.forEach(review => {
        const div = document.createElement('div');
        div.className = 'review-item';
        const initial = review.userName ? review.userName.charAt(0).toUpperCase() : 'U';
        const colorClass = getAvatarColorClass(initial);

        div.innerHTML = `
            <div class="review-header">
                <div class="review-user-info">
                    <div class="user-avatar ${colorClass}">${initial}</div>
                    <div>
                        <span class="review-author">${review.userName || 'User'}</span>
                        <div class="rating-stars small">
                            ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                        </div>
                    </div>
                </div>
                <span class="review-date">${review.createdAt ? new Date(review.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}</span>
            </div>
            <div class="review-text">${review.text}</div>
        `;
        container.appendChild(div);
    });
}

function getAvatarColorClass(char) {
    const colors = ['bg-blue', 'bg-green', 'bg-purple', 'bg-orange', 'bg-pink'];
    const index = char.charCodeAt(0) % colors.length;
    return colors[index];
}

function generateStarRatingHTML(rating = 0, count = 0, isLarge = false) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let starsHTML = '';
    for (let i = 0; i < fullStars; i++) starsHTML += '<i class="ri-star-fill"></i>';
    if (hasHalfStar) starsHTML += '<i class="ri-star-half-line"></i>';
    for (let i = 0; i < emptyStars; i++) starsHTML += '<i class="ri-star-line"></i>';

    return `
        <div class="rating-stars ${isLarge ? 'large' : ''}">
            ${starsHTML}
            <span class="rating-count">(${count})</span>
        </div>
    `;
}
