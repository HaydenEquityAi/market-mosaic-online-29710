# Frontend API Configuration

This document explains how the frontend connects to the backend API.

## API Base URL Configuration

The frontend is configured to use the HTTPS backend API by default.

### Configuration Logic

In `src/services/api.ts`, the API base URL is determined as follows:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.brokerai.ai/api';
```

This means:
1. If `VITE_API_URL` environment variable is set, it uses that URL
2. Otherwise, it defaults to the HTTPS backend: `https://api.brokerai.ai/api`

## Local Development

For local development when you have the backend running locally:

1. Create a `.env` file in the root directory (if it doesn't exist)
2. Add this line:
   ```
   VITE_API_URL=http://localhost:3010/api
   ```

3. Restart the development server
   ```bash
   npm run dev
   ```

## Production Deployment (Vercel)

When deploying to Vercel or other platforms:

1. Go to your project settings on Vercel
2. Navigate to Environment Variables
3. Add a new variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://api.brokerai.ai/api`
4. Redeploy your application

**Note**: The application will automatically use the HTTPS backend if `VITE_API_URL` is not set, so this step is optional.

## Backend Server Location

- **HTTPS URL**: https://api.brokerai.ai
- **Base Path**: `/api`
- **Full Endpoint**: https://api.brokerai.ai/api

## Testing the Connection

The application logs the API base URL to the console on startup. You can check the browser console to verify which backend is being used.

```javascript
console.log('API Base URL:', API_BASE_URL);
```

## Switching Between Local and Remote

- **Local Development**: Set `VITE_API_URL=http://localhost:3010/api` in `.env`
- **Use HTTPS Backend**: Do not set `VITE_API_URL` (or set it to `https://api.brokerai.ai/api`)

## Troubleshooting

If you see CORS errors or connection issues:

1. Check that the backend server is running at https://api.brokerai.ai
2. Verify the SSL certificate is valid
3. Check that CORS is configured in the backend to allow your frontend origin
4. Check browser console for specific error messages
5. If you see mixed content errors, ensure you're using HTTPS URLs only

