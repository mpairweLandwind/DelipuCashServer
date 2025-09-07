import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

// Import routes
import authRouter from '../routes/auth.route.mjs';
import paymentRoutes from '../routes/paymentRoutes.mjs';
import rewardRoutes from '../routes/rewardRoutes.mjs';
import questionAttemptRoutes from '../routes/questionAttemptRoutes.mjs';
import questionRoutes from '../routes/questionRoutes.mjs';
import surveyRoutes from '../routes/surveyRoutes.mjs';
import videoRoutes from '../routes/videoRoutes.mjs';
import AdRoutes from '../routes/AdRoutes.mjs';
import exploreRoutes from '../routes/exploreRoutes.mjs';
import rewardQuestionRoutes from '../routes/rewardQuestionRoutes.mjs';
import notificationRoutes from '../routes/notificationRoutes.mjs';
import userRoutes from '../routes/userRoutes.mjs';
import healthRoutes from '../routes/healthRoutes.mjs';

dotenv.config();

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Mobile-specific middleware
app.use((req, res, next) => {
  // Add security headers for mobile apps
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Mobile app headers
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  next();
});

// Handle preflight requests for mobile apps
app.options('*', (req, res) => {
  res.status(200).end();
});

// Configure CORS optimized for mobile apps
const allowedOrigins = [
  // Development
  'http://localhost:3000',
  'http://localhost:8081',
  'https://localhost:8081',
  
  // Production
  'https://delipucashserver.vercel.app',
  process.env.FRONTEND_URL,
  
  // Mobile app patterns
  /^exp:\/\/.*/, // Expo development URLs
  /^https:\/\/.*\.vercel\.app$/, // Vercel apps
  /^capacitor:\/\/.*/, // Capacitor apps
  /^ionic:\/\/.*/, // Ionic apps
  /^file:\/\/.*/, // Cordova/PhoneGap apps
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (native mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin matches any allowed pattern
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return allowed === origin;
      }
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });
    
    if (!isAllowed) {
      console.warn(`CORS blocked origin: ${origin}`);
      // For mobile apps, we might want to be more permissive in development
      if (process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'x-access-token',
    'x-refresh-token'
  ],
  exposedHeaders: ['Authorization', 'x-access-token', 'x-refresh-token'],
  maxAge: 86400, // 24 hours
}));

// Request logging middleware (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });
}

// Health routes (should be first)
app.use('/', healthRoutes);

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/rewards', rewardRoutes);
app.use('/api/attempts', questionAttemptRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/ads', AdRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/reward-questions', rewardQuestionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '� DelipuCash Mobile API Server',
    status: 'Running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    mobile_optimized: true,
    endpoints: {
      health: '/health',
      ping: '/ping',
      api_docs: {
        auth: '/api/auth/*',
        rewards: '/api/rewards/*',
        questions: '/api/questions/*',
        surveys: '/api/surveys/*',
        payments: '/api/payments/*',
        videos: '/api/videos/*',
        ads: '/api/ads/*',
        users: '/api/users/*',
        notifications: '/api/notifications/*',
        explore: '/api/explore/*'
      }
    },
    mobile_features: {
      cors_enabled: true,
      file_upload: true,
      max_file_size: '50MB',
      timeout: '30s',
      auth_tokens: true
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV !== 'production' && { 
        stack: err.stack,
        details: err 
      })
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      '/',
      '/health',
      '/ping',
      '/api/*'
    ]
  });
});

export default app;
