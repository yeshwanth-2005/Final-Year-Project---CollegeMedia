# Backend-Frontend Integration Setup Guide

## Overview
This guide explains how the backend and frontend are integrated and how to set up the development environment.

## Architecture

### Backend (Port 4000)
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB (local)
- **Authentication**: JWT-based (access + refresh tokens)
- **Security**: bcrypt password hashing, HTTP-only cookies

### Frontend (Port 8080)
- **Framework**: React with TypeScript (Vite)
- **State Management**: React Context API
- **Forms**: React Hook Form with Zod validation
- **API Client**: Custom fetch-based client with automatic token handling

## Setup Instructions

### 1. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example` (already created):
```bash
# The .env file has been created with default values
# Update JWT secrets for production!
```

4. Start MongoDB (make sure MongoDB is running locally on port 27017)

5. Start the backend server:
```bash
npm run dev
```

Backend will run on: `http://localhost:4000`

### 2. Frontend Setup

1. Navigate to the project root:
```bash
cd ..
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Create `.env.local` file:
```bash
# Create this file manually
echo "VITE_API_URL=http://localhost:4000" > .env.local
```

4. Start the frontend development server:
```bash
npm run dev
```

Frontend will run on: `http://localhost:8080`

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/logout` | Logout user | No |
| POST | `/auth/refresh` | Refresh access token | No (uses cookie) |
| GET | `/auth/me` | Get current user info | Yes |
| GET | `/health` | Health check | No |

### Request/Response Examples

#### Register
```json
POST /auth/register
{
  "fullName": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "dob": "2000-01-01" // optional
}

Response: 201
{
  "id": "...",
  "fullName": "John Doe",
  "username": "johndoe",
  "email": "john@example.com"
}
```

#### Login
```json
POST /auth/login
{
  "emailOrUsername": "john@example.com",
  "password": "password123"
}

Response: 200
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "fullName": "John Doe",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

## Protected Routes

The following frontend routes require authentication:
- `/` - Home/Index
- `/profile` - User Profile
- `/messages` - Messages
- `/communities` - Communities
- `/news` - Tech News
- `/study` - Study Materials
- `/jobs` - Jobs
- `/bookmarks` - Bookmarks
- `/mails` - Mail
- `/settings` - Settings

Public routes:
- `/login` - Login/Register page

## How Authentication Works

1. **Registration**: User creates account → Backend stores hashed password
2. **Login**: User logs in → Backend returns access token + sets refresh token cookie
3. **Access Token**: Stored in localStorage, sent with every API request in Authorization header
4. **Refresh Token**: Stored in HTTP-only cookie, used to get new access tokens
5. **Auto-Refresh**: Frontend automatically refreshes tokens every 10 minutes
6. **Protected Routes**: AuthContext checks authentication, ProtectedRoute component guards routes

## Frontend Architecture

### Key Files

- `src/lib/api.ts` - API client with automatic token handling
- `src/services/authService.ts` - Authentication service methods
- `src/contexts/AuthContext.tsx` - Global authentication state
- `src/components/ProtectedRoute.tsx` - Route guard component
- `src/pages/Login.tsx` - Login/Register page with forms

### Using Authentication in Components

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  return (
    <div>
      {isAuthenticated && <p>Welcome {user?.fullName}</p>}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## CORS Configuration

- Backend allows requests from: `http://localhost:8080`
- Credentials (cookies) are included in requests
- All origins can be customized via `CORS_ORIGIN` environment variable

## Security Features

✅ Password hashing with bcrypt (10 salt rounds)
✅ JWT tokens with separate access/refresh secrets
✅ HTTP-only cookies for refresh tokens
✅ Access token stored in localStorage (15 min expiry)
✅ Refresh token in cookie (7 day expiry)
✅ Input validation with Zod schemas
✅ Protected API endpoints with middleware

## Troubleshooting

### CORS Errors
- Make sure backend `.env` has `CORS_ORIGIN=http://localhost:8080`
- Make sure frontend is running on port 8080
- Check that credentials: 'include' is set in API calls

### Authentication Issues
- Clear localStorage and cookies
- Check MongoDB is running
- Verify JWT secrets are set in backend `.env`
- Check browser console for detailed errors

### Connection Refused
- Make sure backend is running on port 4000
- Make sure frontend `.env.local` has correct API URL
- Check firewall settings

## Next Steps

1. Create your first user via the Register tab
2. Login with your credentials
3. You'll be redirected to the home page
4. All protected routes are now accessible
5. Token refresh happens automatically

## Production Considerations

Before deploying to production:
- [ ] Change JWT secrets to strong random values
- [ ] Set `REFRESH_COOKIE_SECURE=true` for HTTPS
- [ ] Update `CORS_ORIGIN` to your production frontend URL
- [ ] Use production MongoDB instance
- [ ] Set `REFRESH_COOKIE_SAMESITE=strict` or `none` based on deployment
- [ ] Add rate limiting to authentication endpoints
- [ ] Enable HTTPS for both frontend and backend
