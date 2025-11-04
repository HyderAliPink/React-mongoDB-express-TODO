# Deployment Guide for Render.com

## Prerequisites

- GitHub account
- Render.com account (sign up at https://render.com)
- MongoDB Atlas database (already set up)
- Push your code to GitHub repository

## Option 1: Deploy Using render.yaml (Recommended)

This method deploys both backend and frontend automatically using the configuration file.

### 1. Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. Connect to Render

1. Go to https://dashboard.render.com
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Select your todo app repository
5. Render will automatically detect the `render.yaml` file

### 3. Configure Environment Variables

Before deploying, you need to set environment variables:

**For Backend (todo-backend):**
- `MONGO_URI`: Your MongoDB connection string
- `PORT`: 5001 (already set in render.yaml)

**For Frontend (todo-frontend):**
- `VITE_API_URL`: Will be `https://YOUR-BACKEND-URL.onrender.com/todos`

### 4. Deploy

1. Click "Apply" to start deployment
2. Wait for both services to deploy (this may take 5-10 minutes)
3. Note your backend URL (e.g., `https://todo-backend-xyz.onrender.com`)
4. Update frontend environment variable `VITE_API_URL` with your backend URL
5. Trigger a redeploy of the frontend

### 5. Update CORS

After getting your frontend URL, update [backend/server.js](backend/server.js):

```javascript
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://your-frontend.onrender.com"  // Add your frontend URL
  ],
  credentials: true
}));
```

Commit and push changes to trigger automatic redeployment.

## Option 2: Manual Deployment

### Deploy Backend Manually

1. Go to Render Dashboard
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: todo-backend
   - **Root Directory**: backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Add Environment Variables:
   - `MONGO_URI`: Your MongoDB connection string
   - `PORT`: 5001

6. Click "Create Web Service"
7. Note your backend URL

### Deploy Frontend Manually

1. Click "New" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: todo-frontend
   - **Root Directory**: frontend
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: dist
   - **Plan**: Free

4. Add Environment Variable:
   - `VITE_API_URL`: `https://YOUR-BACKEND-URL.onrender.com/todos`

5. Click "Create Static Site"

## Important Notes

### MongoDB Configuration
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Or add Render's IP ranges to MongoDB whitelist

### Free Tier Limitations
- Services spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- Free tier is suitable for development and testing

### Environment Variables
- Never commit `.env` files (already in `.gitignore`)
- Set environment variables in Render Dashboard
- Frontend variables must be prefixed with `VITE_`

### Auto-Deploy
- Render automatically deploys when you push to your main branch
- You can disable auto-deploy in service settings

## Production URLs

After deployment, you'll get:
- Frontend: `https://todo-frontend-xyz.onrender.com`
- Backend: `https://todo-backend-xyz.onrender.com`

## Troubleshooting

### CORS Errors
- Ensure frontend URL is added to CORS origin list in [backend/server.js](backend/server.js)
- Push changes to trigger redeployment

### MongoDB Connection Issues
- Check MongoDB Atlas network access settings
- Verify `MONGO_URI` is correctly set in Render environment variables
- Check MongoDB Atlas credentials

### Build Errors
- Check build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify Node version compatibility

### Frontend Not Connecting to Backend
- Verify `VITE_API_URL` is correctly set
- Check backend service is running
- Ensure CORS is configured properly

### Service Spinning Down
- This is normal on free tier
- Upgrade to paid plan for always-on services
- Or use a service like UptimeRobot to ping your app

## Local Development

To run locally:

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

Ensure `.env` files are configured:
- `backend/.env`: Set `MONGO_URI` and `PORT=5001`
- `frontend/.env`: Set `VITE_API_URL=http://localhost:5001/todos`
