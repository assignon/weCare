# Docker Setup for afriQExpress Shopper App

This document provides comprehensive instructions for building, running, and deploying the afriQExpress Shopper App using Docker.

## 📁 Docker Files Overview

- `Dockerfile` - Main production Dockerfile (multi-stage build)
- `Dockerfile.dev` - Development Dockerfile with hot reloading
- `nginx.conf` - Nginx configuration for production
- `docker-entrypoint.sh` - Startup script for environment variable injection
- `docker-compose.yml` - Local development and production setup
- `.dockerignore` - Files to exclude from Docker build context

## 🚀 Quick Start

### Development Mode

```bash
# Build and run development environment
docker-compose --profile dev up -d

# View logs
docker-compose logs -f shopper-dev

# Stop services
docker-compose down
```

### Production Mode

```bash
# Build and run production environment
docker-compose --profile prod up -d

# View logs
docker-compose logs -f shopper

# Stop services
docker-compose down
```

## 🔧 Environment Variables

Create a `.env` file in the shopper directory with the following variables:

```bash
# Firebase Configuration (Required for push notifications)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=afriqmarket-place.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=afriqmarket-place
VITE_FIREBASE_STORAGE_BUCKET=afriqmarket-place.firebasestorage.app
VITE_FIREBASE_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key

# API Configuration
VITE_API_URL=/api
```

## 🐳 Manual Docker Commands

### Building Images

```bash
# Development image
docker build -f Dockerfile.dev -t afriqexpress-shopper:dev .

# Production image
docker build -f Dockerfile -t afriqexpress-shopper:prod .
```

### Running Containers

#### Development Container
```bash
docker run -d \
  --name afriqexpress-shopper-dev \
  --network afriqexpress-network \
  -p 3001:3001 \
  -v $(pwd):/app \
  -v /app/node_modules \
  --env-file .env \
  afriqexpress-shopper:dev
```

#### Production Container
```bash
docker run -d \
  --name afriqexpress-shopper-prod \
  --network afriqexpress-network \
  -p 8081:8081 \
  --env-file .env \
  --restart unless-stopped \
  afriqexpress-shopper:prod
```

## 🏗️ Build Process

### Multi-Stage Production Build

The production Dockerfile uses a multi-stage build process:

1. **Build Stage**: Installs dependencies and builds the Vue.js application (includes service worker generation)
2. **Production Stage**: Serves the built application using Nginx

### Key Features

- **PWA Support**: Includes service worker generation for offline functionality
- **Optimized Size**: Only production files are included in the final image
- **Security**: Runs as non-root user
- **Performance**: Gzip compression and asset caching
- **Health Checks**: Built-in health monitoring
- **Environment Injection**: Runtime environment variable injection

## 🔒 Security Features

### Container Security
- Runs as non-root user (nginx:nginx)
- Minimal Alpine Linux base image
- Only necessary packages installed
- Proper file permissions

### HTTP Security Headers
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Content-Security-Policy configuration

## 🌐 Networking

### Port Configuration
- **Development**: Port 3001 (Vite dev server)
- **Production**: Port 8081 (Nginx)

### API Proxy
The production nginx configuration includes an API proxy that forwards requests from `/api` to the backend service.

## 📊 Monitoring & Health Checks

### Health Check Endpoint
- URL: `http://localhost:8081/health`
- Response: `healthy`
- Used by Docker health checks and load balancers

### Container Health Monitoring
```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' afriqexpress-shopper

# View health check logs
docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' afriqexpress-shopper
```

## 🚧 Development Workflow

### Live Development with Docker

1. **Start development container**:
   ```bash
   docker-compose --profile dev up -d
   ```

2. **Make changes**: Edit files in your local directory

3. **See changes**: Vite hot-reloading will automatically update the container

4. **View logs**:
   ```bash
   docker-compose logs -f shopper-dev
   ```

### Debugging

```bash
# Enter development container
docker exec -it afriqexpress-shopper-dev sh

# View build logs
docker-compose logs shopper-dev

# Check environment variables
docker exec afriqexpress-shopper-dev env | grep VITE
```

## 🔍 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear Docker cache
   docker builder prune -a
   
   # Rebuild without cache
   docker-compose build --no-cache
   ```

2. **Environment Variables Not Working**
   ```bash
   # Check if .env file exists and has correct format
   cat .env
   
   # Verify environment variables in container
   docker exec container_name env | grep VITE
   ```

3. **Permission Issues**
   ```bash
   # Check file permissions
   ls -la
   
   # Fix permission issues (if needed)
   sudo chown -R $USER:$USER .
   ```

4. **Network Connectivity**
   ```bash
   # Check if containers can communicate
   docker network inspect afriqexpress-network
   
   # Test API connectivity from container
   docker exec afriqexpress-shopper curl -f http://backend:8000/api/health
   ```

### Log Analysis

```bash
# Container logs
docker logs afriqexpress-shopper

# Detailed logs with timestamps
docker logs --timestamps --follow afriqexpress-shopper

# Nginx access logs (production only)
docker exec afriqexpress-shopper tail -f /var/log/nginx/access.log
```

## 🚀 Deployment

### Production Deployment

1. **Build production image**:
   ```bash
   docker build -t afriqexpress-shopper:latest .
   ```

2. **Tag for registry**:
   ```bash
   docker tag afriqexpress-shopper:latest your-registry.com/afriqexpress-shopper:latest
   ```

3. **Push to registry**:
   ```bash
   docker push your-registry.com/afriqexpress-shopper:latest
   ```

4. **Deploy on production server**:
   ```bash
   docker pull your-registry.com/afriqexpress-shopper:latest
   docker run -d --name shopper-app -p 8081:8081 --env-file .env.prod afriqexpress-shopper:latest
   ```

### Environment-Specific Configurations

Create different environment files:
- `.env.development` - Development environment
- `.env.staging` - Staging environment
- `.env.production` - Production environment

## 📈 Performance Optimization

### Build Optimization
- Uses npm ci for faster, reliable installs
- Multi-stage build reduces image size
- Only production dependencies in final image
- Service worker generation for PWA features

### Runtime Optimization
- Gzip compression enabled
- Static asset caching (1 year)
- Nginx optimized for Vue.js SPA routing
- PWA features for offline functionality

### Monitoring
```bash
# Check resource usage
docker stats afriqexpress-shopper

# Monitor container processes
docker exec afriqexpress-shopper ps aux
```

## 🔧 Customization

### Custom Nginx Configuration
Edit `nginx.conf` to customize:
- Proxy settings
- Security headers
- Cache policies
- SSL configuration

### Custom Environment Variables
Add new environment variables to:
1. `docker-entrypoint.sh` (for runtime injection)
2. `docker-compose.yml` (for container configuration)
3. Your Vue.js application code

## 🛍️ Shopper App Specific Features

### PWA Capabilities
- Offline functionality
- Push notifications
- App-like experience on mobile devices
- Service worker for background sync

### Shopping Features
- Product browsing and search
- Shopping cart management
- Order placement and tracking
- User authentication and profiles

## 📚 Additional Resources

- [Vue.js Documentation](https://vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Docker Best Practices](https://docs.docker.com/develop/best-practices/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [PWA Documentation](https://web.dev/progressive-web-apps/) 