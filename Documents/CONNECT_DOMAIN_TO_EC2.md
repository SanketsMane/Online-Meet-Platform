# Connect GoDaddy Domain to AWS EC2 - Complete Guide

This guide will help you connect your GoDaddy domain to your AWS EC2 instance running at `15.134.88.100`.

## Prerequisites

- ✅ GoDaddy domain purchased
- ✅ AWS EC2 instance running at `15.134.88.100`
- ✅ Application running on port `3010`
- ✅ SSH access to EC2 instance

## Step 1: Configure DNS in GoDaddy

### A. Log into GoDaddy

1. Go to [GoDaddy.com](https://www.godaddy.com)
2. Click **Sign In**
3. Go to **My Products**

### B. Access DNS Management

1. Find your domain in the list
2. Click the **DNS** button next to your domain
3. You'll see the DNS Management page

### C. Add/Update A Records

> [!IMPORTANT]
> You need to create TWO A records - one for the root domain and one for www subdomain.

**For Root Domain (@):**

1. Click **Add** (or edit existing A record)
2. Set the following:
   - **Type**: `A`
   - **Name**: `@` (this represents your root domain)
   - **Value**: `15.134.88.100` (your EC2 IP)
   - **TTL**: `600` (10 minutes) or `3600` (1 hour)
3. Click **Save**

**For WWW Subdomain:**

1. Click **Add** again
2. Set the following:
   - **Type**: `A`
   - **Name**: `www`
   - **Value**: `15.134.88.100` (your EC2 IP)
   - **TTL**: `600` (10 minutes) or `3600` (1 hour)
3. Click **Save**

### D. Remove Conflicting Records (if any)

> [!WARNING]
> If you see existing A records pointing to different IPs or CNAME records for @ or www, DELETE them first.

Common records to remove:
- Old A records with different IPs
- CNAME records for @ or www
- Parked domain records

## Step 2: Configure Nginx on EC2

Now we need to set up Nginx as a reverse proxy on your EC2 instance.

### A. SSH into Your EC2 Instance

```bash
ssh -i /Users/sanket/Documents/Online-Meeting/Kidokool-latest-key.pem ubuntu@15.134.88.100
```

### B. Install Nginx (if not already installed)

```bash
# Update system
sudo apt update

# Install Nginx
sudo apt install -y nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### C. Create Nginx Configuration

Replace `yourdomain.com` with your actual domain:

```bash
# Create configuration file
sudo nano /etc/nginx/sites-available/tawktoo
```

Paste this configuration (replace `yourdomain.com` with your actual domain):

```nginx
# Author: Sanket - Nginx configuration for tawktoo on GoDaddy domain
upstream tawktoo_backend {
    server 127.0.0.1:3010;
    keepalive 64;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Increase max upload size
    client_max_body_size 100M;

    location / {
        proxy_pass http://tawktoo_backend;
        proxy_http_version 1.1;
        
        # WebSocket support (critical for video calls)
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
}
```

Save and exit (Ctrl+X, then Y, then Enter)

### D. Enable the Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/tawktoo /etc/nginx/sites-enabled/

# Remove default site (if exists)
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# If test passes, restart Nginx
sudo systemctl restart nginx
```

## Step 3: Configure AWS Security Group

You need to allow HTTP and HTTPS traffic to your EC2 instance.

### A. Open AWS Console

1. Go to [AWS EC2 Console](https://console.aws.amazon.com/ec2/)
2. Click on **Instances** in the left sidebar
3. Find your instance (the one with IP `15.134.88.100`)
4. Click on the **Security** tab
5. Click on the **Security Group** link

### B. Add Inbound Rules

Click **Edit inbound rules** and add:

| Type  | Protocol | Port Range | Source    | Description          |
|-------|----------|------------|-----------|----------------------|
| HTTP  | TCP      | 80         | 0.0.0.0/0 | Allow HTTP traffic   |
| HTTPS | TCP      | 443        | 0.0.0.0/0 | Allow HTTPS traffic  |
| SSH   | TCP      | 22         | Your IP   | SSH access           |

Click **Save rules**

## Step 4: Update Application Configuration

Update your `.env` file to use the domain instead of IP:

```bash
# SSH into EC2
ssh -i /Users/sanket/Documents/Online-Meeting/Kidokool-latest-key.pem ubuntu@15.134.88.100

# Navigate to project directory
cd /var/www/tawktoo  # or wherever your project is

# Edit .env file
nano .env
```

Update these values (replace `yourdomain.com` with your actual domain):

```bash
# Server Configuration
NODE_ENV=production
PORT=3010
HOST=0.0.0.0

# Domain Configuration
SERVER_URL=http://yourdomain.com
CORS_ORIGIN=http://yourdomain.com

# When SSL is configured, change to https://
# SERVER_URL=https://yourdomain.com
# CORS_ORIGIN=https://yourdomain.com
```

Save and restart the application:

```bash
# Restart PM2
pm2 restart tawktoo-sfu

# Check status
pm2 status
```

## Step 5: Wait for DNS Propagation

DNS changes can take time to propagate:

- **Minimum**: 10-30 minutes
- **Maximum**: 24-48 hours (rare)
- **Typical**: 1-2 hours

### Check DNS Propagation

Use online tools to check if DNS has propagated:

1. **whatsmydns.net**: https://www.whatsmydns.net/
   - Enter your domain
   - Select "A" record type
   - Should show `15.134.88.100`

2. **Command line** (on your Mac):
   ```bash
   # Check DNS resolution
   nslookup yourdomain.com
   
   # Should return:
   # Address: 15.134.88.100
   ```

## Step 6: Test Your Domain

Once DNS has propagated:

1. Open browser and go to: `http://yourdomain.com`
2. You should see your tawktoo application
3. Test functionality:
   - ✅ Landing page loads
   - ✅ Navbar is styled correctly
   - ✅ Can join a room
   - ✅ Video calls work

## Step 7: Install SSL Certificate (HTTPS)

> [!IMPORTANT]
> **Wait for DNS to fully propagate before installing SSL!**

Once your domain is working with HTTP, add HTTPS:

```bash
# SSH into EC2
ssh -i /Users/sanket/Documents/Online-Meeting/Kidokool-latest-key.pem ubuntu@15.134.88.100

# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts:
# 1. Enter your email
# 2. Agree to terms
# 3. Choose to redirect HTTP to HTTPS (recommended)
```

Certbot will automatically:
- Generate SSL certificates
- Update Nginx configuration
- Set up auto-renewal

### Update .env for HTTPS

```bash
cd /var/www/tawktoo
nano .env
```

Change to HTTPS:

```bash
SERVER_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com
HTTPS=true
```

Restart application:

```bash
pm2 restart tawktoo-sfu
```

## Step 8: Verify Everything Works

### Test HTTP → HTTPS Redirect

1. Go to: `http://yourdomain.com`
2. Should automatically redirect to: `https://yourdomain.com`
3. Should see a padlock 🔒 in the browser address bar

### Test WWW Redirect

1. Go to: `http://www.yourdomain.com`
2. Should redirect to: `https://yourdomain.com`

### Test Application Features

1. ✅ Landing page loads with HTTPS
2. ✅ Join a room
3. ✅ Video/audio works
4. ✅ Screen sharing works
5. ✅ Admin login works
6. ✅ Developer portal works

## Troubleshooting

### Domain not resolving

```bash
# Check DNS on your Mac
nslookup yourdomain.com

# Should show: 15.134.88.100
# If not, wait longer for DNS propagation
```

### "Connection refused" error

```bash
# SSH into EC2
ssh -i /Users/sanket/Documents/Online-Meeting/Kidokool-latest-key.pem ubuntu@15.134.88.100

# Check Nginx status
sudo systemctl status nginx

# Check if Nginx is listening on port 80
sudo netstat -tlnp | grep :80

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Application not loading

```bash
# Check PM2 status
pm2 status

# Check application logs
pm2 logs tawktoo-sfu

# Restart if needed
pm2 restart tawktoo-sfu
```

### SSL certificate fails

> [!WARNING]
> Common reasons:
> - DNS not fully propagated yet (wait 1-2 hours)
> - Port 80 not open in Security Group
> - Nginx not running

```bash
# Check if port 80 is accessible
curl http://yourdomain.com

# If this works, try Certbot again
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### WebSocket connection issues

If video calls don't work after adding domain:

```bash
# Edit Nginx config
sudo nano /etc/nginx/sites-available/tawktoo

# Ensure these lines are present:
# proxy_set_header Upgrade $http_upgrade;
# proxy_set_header Connection "upgrade";

# Restart Nginx
sudo systemctl restart nginx
```

## Quick Reference

### Your Configuration

- **EC2 IP**: `15.134.88.100`
- **Application Port**: `3010`
- **SSH Key**: `/Users/sanket/Documents/Online-Meeting/Kidokool-latest-key.pem`
- **Project Path**: `/var/www/tawktoo` (verify this)

### DNS Records in GoDaddy

| Type | Name | Value           | TTL  |
|------|------|-----------------|------|
| A    | @    | 15.134.88.100   | 600  |
| A    | www  | 15.134.88.100   | 600  |

### Useful Commands

```bash
# SSH into EC2
ssh -i /Users/sanket/Documents/Online-Meeting/Kidokool-latest-key.pem ubuntu@15.134.88.100

# Check Nginx
sudo systemctl status nginx
sudo nginx -t

# Check PM2
pm2 status
pm2 logs tawktoo-sfu

# Restart services
sudo systemctl restart nginx
pm2 restart tawktoo-sfu

# Check SSL certificate
sudo certbot certificates

# Renew SSL (auto-renews, but can test)
sudo certbot renew --dry-run
```

## Timeline

| Step | Time Required |
|------|---------------|
| Configure DNS in GoDaddy | 5 minutes |
| DNS Propagation | 30 min - 2 hours |
| Configure Nginx on EC2 | 10 minutes |
| Install SSL Certificate | 5 minutes |
| **Total** | **1-3 hours** |

---

**Congratulations!** Once complete, your tawktoo application will be live at your custom domain with HTTPS! 🎉
