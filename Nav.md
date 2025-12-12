# Campus OLX - Project Documentation

## 1. Project Overview

**Campus OLX** is a specialized peer-to-peer marketplace application designed for university students to buy, sell, and exchange items within their campus community. Unlike general marketplaces, this platform ensures trust and relevance by restricting access to university students and focusing on categories like textbooks, electronics, and dorm essentials.

**Technology Stack:**
*   **Frontend:** HTML5, CSS3 (Vanilla), JavaScript (ES6+)
*   **Backend / Database:** Firebase (Firestore, Authentication)
*   **Storage:** Cloudinary (for image hosting)
*   **Email Service:** EmailJS (for OTP verification)
*   **Authentication:** Firebase Auth (Email/Password, Google Auth)

---

## 2. Feature List

Below is a detailed list of all features implemented in the project:

1.  **User Authentication**
    *   **Description:** Allows students to sign up using university emails or Gmail, verify their identity via OTP, and log in securely. Includes Google Sign-In and Password Reset.
    *   **Code Location:** `js/auth.js` (`signUp`: L20, `login`: L52), `js/app.js` (`handleSignup`: L720, `sendOTPEmail`: L13).

2.  **Product Listing Management**
    *   **Description:** Students can create new listings with photos, titles, prices, and categories. They can also view and delete their own active listings.
    *   **Code Location:** `js/db.js` (`createListing`: L20, `deleteListing`: L401), `js/ui.js` (`renderListings`: L21).

3.  **Search and Filtering**
    *   **Description:** Users can search for items by keywords and filter listings by categories (Books, Electronics, Furniture, etc.).
    *   **Code Location:** `js/db.js` (`getListings`: L37), `js/app.js` (Event Listeners: L243).

4.  **Real-Time Chat System**
    *   **Description:** Facilitates instant communication between buyers and sellers without sharing personal phone numbers. Supports image sharing in chat.
    *   **Code Location:** `js/db.js` (`startChat`: L226, `sendMessage`: L289), `js/ui.js` (Chat Rendering: L459-L570).

5.  **User Profiles**
    *   **Description:** Displays user information (verification status, course details) and their active listings. Users can edit their profile details.
    *   **Code Location:** `js/ui.js` (`renderProfile`: L302), `js/app.js` (`loadUserProfile`: L684).

6.  **Notifications**
    *   **Description:** Real-time alerts for new messages, connection requests, or system updates.
    *   **Code Location:** `js/db.js` (`subscribeToNotifications`: L163), `js/ui.js` (`renderNotifications`: L572).

7.  **Reviews and Ratings**
    *   **Description:** Buyers can rate sellers and leave reviews to build community trust.
    *   **Code Location:** `js/db.js` (`addReview`: L423, `getReviews`: L453), `js/ui.js` (`renderReviews`: L670).

8.  **Comments / Q&A**
    *   **Description:** Public discussion section on listing pages for asking common questions.
    *   **Code Location:** `js/db.js` (`addComment`: L128), `js/ui.js` (`renderComments`: L436).

---

## 3. Code Structure

The project is organized into clear directories to separate concerns:

