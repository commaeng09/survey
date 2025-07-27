# VERCEL DEPLOYMENT GUIDE

## Emergency Cache Clear Instructions

If Vercel is still serving old cached files:

1. Go to https://vercel.com/dashboard
2. Select project: survey-zeta-seven  
3. Go to Settings → Environment Variables
4. Add/Update:
   - VITE_BACKEND_URL: https://survey-backend-dgiy.onrender.com/api
   - VITE_API_URL: https://survey-backend-dgiy.onrender.com/api
5. Go to Deployments tab
6. Click "Redeploy" on latest deployment
7. Select "Use existing Build Cache: NO"

## Expected Result
All requests should go to: https://survey-backend-dgiy.onrender.com/api

## NOT TO
Old Railway URL: https://survey-production-c653.up.railway.app/api
