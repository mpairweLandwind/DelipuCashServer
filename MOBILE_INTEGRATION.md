# Mobile App Backend Integration Guide

## 🚀 Quick Setup

Your backend is now optimized for mobile app integration! Here's how to connect your React Native/Expo app:

## 📱 Mobile App Configuration

### 1. API Base URL Configuration

In your mobile app, configure the API base URL:

```javascript
// config/api.js
const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://localhost:3000'  // Development
    : 'https://your-app.vercel.app', // Production
  
  TIMEOUT: 30000, // 30 seconds
};

export default API_CONFIG;
```

### 2. API Client Setup (React Native/Expo)

```javascript
// services/apiClient.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_CONFIG from '../config/api';

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      await AsyncStorage.removeItem('authToken');
      // Navigate to login screen
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 3. API Service Functions

```javascript
// services/authService.js
import apiClient from './apiClient';

export const authService = {
  // Login
  login: async (email, password) => {
    const response = await apiClient.post('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  // Register
  register: async (userData) => {
    const response = await apiClient.post('/api/auth/register', userData);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await apiClient.post('/api/auth/logout');
    return response.data;
  },
};

// services/rewardService.js
export const rewardService = {
  // Get rewards
  getRewards: async () => {
    const response = await apiClient.get('/api/rewards');
    return response.data;
  },

  // Claim reward
  claimReward: async (rewardId) => {
    const response = await apiClient.post(`/api/rewards/claim`, { rewardId });
    return response.data;
  },
};

// Add similar services for other features...
```

### 4. Error Handling

```javascript
// utils/errorHandler.js
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        return 'Authentication failed. Please login again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return data?.message || 'An error occurred.';
    }
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your connection.';
  } else {
    return 'An unexpected error occurred.';
  }
};
```

## 🔧 Backend Features for Mobile Apps

### 1. Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh auth token

### 2. Core Features
- `GET /api/rewards` - Get available rewards
- `POST /api/rewards/claim` - Claim a reward
- `GET /api/questions` - Get questions
- `POST /api/questions/answer` - Submit answer
- `GET /api/surveys` - Get surveys
- `POST /api/surveys/submit` - Submit survey response

### 3. Media Upload
- `POST /api/videos/upload` - Upload video content
- `POST /api/users/avatar` - Upload user avatar

### 4. Real-time Features
- `GET /api/notifications` - Get notifications
- `POST /api/notifications/read` - Mark as read

## 📱 Mobile-Specific Optimizations

### 1. CORS Configuration
- ✅ Allows requests from mobile apps (no origin)
- ✅ Supports Expo development URLs
- ✅ Handles preflight requests

### 2. Request Handling
- ✅ 50MB limit for file uploads
- ✅ Extended timeout (30 seconds)
- ✅ Mobile-friendly headers

### 3. Error Responses
- ✅ Consistent JSON error format
- ✅ HTTP status codes
- ✅ Detailed error messages

## 🔗 Deployment URLs

### Production
- **API Base URL:** `https://your-app.vercel.app`
- **Health Check:** `https://your-app.vercel.app/health`
- **API Documentation:** `https://your-app.vercel.app/`

### Testing Endpoints
```bash
# Health check
curl https://your-app.vercel.app/health

# Test authentication
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## 🚨 Mobile App Checklist

### Before Deployment:
- [ ] Update `API_CONFIG.BASE_URL` to production URL
- [ ] Test all API endpoints
- [ ] Verify authentication flow
- [ ] Test file upload functionality
- [ ] Check error handling
- [ ] Test offline/network error scenarios

### Environment Variables to Set in Vercel:
- [ ] `DATABASE_URL` - MongoDB connection string
- [ ] `JWT_SECRET` - JWT signing secret
- [ ] `FRONTEND_URL` - Your mobile app domain (if any)
- [ ] `PAYPAL_CLIENT_ID` & `PAYPAL_CLIENT_SECRET`
- [ ] `EMAIL_USER` & `EMAIL_PASS`

## 📞 Support

If you encounter issues:
1. Check network connectivity
2. Verify API endpoint URLs
3. Check authentication tokens
4. Review server logs in Vercel dashboard
5. Test endpoints with Postman/curl

Your mobile app is now ready to connect to the optimized backend! 🎉