*   **`c:\ParulOLX\` (Root)**
    *   `index.html`: The main entry point. Contains the HTML structure for all "views" (Home, Login, Profile, etc.) which are toggled dynamically.
    *   `style.css`: Main stylesheet containing global styles, variables, and responsive rules.

*   **`js/` (JavaScript Logic)**
    *   `app.js`: **Main Controller.** Handles application initialization, event listeners (clicks, form submissions), and coordinates between the UI and Database.
    *   `auth.js`: **Authentication Module.** Wraps Firebase Auth functions (Login, Signup, Logout, Google Auth).
    *   `db.js`: **Data Access Layer.** Contains all direct interactions with the Firestore database (CRUD operations for Listings, Chats, Users).
    *   `ui.js`: **View/Presentation Layer.** Contains functions to update the DOM (HTML), such as rendering the list of products or the chat window.
    *   `storage.js`: Handles image uploads to Cloudinary.
    *   `firebase-config.js`: Contains the Firebase SDK configuration and initialization.

*   **`css/` (Styles)**
    *   Contains organized CSS files (if split) or assets.

**File Interactions:**
1.  User interacts with **`index.html`** (clicks a button).
2.  **`app.js`** catches the event.
3.  **`app.js`** calls a function in **`auth.js`** or **`db.js`** to fetch/save data.
4.  Data is returned to **`app.js`**.
5.  **`app.js`** calls **`ui.js`** to update the screen with the new data.

---

## 4. Feature-to-Code Mapping Table

| Feature | Description | File Location | Important Code Functions (Line No.) |
|---------|-------------|---------------|---------------------------|
| **Sign Up & OTP** | Register new user & verify email | `js/app.js`, `js/auth.js` | `handleSignup` (app.js:720), `sendOTPEmail` (app.js:13), `signUp` (auth.js:20) |
| **Login** | User authentication | `js/auth.js` | `login` (auth.js:52), `loginWithGoogle` (auth.js:63) |
| **Create Listing** | Form to add new item | `js/db.js`, `js/storage.js` | `createListing` (db.js:20), `uploadImage` (storage.js:4) |
| **View Home/Feed** | Main page with product grid | `js/db.js`, `js/ui.js` | `getListings` (db.js:37), `renderListings` (ui.js:21) |
| **Search/Filter** | Filter items by cat/text | `js/db.js` | `getListings` (db.js:37) |
| **Item Details** | Full view of a product | `js/ui.js`, `js/db.js` | `loadListingDetails` (app.js:659), `getListingById` (db.js:96) |
| **Chat** | Messaging system | `js/db.js` | `startChat` (db.js:226), `sendMessage` (db.js:289), `subscribeToChatMessages` (db.js:388) |
| **Profile** | User details & items | `js/ui.js`, `js/db.js` | `renderProfile` (ui.js:302), `getUserListings` (db.js:78) |
| **Edit Profile** | Update user info/photo | `js/app.js`, `js/db.js` | `updateUserProfile` (db.js:264) |
| **Reviews** | Rating system | `js/db.js` | `addReview` (db.js:423), `getReviews` (db.js:453) |
| **Notifications** | Alerts for actions | `js/db.js` | `subscribeToNotifications` (db.js:163) |

---

## 5. Workflow Explanation

**1. Data Flow (General):**
*   **User Action:** A user fills a form (e.g., "Sell Item") and clicks Submit.
*   **Controller (`app.js`):** Validates the input and calls the backend function.
*   **Backend (`db.js` / `storage.js`):**
    *   If there's an image, `storage.js` uploads it to Cloudinary and returns a URL.
    *   `db.js` takes the data + image URL and saves it to a Firebase Firestore collection (`listings`).
*   **Update:** Firestore triggers a success response. `app.js` then calls `loadHome()`, which fetches fresh data and uses `ui.js` to redraw the page.

**2. Database Integration (Firebase):**
*   **Real-time:** The app uses `onSnapshot` (in `db.js`) for Chats and Notifications. This means when a user receives a message, the database "pushes" the update to the app instantly without refreshing.
*   **Structure:** Data is stored in collections: `users`, `listings`, `chats`, `notifications`.

**3. API Calls:**
*   **Images:** Direct REST API call to Cloudinary in `storage.js`.
*   **Email:** Direct API call to EmailJS in `app.js` for sending verification codes.

---

## 6. Screenshots Section

*(Placeholders for project screenshots)*

### Login Page Screenshot
![Login Page Screenshot](placeholder_login.png)

### Dashboard / Home Page Screenshot
![Home Page Screenshot](placeholder_home.png)

### Add Product Page Screenshot
![Add Product Screenshot](placeholder_add_product.png)

### Chat Section Screenshot
![Chat Screenshot](placeholder_chat.png)

### Profile Page Screenshot
![Profile Screenshot](placeholder_profile.png)

---

## 7. Conclusion

**Campus OLX** provides a highly useful digital infrastructure for university campuses, solving the problem of inefficient resource sharing. By creating a closed, trust-based network, it encourages sustainability and community interaction.

**Scalability & Future Enhancements:**
*   **Scalability:** Built on Firebase, the backend scales automatically to handle thousands of users.
*   **Future Enhancements:**
    *   **AI Recommendations:** Suggesting books based on the student's course.
    *   **Mobile App:** Wrapping the web app into a native Android/iOS app.
    *   **Payment Gateway:** Integrating UPI for secure, in-app payments.
