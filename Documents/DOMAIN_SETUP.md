# Domain Setup Guide for tawktoo.com

This guide explains how to connect your GoDaddy domain (`tawktoo.com`) to your EC2 instance.

## Prerequisites
1.  Access to your **GoDaddy Domain Control Center**.
2.  The **Public IPv4 Address** of your AWS EC2 instance (e.g., `54.x.x.x`).

## Step 1: Configure DNS on GoDaddy

1.  Log in to GoDaddy and go to **My Products** > **Domains**.
2.  Find `tawktoo.com` and click **DNS** (or "Manage DNS").
3.  Add (or edit) the following **A Records**:

| Type | Name | Value | TTL |
| :--- | :--- | :--- | :--- |
| **A** | `@` | `YOUR_EC2_PUBLIC_IP` | 600 seconds |
| **A** | `sfu` | `YOUR_EC2_PUBLIC_IP` | 600 seconds |
| **A** | `www` | `YOUR_EC2_PUBLIC_IP` | 600 seconds |

> **Note**: Replace `YOUR_EC2_PUBLIC_IP` with the actual IP address of your server.

## Step 2: Update Server Configuration (After DNS Propagation)

Once the DNS records have propagated (check using [whatsmydns.net](https://whatsmydns.net/#A/tawktoo.com)):

1.  **SSH into your EC2 instance**.
2.  **Update `.env`**:
    ```bash
    nano .env
    ```
    Ensure `HOST_URL` and `OG_URL` point to `https://tawktoo.com` or `https://sfu.tawktoo.com`.

3.  **Generate SSL Certificates (Certbot)**:
    If you haven't already, run Certbot to get SSL certificates for the new domain:
    ```bash
    sudo certbot certonly --standalone -d tawktoo.com -d sfu.tawktoo.com
    ```

4.  **Restart the Application**:
    ```bash
    pm2 restart all
    ```

## Step 3: Verify Verification

1.  Open `https://tawktoo.com` in your browser.
2.  You should see the **tawktoo** landing page with the new logo.
