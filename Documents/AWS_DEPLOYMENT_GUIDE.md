# AWS Deployment Guide for Kidokool SFU

To ensure this project works "perfectly" on AWS, you need to configure a few critical production settings. By default, the app is set up for local development.

## 1. Environment Variables (.env)

Update your `.env` file on the AWS server with these production values:

### Core URLs
- `SERVER_HOST_URL=https://your-domain.com` (Use your actual domain with HTTPS)
- `OIDC_BASE_URL=https://your-domain.com` (If using OIDC)

### WebRTC Connectivity (CRITICAL)
For media (video/audio) to work on AWS, you must tell the SFU its public IP address:
- `SFU_ANNOUNCED_IP=1.2.3.4` (Replace with your AWS Elastic IP)

### Security
- `JWT_SECRET=your_long_random_secret_here` (Change this from the default!)
- `API_KEY_SECRET=another_random_secret`

## 2. AWS Security Group Configuration

You must open the following ports in your AWS Security Group:

| Port Range | Protocol | Description |
| --- | --- | --- |
| `3010` | TCP | Web Server (HTTPS) |
| `40000 - 40100` | UDP | WebRTC Media Traffic (RTP) |
| `40000 - 40100` | TCP | WebRTC Media Traffic (Fall back) |

## 3. SSL Configuration (HTTPS)

Production browsers require HTTPS for camera and microphone access. There are two ways to set this up:

### Option A: Reverse Proxy (Recommended)
Use **Nginx** with **Certbot (Let's Encrypt)**. Nginx will handle the SSL and proxy requests to the app running on port 3010.
- `trustProxy=true` (Set this in `.env`)

### Option B: Built-in SSL
If you want the app to handle SSL directly:
1. Upload your `.pem` and `.key` files to the `ssl/` directory.
2. Update `SERVER_SSL_CERT` and `SERVER_SSL_KEY` in `.env`.

## 4. Database Persistence

The app currently uses **SQLite**. 
- Ensure the `app/src/db/` directory is persistent (don't lose it on container restarts!).
- For high-scale production, consider migrating to **PostgreSQL** or **MySQL** (RDS), although SQLite is perfectly fine for low-to-medium usage.

## 5. Deployment Commands

```bash
# Install dependencies
npm install

# Start in production mode
npm start
```

> [!TIP]
> Use a process manager like **PM2** to keep the server running:
> `pm2 start app/src/Server.js --name kidokool-sfu`
