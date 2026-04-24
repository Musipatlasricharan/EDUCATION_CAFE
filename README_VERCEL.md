# 🚀 Vercel Deployment Guide for EduCafe

This project is configured for a seamless full-stack deployment on Vercel. Follow these steps to get it running end-to-end.

## 1. Prerequisites
- A Vercel account.
- The project pushed to a GitHub/GitLab/Bitbucket repository.

## 2. Environment Variables
You **MUST** set the following environment variables in the Vercel Dashboard (**Project Settings > Environment Variables**):

| Variable | Description | Example / Source |
| :--- | :--- | :--- |
| `MONGO_URI` | MongoDB Connection String | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for auth tokens | Any random long string |
| `CLIENT_URL` | Your Vercel App URL | `https://your-app.vercel.app` |
| `GEMINI_API_KEY` | Google Gemini AI Key | Get from [Google AI Studio](https://aistudio.google.com/) |
| `TAVILY_API_KEY` | Tavily Search API Key | Get from [Tavily](https://tavily.com/) |
| `SERPER_API_KEY` | Serper Search API Key | Get from [Serper](https://serper.dev/) |
| `ONECOMPILER_API_KEY` | OneCompiler API Key | For coding challenge execution |
| `RAZORPAY_KEY_ID` | Razorpay Key ID | For payments (Premium) |
| `RAZORPAY_KEY_SECRET` | Razorpay Secret | For payments (Premium) |
| `RAZORPAY_PLAN_ID` | Razorpay Plan ID | For payments (Premium) |

*Optional for Google Login:*
| Variable | Description |
| :--- | :--- |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `GOOGLE_CALLBACK_URL` | `https://your-app.vercel.app/api/auth/google/callback` |

## 3. Deployment Steps
1. **Import Project**: Go to Vercel and import your repository.
2. **Framework Preset**: Select **Other** (Vercel will automatically detect `vercel.json`).
3. **Build Settings**: 
   - Build Command: `npm run vercel-build`
   - Output Directory: `client/dist` (Vercel handles this via `vercel.json` but good to know)
4. **Environment Variables**: Add all the keys listed in the table above.
5. **Deploy**: Click **Deploy**.

## 4. Why these changes were made?
- **Unified package.json**: Server dependencies were moved to the root so Vercel can build the serverless functions correctly.
- **Vercel-Friendly Server**: `server.js` was modified to skip `app.listen()` in production/Vercel environments, allowing Vercel's internal listener to take over.
- **Dynamic DB Connection**: The server now ensures a database connection exists for every serverless request, handling the "cold start" nature of serverless functions.
- **Routing**: `vercel.json` is optimized to route `/api/*` to the backend and all other paths to the React frontend.

## 5. Troubleshooting
- **429 Errors**: If you see "Too many requests", check your `express-rate-limit` settings in `server/server.js`.
- **Database Connection**: Ensure your MongoDB Atlas IP Whitelist allows access from "0.0.0.0/0" since Vercel IPs are dynamic.
