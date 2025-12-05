# Campus OLX - Student Marketplace

Campus OLX is a peer-to-peer marketplace application designed specifically for university students. It provides a trusted platform for students to buy and sell items such as textbooks, electronics, furniture, and clothing within their campus community.

## 🚀 Features

### 🔐 Authentication & Security
*   **University-Focused Signup**: Registration is restricted to university email addresses (`.edu`, `.ac.in`) or Gmail to ensure a student-centric community.
*   **OTP Verification**: Secure email verification using One-Time Passwords (OTP) via EmailJS.
*   **Google Login**: Quick and easy sign-in using Google accounts.
*   **Secure Auth**: Powered by Firebase Authentication.

### 📦 Marketplace Functionality
*   **Create Listings**: Students can easily post items for sale with details like title, price, category (Books, Electronics, Furniture, etc.), condition, description, and multiple images.
*   **Browse & Search**: A clean, responsive home feed with category filters and a search bar to find specific items.
*   **Listing Details**: Comprehensive product view with an image gallery, seller information, and item condition.
*   **My Listings**: Users can manage their active listings, mark items as sold, or delete them from their profile.
*   **Reviews & Ratings**: Buyers can leave star ratings and text reviews for sellers, helping to build trust within the community.

### 💬 Communication & Social
*   **Real-time Chat**: Integrated messaging system allowing buyers to contact sellers directly from the listing page.
*   **Notifications**: Real-time alerts for new messages and updates.
*   **Comments**: Public Q&A section on listings for general inquiries.
*   **User Profiles**: Customizable profiles showing user details, stats (Active Listings, Sold Items, Total Views), and reputation.

## 🛠️ Technology Stack

*   **Frontend**: HTML5, CSS3, JavaScript (ES6 Modules)
*   **Backend / Database**: Firebase Firestore (NoSQL Database)
*   **Authentication**: Firebase Authentication
*   **Storage**: Cloudinary (for listing images and profile photos)
*   **Email Service**: EmailJS (for OTP verification)
*   **Icons**: Remix Icon
*   **Fonts**: Google Fonts (Inter)

## 📂 Project Structure

```
c:\ParulOLX\
├── index.html              # Main application entry point (Single Page Application structure)
├── style.css               # Global styles and responsive design
├── js/
│   ├── app.js              # Main application logic, event listeners, and initialization
│   ├── auth.js             # Firebase Authentication logic (Login, Signup, Logout)
│   ├── db.js               # Firestore database interactions (CRUD operations)
│   ├── storage.js          # Firebase Storage logic (Image uploads)
│   ├── ui.js               # UI rendering and DOM manipulation functions
│   └── firebase-config.js  # Firebase configuration file
└── images/                 # Static assets
```

## ⚙️ Setup & Installation

1.  **Clone the repository** (or download the source code).
2.  **Firebase Configuration**:
    *   Create a project in the [Firebase Console](https://console.firebase.google.com/).
    *   Enable **Authentication** (Email/Password, Google).
    *   Enable **Firestore Database**.
    *   Enable **Firestore Database**.
    *   Copy your web app configuration and update `js/firebase-config.js`.
3.  **Cloudinary Configuration**:
    *   Create an account on [Cloudinary](https://cloudinary.com/).
    *   Create an **Upload Preset** (unsigned) in settings.
    *   Update the `CLOUD_NAME` and `UPLOAD_PRESET` constants in `js/storage.js`.
4.  **EmailJS Configuration**:
    *   Create an account on [EmailJS](https://www.emailjs.com/).
    *   Create a service and a template for sending OTPs.
    *   Update the `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, and Public Key in `index.html` and `js/app.js`.
5.  **Run Locally**:
    *   Since this project uses ES6 modules, you need to serve it using a local web server (opening `index.html` directly in the browser might cause CORS issues with modules).
    *   You can use extensions like "Live Server" in VS Code or run a simple Python server:
        ```bash
        python -m http.server 8000
        ```
    *   Open `http://localhost:8000` in your browser.

## 📱 Responsive Design

The application is fully responsive and optimized for both desktop and mobile devices, featuring a mobile-friendly navigation bar and touch-optimized layouts.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/YourFeature`).
3.  Commit your changes (`git commit -m 'Add some feature'`).
4.  Push to the branch (`git push origin feature/YourFeature`).
5.  Open a Pull Request.

## 🔮 Future Roadmap

*   **Cloud Functions**: Move sensitive logic (like rating aggregation and notifications) to Firebase Cloud Functions for better security and performance.
*   **Push Notifications**: Implement browser push notifications for real-time updates even when the app is closed.
*   **Advanced Filtering**: Add more granular filters for price ranges, location (if multi-campus), and item condition.
*   **Admin Dashboard**: A dedicated panel for moderators to review flagged listings and manage users.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
