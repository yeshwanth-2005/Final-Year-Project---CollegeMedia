# Posts API Documentation

## Overview

Full CRUD operations for posts with Cloudinary image upload support.

## Base URL

`/api`

---

## Endpoints

### 1. CREATE Post

**POST** `/api/posts`

Creates a new post with optional image upload.

**Authentication Required:** Yes

**Content-Type:** `multipart/form-data`

**Request Body:**

- `content` (string, required): Post content (1-2000 characters)
- `visibility` (string, optional): Post visibility - `public`, `friends`, or `private` (default: `friends`)
- `image` (file, optional): Image file (JPG, JPEG, PNG, GIF, WEBP, max 5MB)

**Success Response (201):**

```json
{
  "message": "Post created successfully",
  "post": {
    "id": "post_id",
    "content": "Post content",
    "image": "https://res.cloudinary.com/...",
    "visibility": "friends",
    "author": {
      "id": "user_id",
      "name": "John Doe",
      "username": "johndoe",
      "avatar": "avatar_url"
    },
    "likeCount": 0,
    "commentCount": 0,
    "shares": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**

- `400`: Invalid input or unsupported file type
- `401`: Unauthorized
- `500`: Server error

---

### 2. GET All Posts (Feed)

**GET** `/api/posts?page=1&limit=10`

Retrieves posts visible to the current user (public posts + own posts).

**Authentication Required:** Yes

**Query Parameters:**

- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Posts per page (default: 10)

**Success Response (200):**

```json
{
  "posts": [
    {
      "id": "post_id",
      "content": "Post content",
      "image": "image_url",
      "visibility": "public",
      "author": {
        "id": "user_id",
        "name": "John Doe",
        "username": "johndoe",
        "avatar": "avatar_url"
      },
      "likeCount": 5,
      "commentCount": 2,
      "shares": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---

### 3. GET Single Post

**GET** `/api/posts/:postId`

Retrieves a single post by ID.

**Authentication Required:** Yes

**URL Parameters:**

- `postId` (string): Post ID

**Success Response (200):**

```json
{
  "post": {
    "id": "post_id",
    "content": "Post content",
    "image": "image_url",
    "visibility": "friends",
    "author": {
      "id": "user_id",
      "name": "John Doe",
      "username": "johndoe",
      "avatar": "avatar_url"
    },
    "likeCount": 5,
    "commentCount": 2,
    "shares": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**

- `403`: No permission to view this post
- `404`: Post not found
- `401`: Unauthorized
- `500`: Server error

---

### 4. UPDATE Post

**PUT** `/api/posts/:postId`

Updates a post. Can update content, visibility, and/or replace image.

**Authentication Required:** Yes (must be post author)

**Content-Type:** `multipart/form-data`

**URL Parameters:**

- `postId` (string): Post ID

**Request Body:**

- `content` (string, optional): Updated post content (1-2000 characters)
- `visibility` (string, optional): Updated visibility - `public`, `friends`, or `private`
- `image` (file, optional): New image file (replaces existing image if present)

**Success Response (200):**

```json
{
  "message": "Post updated successfully",
  "post": {
    "id": "post_id",
    "content": "Updated content",
    "image": "new_image_url",
    "visibility": "public",
    "author": {
      "id": "user_id",
      "name": "John Doe",
      "username": "johndoe",
      "avatar": "avatar_url"
    },
    "likeCount": 5,
    "commentCount": 2,
    "shares": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**

- `400`: Invalid input
- `403`: Not authorized (not post author)
- `404`: Post not found
- `401`: Unauthorized
- `500`: Server error

**Note:**

- Old Cloudinary image is automatically deleted when replaced
- If update fails after image upload, the new image is automatically cleaned up

---

### 5. DELETE Post

**DELETE** `/api/posts/:postId`

Deletes a post and its associated Cloudinary image.

**Authentication Required:** Yes (must be post author)

**URL Parameters:**

- `postId` (string): Post ID

**Success Response (200):**

```json
{
  "message": "Post deleted successfully"
}
```

**Error Responses:**

- `403`: Not authorized (not post author)
- `404`: Post not found
- `401`: Unauthorized
- `500`: Server error

**Note:**

- Cloudinary image is automatically deleted
- Post deletion continues even if Cloudinary deletion fails

---

### 6. GET User's Posts

**GET** `/api/users/:username/posts?page=1&limit=10`

Retrieves posts by a specific user.

**Authentication Required:** Yes

**URL Parameters:**

- `username` (string): Username

**Query Parameters:**

- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Posts per page (default: 10)

**Success Response (200):**

```json
{
  "posts": [
    {
      "id": "post_id",
      "content": "Post content",
      "image": "image_url",
      "visibility": "public",
      "author": {
        "id": "user_id",
        "name": "John Doe",
        "username": "johndoe",
        "avatar": "avatar_url"
      },
      "likeCount": 5,
      "commentCount": 2,
      "shares": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "pages": 2
  }
}
```

**Error Responses:**

- `404`: User not found
- `401`: Unauthorized
- `500`: Server error

**Note:**

- Users can see all their own posts
- Others can only see public posts (friends' posts when friendship check is added)

---

## Image Upload Specifications

### Supported Formats

- JPG, JPEG, PNG, GIF, WEBP

### File Size Limit

- Maximum: 5MB

### Cloudinary Configuration

- Folder: `college_media/posts`
- Transformations:
  - Max dimensions: 1200x1200 (maintains aspect ratio)
  - Quality: Auto
  - Format: Auto (optimized delivery)

### Image Management

- **On Create:** Image uploaded to Cloudinary, URL and public_id stored in database
- **On Update:** Old image deleted from Cloudinary, new image uploaded and stored
- **On Delete:** Image deleted from Cloudinary, post deleted from database
- **On Error:** Any uploaded images are automatically cleaned up

---

## Security Features

1. **Authentication:** All endpoints require valid JWT token
2. **Authorization:** Users can only update/delete their own posts
3. **Visibility Control:** Posts respect privacy settings (public/friends/private)
4. **File Validation:** Only image files accepted, size limits enforced
5. **Error Handling:** Failed uploads are automatically cleaned up
6. **Input Validation:** Zod schema validation on all inputs

---

## Setup Instructions

### 1. Install Dependencies

```bash
npm install cloudinary multer multer-storage-cloudinary
npm install --save-dev @types/multer
```

### 2. Configure Environment Variables

Add to `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Get Cloudinary Credentials

1. Sign up at https://cloudinary.com
2. Get credentials from dashboard
3. Add to `.env` file

---

## Example Usage (Frontend)

### Creating a Post with Image

```typescript
const createPost = async (
  content: string,
  image?: File,
  visibility?: string
) => {
  const formData = new FormData();
  formData.append("content", content);
  if (visibility) formData.append("visibility", visibility);
  if (image) formData.append("image", image);

  const response = await fetch("/api/posts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  return await response.json();
};
```

### Updating a Post

```typescript
const updatePost = async (postId: string, content?: string, image?: File) => {
  const formData = new FormData();
  if (content) formData.append("content", content);
  if (image) formData.append("image", image);

  const response = await fetch(`/api/posts/${postId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  return await response.json();
};
```

### Deleting a Post

```typescript
const deletePost = async (postId: string) => {
  const response = await fetch(`/api/posts/${postId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return await response.json();
};
```

---

## Database Schema

```typescript
interface IPost {
  author: ObjectId; // Reference to User
  content: string; // Post content (max 2000 chars)
  image?: string; // Cloudinary image URL
  imagePublicId?: string; // Cloudinary public_id for deletion
  visibility: "public" | "friends" | "private";
  likes: ObjectId[]; // Array of user IDs who liked
  comments: ObjectId[]; // Array of comment IDs
  shares: number; // Share count
  createdAt: Date; // Auto-generated
  updatedAt: Date; // Auto-generated
}
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message"
}
```

Or with validation details:

```json
{
  "error": "Invalid input",
  "details": [
    {
      "path": ["content"],
      "message": "Content is required"
    }
  ]
}
```
