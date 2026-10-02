# DriveGit

GitHub-style viewer for a public Google Drive folder. No sign-in required.

## Setup
1. `npm install`
2. Get a Google API key: https://console.cloud.google.com/
   - Enable **Google Drive API**
   - Create an **API Key** under Credentials
   - Restrict by HTTP referrer: http://localhost:5173/*
3. Share your Drive folder: right-click → Share → Anyone with the link → Viewer
4. Copy the folder ID from the URL and paste into `.env`
5. `npm run dev` → http://localhost:5173
