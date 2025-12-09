# Campus OLX – A Student-to-Student Marketplace
## Project Documentation

---

### 1. Project Overview
**Campus OLX** is a hyper-local, peer-to-peer marketplace designed specifically for university students. It addresses the lack of a trusted, dedicated platform for students to buy, sell, and exchange academic resources, electronics, and dorm essentials within their campus ecosystem.

**Key Objectives:**
*   **Trust & Safety:** Restrict access to verified students (University Email / Verified Signups) to ensure safe transactions.
*   **Convenience:** Enable quick, on-campus exchanges without the hassle of shipping or long-distance travel.
*   **Sustainability:** Promote the reuse of textbooks, furniture, and electronics, reducing waste.
*   **Community:** Foster a helpful community where juniors can buy affordable resources from seniors.

---

### 2. Features List

#### **User Authentication & Security**
*   **University Email / Gmail Signup:** Users can sign up using their university email or standard Gmail accounts.
*   **OTP Verification:** A robust email verification system using EmailJS sends a One-Time Password (OTP) to validate the user's email address before account creation.
*   **Google Login:** Seamless one-click login integration using Google Auth.
*   **Password Reset:** "Forgot Password" functionality to recover accounts via email.

#### **Marketplace & Listings**
*   **Create Listings:** Students can easily post items with details like Title, Price, Description, Category, Condition (New, Like New, Good, Fair), and upload multiple images.
*   **Categories:** Organized browsing with specific categories: Books, Electronics, Furniture, Clothing, and Other.
*   **Smart Search & Filtering:** Real-time search bar and category dropdowns to quickly find relevant items (e.g., "Calculus Textbook").
*   **Dynamic Image Hosting:** Product images are uploaded to Cloudinary for optimized delivery.
*   **View Counters:** Each listing tracks and displays the number of times it has been viewed.

#### **Communication & Social**
*   **Real-time Chat:** Integrated chat system allowing buyers and sellers to negotiate instantly without sharing personal phone numbers.
*   **Image Sharing:** Users can send photos directly within the chat interface.
*   **Notifications:** Real-time alerts for new messages, ensuring no opportunity is missed.
*   **Public Q&A:** A "Discussion" section on every product page for public queries and answers.
*   **Reviews & Ratings:** Buyers can rate sellers (1-5 stars) and leave text reviews, building a reputation system.

#### **User Profile & Dashboard**
*   **Profile Management:** Users can edit their personal details (Name, Course, Year, Division) and update their profile picture.
*   **My Listings:** A dashboard to manage (view/delete) active listings.
*   **Statistics:** Visual stats showing total Active Listings, Sold Items, and Total Views.

---

### 3. Technology Stack

*   **Frontend:**
    *   **HTML5:** Semantic structure for accessibility and SEO.
    *   **CSS3 (Vanilla):** Custom responsive design, CSS Variables for theming, and modern Flexbox/Grid layouts.
    *   **JavaScript (ES6+):** Modular architecture for application logic.
*   **Backend & Database:**
    *   **Firebase Authentication:** Handles user identity, signup, login, and Google Auth.
    *   **Firebase Firestore:** NoSQL database for real-time data synchronization (Users, Listings, Chats, Notifications).
*   **Storage & Services:**
    *   **Cloudinary:** Cloud-based image management service for storing and optimizing user uploaded photos.
    *   **EmailJS:** Client-side email service for sending OTP verification emails.
*   **Libraries:**
    *   **Remix Icons:** For consistent, high-quality UI icons.
    *   **Google Fonts (Inter):** For modern, readable typography.

---

### 4. System Architecture

The application follows a **Serverless Single Page Application (SPA)** architecture.

1.  **Client-Side (Views & Logic):**
    *   The `index.html` acts as the single entry point, containing container `div`s for different views (`view-home`, `view-details`, etc.).
    *   `app.js` serves as the main controller, handling routing (view switching), event listeners, and high-level logic.
    *   `ui.js` manages DOM updates, rendering templates for listings, chats, and profiles.

2.  **Data Access Layer (DAL):**
    *   `db.js` encapsulates all direct interactions with Firebase Firestore. It exports functions like `getListings`, `createListing`, `sendMessage`, etc., keeping the UI logic clean.
    *   `auth.js` handles all Firebase Authentication methods.

3.  **External Services:**
    *   **Images:** When a user uploads a photo, `storage.js` sends it to Cloudinary’s REST API. The returned secure URL is then stored in Firestore.
    *   **Emails:** `emailjs.send()` is called directly from `app.js` to dispatch OTP emails via the EmailJS infrastructure.

