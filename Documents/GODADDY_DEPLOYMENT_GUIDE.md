# GoDaddy Deployment Guide for tawktoo SFU

This guide will help you deploy your tawktoo video conferencing application to GoDaddy hosting.

## Prerequisites

> [!IMPORTANT]
> **GoDaddy Hosting Requirements:**
> - **VPS or Dedicated Server** (Shared hosting will NOT work for Node.js applications)
> - Root or SSH access to your server
> - Minimum 2GB RAM, 2 CPU cores
> - Ubuntu 20.04 or later recommended

## Step 1: Choose the Right GoDaddy Plan

> [!WARNING]
> **Shared hosting does NOT support Node.js applications.** You need:
> - **GoDaddy VPS Hosting** (recommended)
> - **GoDaddy Dedicated Server** (for high traffic)

## Step 2: Access Your Server via SSH

1. Log into your GoDaddy account
2. Go to **My Products** → **Servers**
3. Click on your VPS/Server
4. Get your SSH credentials (IP address, username, password)
5. Connect via terminal:

```bash
ssh root@your-server-ip
```

## Step 3: Update System and Install Dependencies

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl git build-essential
```

## Step 4: Install Node.js (v18 or later)

```bash
# Install Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

## Step 5: Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

## Step 6: Clone Your Project

```bash
# Navigate to web directory
cd /var/www

# Clone your repository (replace with your repo URL)
git clone https://github.com/yourusername/tawktoo.git
cd tawktoo

# Or upload via SFTP/SCP if not using Git
```

## Step 7: Install Project Dependencies

```bash
# Install all dependencies
npm install --production

# This may take a few minutes
```

## Step 8: Configure Environment Variables

Create a production `.env` file:

```bash
nano .env
```

Add the following configuration (customize for your domain):

```bash
# Server Configuration
NODE_ENV=production
PORT=3010
HOST=0.0.0.0

# Domain Configuration
SERVER_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com

# SSL/TLS (if using HTTPS)
HTTPS=true
HTTPS_CERT=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
HTTPS_KEY=/etc/letsencrypt/live/yourdomain.com/privkey.pem

# Database (if using external DB)
# DATABASE_URL=your_database_url

# Analytics (optional)
STATS_ENABLED=false

# Email Configuration (optional)
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USERNAME=your-email@gmail.com
# EMAIL_PASSWORD=your-app-password

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-strong-password
```

Save and exit (Ctrl+X, then Y, then Enter)

## Step 9: Install and Configure Nginx (Reverse Proxy)

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/tawktoo
```

Add this configuration:

```nginx
# Author: Sanket - Nginx reverse proxy for tawktoo
upstream tawktoo_backend {
    server 127.0.0.1:3010;
    keepalive 64;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS (after SSL is configured)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://tawktoo_backend;
        proxy_http_version 1.1;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Increase max upload size
    client_max_body_size 100M;
}
```

Enable the site:

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/tawktoo /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## Step 10: Configure Firewall

```bash
# Allow HTTP, HTTPS, and SSH
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3010/tcp

# Enable firewall
sudo ufw enable
```

## Step 11: Install SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts and choose to redirect HTTP to HTTPS
```

After SSL is installed, update your Nginx config to uncomment the HTTPS redirect.

## Step 12: Start Application with PM2

```bash
# Navigate to project directory
cd /var/www/tawktoo

# Start the application
pm2 start app/src/Server.js --name tawktoo-sfu

# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Copy and run the command that PM2 outputs
```

## Step 13: Configure Domain DNS

In your GoDaddy domain settings:

1. Go to **DNS Management**
2. Add/Update **A Record**:
   - **Type**: A
   - **Name**: @ (for root domain) or www
   - **Value**: Your server IP address
   - **TTL**: 600 (or default)

3. Wait 10-30 minutes for DNS propagation

## Step 14: Verify Deployment

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs tawktoo-sfu

# Monitor in real-time
pm2 monit
```

Visit your domain: `https://yourdomain.com`

## Useful PM2 Commands

```bash
# Restart application
pm2 restart tawktoo-sfu

# Stop application
pm2 stop tawktoo-sfu

# View logs
pm2 logs tawktoo-sfu

# Monitor resources
pm2 monit

# Delete from PM2
pm2 delete tawktoo-sfu
```

## Updating Your Application

```bash
# Navigate to project directory
cd /var/www/tawktoo

# Pull latest changes
git pull origin main

# Install any new dependencies
npm install --production

# Restart application
pm2 restart tawktoo-sfu
```

## Troubleshooting

### Application won't start

```bash
# Check logs
pm2 logs tawktoo-sfu --lines 100

# Check if port is in use
sudo lsof -i :3010

# Restart PM2
pm2 restart tawktoo-sfu
```

### Nginx errors

```bash
# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### SSL certificate issues

```bash
# Renew certificate manually
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

### Can't access website

1. Check firewall: `sudo ufw status`
2. Check Nginx: `sudo systemctl status nginx`
3. Check PM2: `pm2 status`
4. Check DNS propagation: Use [whatsmydns.net](https://www.whatsmydns.net/)

## Performance Optimization

### Enable Gzip Compression

Edit Nginx config:

```bash
sudo nano /etc/nginx/nginx.conf
```

Add in `http` block:

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
```

### Set up Log Rotation

PM2 handles this automatically, but you can configure:

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## Security Best Practices

1. **Change default passwords** in `.env`
2. **Use strong JWT secret**
3. **Keep system updated**: `sudo apt update && sudo apt upgrade`
4. **Monitor logs regularly**: `pm2 logs`
5. **Set up automatic SSL renewal**: Certbot does this automatically
6. **Use fail2ban** to prevent brute force attacks:

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
```

## Support

If you encounter issues:
- Check PM2 logs: `pm2 logs tawktoo-sfu`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Verify DNS settings in GoDaddy
- Ensure firewall allows traffic on ports 80, 443

---

**Congratulations!** Your tawktoo application should now be live on GoDaddy! 🎉
