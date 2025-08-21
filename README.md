## Render Link:
https://s66-hand-pic.onrender.com/ping

## Frontend-deploy Link:
https://handscape-o.netlify.app/

# Project Title:  
**HandScape**

## Project Overview:  
This project is all about hands – funny, creative, and unique hand pictures! Users can upload their hand photos, view others' submissions, and vote for the best ones. It’s a fun way to celebrate creativity and share interesting hand moments with the community.

## Key Features:  
- **User Authentication:**  
  Allow users to sign up, log in, and manage their accounts.  

- **Dynamic Gallery:**  
  Display a gallery of hand pictures, dynamically updated with user submissions.  

- **Add New Entries:**  
  Users can upload hand pictures with titles, descriptions, and tags.  

- **Edit and Delete Entries:**  
  Users can edit or delete their own submissions.  

- **Voting System:**  
  Users can upvote or downvote pictures to rank the most unique and creative submissions.  

- **Interactive Frontend:**  
  A visually engaging UI to browse pictures and user reactions.  

- **Responsive Design:**  
  Ensure the platform is user-friendly and accessible across devices.  

## Tech Stack:  
- **Frontend:** React with Vite for a fast and responsive UI.  
- **Backend:** Node.js with Express for server-side logic.  
- **Database:** MongoDB  
- **Authentication:** Optional  
- **Hosting:** Netlify  
- **API:** Optional  

## Why This Project?  
I chose this project because it’s a simple and fun way to share and rate hand pictures. Hands are something we use every day, but we don’t always pay attention to how interesting they can be.  

This project will help me learn important web development skills like:  
- Uploading pictures.  
- Building a voting system.  
- Making the site user-friendly and accessible.  

It’s a great way to practice these skills while making something fun for people.

## 🔧 Deployment Configuration

### CORS Setup
The backend is configured to allow requests from:
- `http://localhost:5173` (Local Vite dev)
- `http://localhost:5174` (Local Vite dev)
- `https://handscape-o.netlify.app` (Production frontend)
- `https://s66-hand-pic.onrender.com` (Production backend)

### Cookie Configuration
- **Development**: `secure: false, sameSite: 'Lax'`
- **Production**: `secure: true, sameSite: 'None', domain: '.onrender.com'`

### Environment Variables Required
```env
NODE_ENV=production
PORT=8888
mongoURI=mongodb+srv://...
SECRET_KEY=your_secret_key
```

## 🐛 Troubleshooting CORS Issues

If you see CORS errors like:
```
Access to XMLHttpRequest at 'http://localhost:8888/...' from origin 'https://handscape-o.netlify.app' has been blocked by CORS policy
```

**Solutions:**
1. **Deploy your backend** - The frontend is trying to connect to localhost instead of production
2. **Update environment** - Set `NODE_ENV=production` on Render
3. **Check URLs** - Ensure all API calls use `https://s66-hand-pic.onrender.com`
4. **Verify CORS config** - Backend allows your Netlify domain

## 🚀 Quick Fix Commands

**Restart backend with production settings:**
```bash
cd Server
NODE_ENV=production npm start
```

**Check backend status:**
```bash
curl https://s66-hand-pic.onrender.com/ping
```

**Verify CORS configuration:**
```bash
curl -H "Origin: https://handscape-o.netlify.app" https://s66-hand-pic.onrender.com/
```
