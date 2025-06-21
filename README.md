# Picky App with Authentication

A React application with Firebase Authentication and Firestore integration, featuring a login/signup system and a random item picker.

## Features

- 🔐 **Authentication System**
  - Login with email/password
  - Signup with comprehensive user profile
  - Protected routes
  - User session management

- 📝 **Signup Form Fields**
  - First name and last name
  - Email address
  - Password with confirmation
  - Region selection
  - Profile image upload

- 🎲 **Picky App**
  - Add multiple items to a list
  - Randomly pick one item
  - Remove items from the list
  - Clean, responsive UI

- 🛡️ **Security & Validation**
  - Form validation with Yup schemas
  - React Hook Form integration
  - Firebase Authentication
  - Firestore data storage
  - Firebase Storage for images

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Forms**: React Hook Form, Yup validation
- **Authentication**: Firebase Authentication
- **Database**: Firestore
- **Storage**: Firebase Storage
- **Routing**: React Router DOM

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password sign-in method
3. Create a Firestore database
4. Enable Firebase Storage
5. Get your Firebase configuration

### 3. Update Firebase Config

Replace the placeholder values in `src/firebase/config.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

### 4. Firestore Security Rules

Set up Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 5. Storage Security Rules

Set up Firebase Storage security rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile-images/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 6. Run the Application

```bash
npm run dev
```

## Project Structure

```
src/
├── components/
│   ├── Login.tsx          # Login form component
│   ├── Signup.tsx         # Signup form component
│   ├── Dashboard.tsx      # Main dashboard with navigation
│   ├── ProtectedRoute.tsx # Route protection component
│   └── Picky.tsx          # Random item picker
├── contexts/
│   └── AuthContext.tsx    # Authentication context
├── firebase/
│   └── config.ts          # Firebase configuration
└── App.tsx                # Main app with routing
```

## Usage

1. **Signup**: Navigate to `/signup` to create a new account
2. **Login**: Navigate to `/login` to sign in
3. **Dashboard**: After authentication, access the Picky app at `/dashboard`
4. **Logout**: Use the logout button in the navigation bar

## Environment Variables (Recommended)

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

Then update `src/firebase/config.ts` to use environment variables:

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
# picky
