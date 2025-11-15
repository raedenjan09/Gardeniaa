# Backend — Setup and Credentials

1) Purpose
- This file explains how to set your Cloudinary, Mailtrap (SMTP), and MongoDB credentials so the backend can connect to those services.

2) Create your `.env`
- Copy `config/.env.example` to `config/.env`:

```powershell
cd backend
copy .\config\.env.example .\config\.env
```

- Edit `config/.env` and replace the placeholder values with your credentials for:
  - `DB_URI` — your MongoDB connection string (MongoDB Atlas or self-hosted)
  - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_EMAIL`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`

3) Recommended `package.json` scripts
- You can add these scripts in `backend/package.json` to run the server:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

4) Start the server (PowerShell)

```powershell
cd backend
npm install
node server.js
# or, if you added scripts:
npm run dev
```

5) Quick verification
- On server start, `server.js` prints checks for the Cloudinary env variables. If any are missing you will see an ✗ marker.
- To verify Mailtrap: send a test email from the app (password reset or registration flow) and check your Mailtrap inbox.
- To verify MongoDB: server console should print the connected host from the `connectDatabase()` log.

6) Security note
- Do NOT commit `config/.env` to version control. Keep secrets out of the repo.
