# Kidokool Authentication Guide

## Overview

Kidokool has **three authentication systems** for different user types:

1. **Regular Users** - No authentication required
2. **Hosts/Presenters** - Login via `/login`
3. **Developers** - API key management via `/developer`
4. **Admins** - System management via `/admin`

---

## For Regular Users (Meeting Participants)

**No login required!** Simply:

1. Visit `https://yourdomain.com`
2. Enter a room name or use the suggested one
3. Click "Join Room"
4. Enter your name and join the meeting

---

## For Hosts/Presenters

### Accessing Host Login

1. Navigate to `https://yourdomain.com/login`
2. Or click "Host Login" in the navigation bar

### Default Credentials

Check your `.env` file or `config.js` for configured credentials:

```bash
# Example from .env
HOST_USERS=username:password,presenter:pass123
```

### Login Process

1. Enter your username and password
2. Click "Login"
3. You'll receive a JWT token
4. You can now create and manage rooms as a presenter

### Presenter Privileges

- Create rooms
- Lock/unlock rooms
- Enable/disable lobby
- Eject participants
- Record meetings (if enabled)
- Access active rooms list

---

## For Developers (API Integration)

### Accessing Developer Portal

1. Navigate to `https://yourdomain.com/developer`
2. Or click "Developer" in the navigation bar

### Registration

**First-time setup:**

1. Click "Register" tab
2. Fill in:
   - Company Name
   - Email
   - Password (minimum 8 characters)
3. Click "Create Account"

### Login

1. Enter your email and password
2. Click "Login"
3. You'll receive a JWT token (stored automatically)

### Generating API Keys

1. After login, click "Generate New Key"
2. Enter a descriptive name (e.g., "Production API Key")
3. Click "Generate"
4. **IMPORTANT**: Copy and save the API key immediately - it won't be shown again!

### Using API Keys

#### Create a Meeting

```bash
POST /api/v1/meeting
Authorization: YOUR_API_KEY

Response:
{
  "meeting": "https://yourdomain.com/join/room-id"
}
```

#### Generate Join URL

```bash
POST /api/v1/join
Authorization: YOUR_API_KEY
Content-Type: application/json

{
  "room": "room-id",
  "name": "Participant Name",
  "audio": true,
  "video": true,
  "screen": false,
  "notify": true
}

Response:
{
  "join": "https://yourdomain.com/join/room-id?name=..."
}
```

#### Get Meeting Token

```bash
POST /api/v1/token
Authorization: YOUR_API_KEY
Content-Type: application/json

{
  "room": "room-id",
  "presenter": true
}

Response:
{
  "token": "jwt-token-here"
}
```

### API Key Management

- View all your API keys in the dashboard
- See when each key was created
- Check last used date
- Monitor active/inactive status

---

## For Admins (System Management)

### Accessing Admin Portal

1. Navigate to `https://yourdomain.com/admin`
2. Or click "Admin" in the navigation bar

### Getting Admin Access

**Option 1: Login as Admin Developer**

1. Register a developer account via `/developer`
2. Manually update the database to set `role = 'admin'`:

```sql
UPDATE Tenants SET role = 'admin' WHERE email = 'your-email@example.com';
```

3. Login via `/api/v1/auth/login` to get JWT token

**Option 2: Use Existing Admin Token**

If you already have an admin JWT token, enter it directly in the admin portal.

### Admin Dashboard Features

#### System Stats

- Total Developers
- Active API Keys
- Active Rooms

#### Developer Management

- View all registered developers
- See developer details (name, email, plan, status)
- Ban/Unban developers
- Monitor developer activity

#### API Endpoints

**Get System Stats:**
```bash
GET /api/v1/admin/stats
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
```

**Get All Developers:**
```bash
GET /api/v1/admin/tenants
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
```

**Update Developer Status:**
```bash
PUT /api/v1/admin/tenants/:id/status
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
Content-Type: application/json

{
  "status": "banned"  // or "active"
}
```

---

## Configuration

### Environment Variables

Key authentication-related environment variables:

```bash
# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=24h

# Host Protection
HOST_PROTECTED=true
HOST_USER_AUTH=true
HOST_USERS=username:password,presenter:pass123

# Presenter Configuration
PRESENTERS=username,presenter
PRESENTER_JOIN_FIRST=false

# API Configuration
API_KEY_SECRET=your-api-secret-here
```

### Config File

Check `app/src/config.js` for detailed configuration options:

```javascript
security: {
    jwt: {
        key: process.env.JWT_SECRET || 'kidokool_sfu_secret',
        exp: process.env.JWT_EXPIRATION || '1h',
    },
},
host: {
    protected: process.env.HOST_PROTECTED === 'true',
    user_auth: process.env.HOST_USER_AUTH === 'true',
    users: parseHostUsers(process.env.HOST_USERS),
    presenters: {
        list: parsePresentersList(process.env.PRESENTERS),
        join_first: process.env.PRESENTER_JOIN_FIRST === 'true',
    },
},
```

---

## Security Best Practices

### For Developers

- ✅ Store API keys securely (environment variables, secret managers)
- ✅ Use different keys for development and production
- ✅ Rotate API keys regularly
- ✅ Never commit API keys to version control
- ❌ Don't share API keys publicly

### For Admins

- ✅ Use strong JWT secrets
- ✅ Set appropriate token expiration times
- ✅ Monitor developer activity regularly
- ✅ Ban suspicious accounts immediately
- ❌ Don't share admin tokens

### For Hosts

- ✅ Use strong passwords
- ✅ Enable host protection in production
- ✅ Limit presenter list to trusted users
- ❌ Don't use default credentials in production

---

## Troubleshooting

### "Unauthorized" Error

**For Developers:**
- Check if your API key is correct
- Verify the key is active (not revoked)
- Ensure you're using the `Authorization` header

**For Admins:**
- Check if your JWT token is expired
- Verify you have admin role in database
- Try logging in again to get a fresh token

### "Invalid Credentials" Error

**For Hosts:**
- Verify username and password in `.env` file
- Check if `HOST_USER_AUTH=true` is set
- Ensure credentials match exactly (case-sensitive)

### Can't Access Admin Portal

- Verify `/admin` route is accessible
- Check if you have admin role in database
- Try clearing browser cache and cookies
- Ensure JWT token is valid and not expired

---

## Quick Reference

| User Type | URL | Authentication Method |
|-----------|-----|----------------------|
| Regular User | `/` | None required |
| Host/Presenter | `/login` | Username + Password |
| Developer | `/developer` | Email + Password → JWT |
| Admin | `/admin` | JWT Token (admin role) |

---

## Support

For issues or questions:
- Check the [GitHub Issues](https://github.com/SanketsMane/Online-Meet-Platform.git/issues)
- Review the [Official Documentation](https://docs.kidokool.com)
- Contact support: miroslav.pejic.85@gmail.com
