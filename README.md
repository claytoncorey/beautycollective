# New Mexico Beauty Collective

The **New Mexico Beauty Collective** is a modern web directory application designed to showcase and connect local beauty, wellness, and creative professionals in New Mexico (hair stylists, photographers, estheticians, makeup artists, nail technicians, and more) with clients.

## Key Features

- **Interactive Practitioner Directory**: A clean, filterable, and searchable directory of local professionals categorized by specialization (e.g., Hair, Face & Skin, Photography).
- **Professional Portfolios**: Dedicated profile management for registered practitioners, allowing them to showcase:
  - Professional headshots/portraits.
  - Business/salon environment photos.
  - Business logos and badges.
  - Social media and booking website links.
- **Client-Side Image Optimization**: Automatically scales and compresses profile uploads (portraits, business photos, and logos) using HTML5 Canvas before uploading to Firebase. This prevents upload errors from large phone photos and optimizes load times.
- **Admin Dashboard**: A secure control panel for admins to approve new professional listings, manage categories, and review feedback submissions.
- **Integrated Email/Newsletter Generator**: Tool for administrators to compile professional directory listings into rich HTML newsletters and campaign emails.
- **Serverless Architecture**: Powered entirely by Firebase (Authentication, Cloud Firestore, and Cloud Storage) and deployed via Firebase Hosting.

---

## Tech Stack

- **Frontend Framework**: React 19
- **Build System**: Vite 8
- **Database & Services**: Firebase 12
  - **Firebase Auth**: User registration and secure authentication.
  - **Cloud Firestore**: Storage for professional profiles, categories, and admin logs.
  - **Firebase Storage**: Hosting for uploaded practitioner media assets.
- **Linter**: Oxlint (ultra-fast JS/React code quality checking)

---

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v18+) installed.

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone <repository-url>
   cd NewMexicoBeautyCollective
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   Create a `.env` file in the root directory and add your Firebase configuration (see `.env.example` as a template):
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

### Local Development

To start the Vite development server locally:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Project Structure

```
├── public/                 # Static public assets
├── src/
│   ├── assets/             # Images, logos, and global styles
│   ├── components/         # React UI components
│   │   ├── AdminPanel.jsx      # Admin controls & profile approvals
│   │   ├── AuthPanel.jsx       # Login/Sign-up interface
│   │   ├── DirectoryView.jsx   # Public collective search & filters
│   │   ├── EmailGenerator.jsx  # Admin newsletter builder
│   │   ├── MyProfile.jsx       # Professional profile editor
│   │   └── ...
│   ├── utils/              # Helper utilities
│   │   └── imageOptimizer.js   # Client-side canvas image resizing
│   ├── firebase.js         # Firebase config & services exports
│   ├── main.jsx            # React app entrypoint
│   └── App.jsx             # Main router and layout
├── firebase.json           # Firebase CLI configuration
├── firestore.rules         # Cloud Firestore security rules
├── storage.rules           # Firebase Storage security rules
└── package.json            # Scripts & dependencies
```

---

## Scripts & Operations

- **Run Dev Server**: `npm run dev`
- **Lint Code**: `npm run lint` (runs `oxlint` rules check)
- **Production Build**: `npm run build` (builds the assets to `/dist` and automatically triggers sitemap generation)

### Deployment

To deploy the application to Firebase Hosting:

1. **Preview Channel Deployment**:
   Deploy changes to a temporary staging URL to verify styling and functionality:
   ```bash
   npx -y firebase-tools@latest hosting:channel:deploy CHANNEL_ID
   ```
2. **Production Deployment**:
   Publish preview channel versions or your current local build directly to production (`live`):
   ```bash
   # Option A: Promote/Clone a preview channel version
   npx -y firebase-tools@latest hosting:clone SOURCE_PROJECT_ID:CHANNEL_ID TARGET_PROJECT_ID:live
   
   # Option B: Deploy standard local build
   npx -y firebase-tools@latest deploy --only hosting
   ```