---

### 5. UI/UX Design

*   **Color Theme:**
    *   **Primary:** Indigo (`#4f46e5`) to Purple gradient – represents creativity and trustworthiness.
    *   **Header:** Sky Blue (`#00BFFF`) to Dodger Blue (`#1E90FF`) gradient – gives a fresh, campus-friendly vibe.
    *   **Background:** Light Slate (`#f1f5f9`) with floating animated blobs for a dynamic, modern feel.
*   **Typography:** Uses **Inter**, a sans-serif font designed for computer screens, ensuring high readability at all sizes.
*   **Layout:**
    *   **Responsive:** Adapts seamlessly from desktop to mobile.
    *   **Mobile-First:** Features a bottom navigation bar on mobile devices for easy thumb access, while using a top navigation bar on desktop.
*   **Visual Effects:**
    *   **Glassmorphism:** Semi-transparent backgrounds on cards and modals (`rgba(255, 255, 255, 0.9)`).
    *   **Micro-interactions:** Hover effects, smooth transitions (fade-in, slide-up), and pulsing notification badges.

---

### 6. Pages & Screens Documentation

1.  **Login / Signup / Forgot Password:**
    *   Clean, centered cards with toggleable forms.
    *   Input validation and Google Login options.
    *   OTP Modal overlay for email verification.
2.  **Home (Browse):**
    *   **Hero Section:** Welcoming headline.
    *   **Filters:** Search bar and Category dropdown (Scrollable icons on mobile).
    *   **Grid:** Responsive grid showing product cards with image, price, title, and location.
3.  **Product Details:**
    *   Large image display.
    *   Seller information card with "Contact" button.
    *   "Discussion" section for public comments.
    *   "Reviews" section showing seller reputation.
4.  **Create Listing Form:**
    *   Step-by-step inputs for item details.
    *   Image file picker.
5.  **Chat Interface:**
    *   **List View:** Shows ongoing conversations sorted by recent activity.
    *   **Window View:** Bubble-style messaging, image attachment button, and sender name header.
6.  **User Profile:**
    *   Header with Avatar, Name, and University info.
    *   Edit Profile button opening a modal.
    *   "My Listings" grid to manage personal posts.
7.  **Notifications:**
    *   Dropdown (Desktop) / List (Mobile) showing new messages and alerts.

---

### 7. Database Structure (Firestore)

#### **Collection: `users`**
*   `uid` (string): Unique User ID.
*   `displayName` (string): Full Name.
*   `email` (string): University email.
*   `university` (string): Extracted domain (e.g., 'university.edu').
*   `photoURL` (string): Profile picture URL.
*   `course`, `year`, `division`, `phoneNumber` (strings): Optional profile details.

#### **Collection: `listings`**
*   `title` (string): Item title.
*   `price` (number): Item cost.
*   `category` (string): e.g., 'Books'.
*   `condition` (string): e.g., 'New'.
*   `description` (string): Detailed text.
*   `sellerId` (string): Link to `users` collection.
*   `status` (string): 'active' or 'sold'.
*   `views` (number): Count of page visits.
*   `images` (array): List of image URLs.
*   `createdAt` (timestamp).
*   **Sub-collection: `comments`**
    *   `userId`, `userName`, `text`, `createdAt`.
*   **Sub-collection: `reviews`**
    *   `userId`, `userName`, `rating`, `text`, `createdAt`.

#### **Collection: `chats`**
*   `participants` (array): [uid1, uid2].
*   `listingId` (string): Related item ID.
*   `lastMessage` (string): Preview text.
*   `lastMessageTime` (timestamp).
*   **Sub-collection: `messages`**
    *   `senderId` (string).
    *   `text` (string).
    *   `imageUrl` (string): Optional.
    *   `timestamp`.

#### **Collection: `users/{uid}/notifications`**
*   `type` (string): 'message', 'system'.
*   `message` (string).
*   `read` (boolean).
*   `chatId` (string): Link to chat.

---

### 8. API / Backend Operations Explanation

*   **Saving Data:** Uses `addDoc` or `setDoc` from Firestore SDK. When a user posts a listing, the image is first `POST`ed to Cloudinary, and the returned URL is combined with the form data and sent to Firestore.
*   **Retrieving Data:**
    *   **Listings:** Uses `getDocs` with composite queries (`where` status is active, `orderBy` date).
    *   **Real-time Updates:** Uses `onSnapshot` for Chat messages and Notifications to instantly reflect changes without page reloads.
