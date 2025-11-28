# Posts CRUD - Quick Reference

## 🚀 Quick Start

### 1. Environment Setup

Add to `.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. Get Cloudinary Credentials

1. Sign up: https://cloudinary.com
2. Dashboard → Copy credentials
3. Paste into `.env`

---

## 📡 API Endpoints

### Create Post

```http
POST /api/posts
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body:
- content (required): Post text
- visibility (optional): public/friends/private
- image (optional): Image file
```

### Get Feed

```http
GET /api/posts?page=1&limit=10
Authorization: Bearer {token}
```

### Get Single Post

```http
GET /api/posts/{postId}
Authorization: Bearer {token}
```

### Update Post

```http
PUT /api/posts/{postId}
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body:
- content (optional): Updated text
- visibility (optional): Updated visibility
- image (optional): New image (replaces old)
```

### Delete Post

```http
DELETE /api/posts/{postId}
Authorization: Bearer {token}
```

### Get User Posts

```http
GET /api/users/{username}/posts?page=1&limit=10
Authorization: Bearer {token}
```

---

## 💻 Frontend Examples

### Create Post with Image

```typescript
const formData = new FormData();
formData.append("content", "Hello World!");
formData.append("visibility", "friends");
formData.append("image", imageFile);

await fetch("/api/posts", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
});
```

### Update Post

```typescript
const formData = new FormData();
formData.append("content", "Updated content");
if (newImage) formData.append("image", newImage);

await fetch(`/api/posts/${postId}`, {
  method: "PUT",
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
});
```

### Delete Post

```typescript
await fetch(`/api/posts/${postId}`, {
  method: "DELETE",
  headers: { Authorization: `Bearer ${token}` },
});
```

---

## 🔧 Key Features

✅ Image upload to Cloudinary  
✅ Auto image optimization (1200x1200 max)  
✅ 5MB file size limit  
✅ Automatic cleanup on errors  
✅ Old image deletion on update  
✅ Visibility control (public/friends/private)  
✅ Authorization checks  
✅ Pagination support  
✅ Input validation

---

## 📂 File Structure

```
backend/
├── src/
│   ├── config/
│   │   └── cloudinary.ts          # Cloudinary setup
│   ├── models/
│   │   └── post.ts                # Post model (updated)
│   ├── routes/
│   │   └── posts.ts               # Posts CRUD routes
│   └── index.ts                   # Register routes
├── .env.example                   # Updated with Cloudinary vars
├── POSTS_API.md                   # Full API documentation
└── IMPLEMENTATION_SUMMARY.md      # Complete summary
```

---

## 🎯 Image Specs

- **Formats**: JPG, JPEG, PNG, GIF, WEBP
- **Max Size**: 5MB
- **Storage**: `college_media/posts/` on Cloudinary
- **Optimization**: Auto quality & format
- **Max Dimensions**: 1200x1200 (maintains aspect ratio)

---

## 🔒 Security

- All endpoints require authentication
- Users can only edit/delete own posts
- File type validation (images only)
- File size validation (5MB max)
- Visibility controls enforced
- Input validation with Zod

---

## ⚠️ Important Notes

1. **Don't forget** to add Cloudinary credentials to `.env`
2. **Image cleanup** happens automatically on errors
3. **Old images** are deleted when replaced
4. **Post deletion** continues even if Cloudinary fails (logged)
5. **Content-Type** must be `multipart/form-data` for uploads

---

## 🐛 Common Issues

### "Missing Cloudinary credentials"

→ Add credentials to `.env` file

### "Only image files are allowed"

→ Upload JPG, PNG, GIF, or WEBP files only

### "File too large"

→ Image must be under 5MB

### "Not authorized"

→ You can only edit/delete your own posts

### "Post not found"

→ Check post ID is correct

---

## ✅ Testing Endpoints

Use Postman, Thunder Client, or curl:

```bash
# Create post
curl -X POST http://localhost:4000/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "content=Test post" \
  -F "visibility=public" \
  -F "image=@/path/to/image.jpg"

# Get posts
curl http://localhost:4000/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update post
curl -X PUT http://localhost:4000/api/posts/POST_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "content=Updated content"

# Delete post
curl -X DELETE http://localhost:4000/api/posts/POST_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📚 Documentation

- **Full API Docs**: `POSTS_API.md`
- **Complete Summary**: `IMPLEMENTATION_SUMMARY.md`
- **This Guide**: `QUICK_REFERENCE.md`

---

## 🎉 You're Ready!

Posts CRUD with Cloudinary is fully implemented and ready to use.

**Just add your Cloudinary credentials and start testing!**
