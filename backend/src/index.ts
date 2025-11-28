import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import authRoutes from './routes/auth';
import friendsRoutes, { setSocketIOInstance } from './routes/friends';
import messagesRoutes from './routes/messages';
import usersRoutes from './routes/users';
import notificationsRoutes from './routes/notifications';
import postsRoutes from './routes/posts';
import { initializeSocket } from './lib/socket';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 4001;

// MongoDB connection - use the URI from .env or fallback to the hardcoded one
const MONGODB_URI = process.env.MONGODB_URI ;

// Enable CORS for all routes
app.use(cors({ 
  origin: true, // Allow all origins in development
  credentials: true 
}));

// Cookie parser middleware
app.use(cookieParser());

// Apply body parsers for JSON requests
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/api', friendsRoutes);
app.use('/api', messagesRoutes);
app.use('/api', usersRoutes);
app.use('/api', notificationsRoutes);
app.use('/api', postsRoutes);

// Middleware to ensure JSON responses
app.use((req, res, next) => {
  // Store original json method
  const originalJson = res.json.bind(res);
  
  // Override json method to always set content-type
  res.json = function(body: any) {
    res.setHeader('Content-Type', 'application/json');
    return originalJson(body);
  };
  
  next();
});

app.get('/health', (_req, res) => res.json({ ok: true }));

// 404 handler - must be after all routes
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler - must be last
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Handle PayloadTooLargeError specifically
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ 
      error: 'Request entity too large',
      message: 'File size exceeds the allowed limit'
    });
  }
  
  // Handle JSON parse errors
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ 
      error: 'Invalid JSON',
      message: 'Malformed JSON in request body'
    });
  }
  
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error' 
  });
});

// Initialize Socket.IO
const io = initializeSocket(httpServer);
// Make Socket.IO instance available to routes
setSocketIOInstance(io);

async function start() {
  await mongoose.connect(MONGODB_URI);
  console.log('MongoDB connected');
  httpServer.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});