*   **Security:**
    *   Authentication is managed by Firebase Auth tokens.
    *   File uploads are restricted to image types.
    *   Email verification ensures the validity of the user base.

---

### 9. Flowcharts (Text-Based)

**1. Posting a Product Flow:**
User clicks "Sell" -> Checks Auth (Redirect if Guest) -> Fills Form -> Selects Image -> Clicks "Post" -> App uploads Image to Cloudinary -> App saves Listing Data with ImgURL to Firestore -> Success Alert -> Redirect to Home.

**2. Chat Flow:**
Buyer views Listing -> Clicks "Message Seller" -> App checks if Chat Object exists?
*   **Yes:** Opens existing Chat Window.
*   **No:** Creates new Chat Document in Firestore -> Opens Chat Window.
    User types message -> Clicks Send -> App adds doc to `messages` sub-collection -> App updates `chats` doc (lastMessage) -> App triggers Notification for Recipient -> UI updates via `onSnapshot`.

**3. User Authentication Flow:**
User enters Email/Pass -> Clicks Signup -> App generates OTP -> Sends via EmailJS -> Shows OTP Modal -> User enters OTP -> App verifies -> Calls `createUserWithEmailAndPassword` -> Creates User Profile in Firestore -> Logs User In.

---

### 10. Use Cases

1.  **Selling a Textbook:**
    *   **Actor:** Senior Student.
    *   **Action:** Uploads photos of a used "Engineering Physics" book, sets condition to "Good", price to ₹300.
    *   **Outcome:** Listing appears in "Books" category. Lower year students search "Physics" and find it.

2.  **Buying Furniture:**
    *   **Actor:** New Dorm Student.
    *   **Action:** Browses "Furniture", finds a Study Table. Clicks "Message Seller" to ask about dimensions.
    *   **Outcome:** Chat initiated. They agree to meet at "Hostel Block A". Transaction completes offline.

3.  **Reputation Building:**
    *   **Actor:** Buyer.
    *   **Action:** After buying the table, visits the listing page again and leaves a 5-star review "Great table, honest seller."
    *   **Outcome:** Seller's trust score increases.

---

### 11. Installation & Setup Guide

**Prerequisites:** Node.js (optional, for tools), a Modern Browser, VS Code.

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your-repo/campus-olx.git
    cd campus-olx
    ```

2.  **Configure Firebase:**
    *   Create a project at [console.firebase.google.com](https://console.firebase.google.com).
    *   Enable **Authentication** (Email/Pass, Google).
    *   Enable **Firestore Database**.
    *   Copy the config object.
    *   Paste it into `js/firebase-config.js`.

3.  **Configure EmailJS:**
    *   Sign up at [emailjs.com](https://www.emailjs.com/).
    *   Create a Service and an Email Template.
    *   Update `EMAILJS_SERVICE_ID` and `EMAILJS_TEMPLATE_ID` in `js/app.js`.
    *   Update the Public Key in `index.html` (`emailjs.init`).

4.  **Configure Cloudinary:**
    *   Sign up at [cloudinary.com](https://cloudinary.com/).
    *   Get your Cloud Name and create an Unsigned Upload Preset.
    *   Update `CLOUD_NAME` and `UPLOAD_PRESET` in `js/storage.js`.

5.  **Run the Project:**
    *   Since this uses ES Modules, you must run it via a local server.
    *   **VS Code:** Install "Live Server" extension, right-click `index.html`, and select "Open with Live Server".

6.  **Deploy:**
    *   Can be deployed easily to **Firebase Hosting** (`firebase init`, `firebase deploy`) or **Vercel/Netlify**.

---

### 12. Future Improvements

*   **AI Recommendations:** Suggest items based on user's course/branch (e.g., recommend Medical books to medical students).
*   **On-Campus Meetup Integration:** Selecting safe "Meetup Spots" (like Library, Cafeteria) directly in the chat.
*   **Push Notifications:** Service Workers to send push notifications even when the tab is closed.
*   **Admin Panel:** A dedicated dashboard for moderation to remove inappropriate listings or ban users.
*   **PWA Support:** Make the site installable as a mobile app.

---

### 13. Conclusion

**Campus OLX** effectively bridges the gap between digital convenience and physical campus life. By fusing a modern, responsive design with robust cloud technologies, it provides a safe, efficient, and user-friendly platform that empowers students to manage their resources sustainably. It is not just a marketplace; it is a tool for student community building.
