# CollegeMedia - College Community Platform

## Project Overview

CollegeMedia is a modern social platform designed for college students to connect, share, and discover content. This full-stack application features user authentication, post creation/sharing, friend management, real-time messaging, notifications, bookmarks, and profile management.

## Project Structure

```
college_media/
├── backend/           # Node.js/Express backend API
│   ├── src/
│   │   ├── config/    # Configuration files (Cloudinary, JWT, etc.)
│   │   ├── lib/       # Utility libraries (hashing, JWT, socket)
│   │   ├── middlewares/ # Authentication middleware
│   │   ├── models/    # Data models (User, Post, Message, etc.)
│   │   ├── routes/    # API route handlers
│   │   ├── utils/     # Helper functions
│   │   └── index.ts   # Entry point
│   └── .env           # Environment variables
└── frontend/          # React/Vite frontend
    ├── src/
    │   ├── components/ # Reusable UI components
    │   ├── contexts/  # React context providers
    │   ├── hooks/     # Custom React hooks
    │   ├── lib/       # Utility functions and API clients
    │   ├── pages/     # Route-level components
    │   ├── services/  # Service layer for API calls
    │   └── types/     # TypeScript interfaces
    └── public/        # Static assets
```

## Technologies Used

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn-ui components

### Backend
- Node.js
- Express-like framework
- MongoDB (via Mongoose patterns)
- JWT for authentication
- Socket.IO for real-time communication
- Cloudinary for media storage

## Getting Started

### Prerequisites
- Node.js & npm installed
- MongoDB database
- Cloudinary account for image storage

### Installation

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd college_media
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Set up environment variables:
- Copy `backend/.env.example` to `backend/.env` and fill in your values
- Copy `frontend/.env.example` to `frontend/.env` and fill in your values

### Running the Application

#### Backend
```bash
cd backend
npm run dev
```

#### Frontend
```bash
cd frontend
npm run dev
```

Both servers need to be running simultaneously for the application to work properly.
