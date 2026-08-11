# Production Deployment Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed
- Domain name configured
- SSL certificate (recommended)

## Backend Deployment

### 1. Environment Setup

Copy the example environment file and configure it:

```bash
cd backend
cp .env.example .env
```

Edit `.env` with production values:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database Configuration
DB_HOST=your-production-db-host
DB_PORT=5432
DB_NAME=lms_database
DB_USER=your_db_user
DB_PASSWORD=your_secure_db_password

# JWT Configuration
JWT_SECRET=generate_a_strong_random_secret_at_least_32_chars
JWT_EXPIRES_IN=7d

# CORS Configuration (comma-separated for multiple origins)
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

**Important Security Notes:**
- Use strong, unique passwords for database
- Generate a cryptographically secure JWT secret (use `openssl rand -base64 32`)
- Never commit `.env` file to version control
- Use environment-specific CORS origins

### 2. Install Dependencies

```bash
cd backend
npm install --production
```

### 3. Database Setup

Run database setup script:

```bash
npm run setup-db
```

For production, consider:
- Using connection pooling
- Setting up read replicas for scaling
- Configuring automated backups
- Enabling SSL for database connections

### 4. Start the Server

Using PM2 (recommended for production):

```bash
npm install -g pm2
pm2 start src/server.js --name lms-backend
pm2 save
pm2 startup
```

Or using Node directly:

```bash
npm start
```

### 5. Configure Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
    }

    location /uploads {
        proxy_pass http://localhost:3000/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

## Frontend Deployment

### 1. Environment Setup

Create `.env` file in the frontend directory:

```bash
cd frontend
cp .env.example .env
```

Edit `.env` with production values:

```env
VITE_API_URL=https://api.yourdomain.com/api
```

### 2. Install Dependencies

```bash
cd frontend
npm install
```

### 3. Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### 4. Deploy to Static Hosting

#### Option A: Vercel (Recommended)

```bash
npm install -g vercel
vercel --prod
```

#### Option B: Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### Option C: Nginx

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    root /path/to/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Security Checklist

- [ ] All environment variables are set with strong values
- [ ] JWT_SECRET is cryptographically secure
- [ ] Database credentials are strong
- [ ] CORS is configured to only allow trusted origins
- [ ] SSL/TLS is enabled for all connections
- [ ] Rate limiting is configured
- [ ] Security headers (Helmet) are enabled
- [ ] File upload limits are appropriate
- [ ] Database backups are automated
- [ ] Logging is configured for monitoring
- [ ] Error messages don't leak sensitive information in production

## Monitoring & Maintenance

### Health Checks

The backend includes a health check endpoint:

```bash
curl https://api.yourdomain.com/api/health
```

### Logs

Monitor application logs:

```bash
pm2 logs lms-backend
```

### Database Backups

Set up automated PostgreSQL backups:

```bash
# Daily backup
pg_dump -h localhost -U postgres lms_database > backup_$(date +%Y%m%d).sql
```

## Scaling Considerations

### Horizontal Scaling

- Use a load balancer (Nginx, HAProxy)
- Deploy multiple backend instances behind the load balancer
- Use Redis for session storage if needed
- Consider CDN for static assets

### Database Scaling

- Use connection pooling (already configured with max 20)
- Consider read replicas for read-heavy operations
- Implement database indexing for frequently queried fields
- Monitor query performance

## Troubleshooting

### Backend won't start

1. Check environment variables are set
2. Verify database connection
3. Check port availability
4. Review logs: `pm2 logs lms-backend`

### Frontend build fails

1. Verify VITE_API_URL is set
2. Check Node.js version (18+)
3. Clear cache: `rm -rf node_modules package-lock.json && npm install`

### CORS errors

1. Verify CORS_ORIGIN includes your frontend domain
2. Check that frontend is using HTTPS in production
3. Ensure API URL is correct in frontend .env

## Post-Deployment

1. Test all user flows (login, course creation, enrollment)
2. Verify file uploads work correctly
3. Test error handling
4. Monitor performance metrics
5. Set up alerting for errors
6. Configure automated backups
7. Review security headers with tools like securityheaders.com
