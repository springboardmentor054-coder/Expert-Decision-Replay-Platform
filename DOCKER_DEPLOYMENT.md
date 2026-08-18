# Docker Deployment Guide

## Quick Start

### Prerequisites
- Docker (version 20.10+)
- Docker Compose (version 1.29+)
- Make sure ports 3000, 8000, and 5432 are available

### Setup

1. **Clone and navigate to project root:**
   ```bash
   cd expert-decision-replay
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Update `.env` with your configuration:**
   - Change `SESSION_SECRET` to a strong random value
   - Update database credentials if needed
   - Set `CORS_ORIGINS` for your domain

4. **Build and start services:**
   ```bash
   docker-compose up -d
   ```

5. **Verify services are running:**
   ```bash
   docker-compose ps
   ```

### Accessing the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/api/docs
- **Database:** localhost:5432

## Common Commands

### View logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Stop services
```bash
docker-compose down
```

### Remove all data (including database)
```bash
docker-compose down -v
```

### Rebuild images
```bash
docker-compose build --no-cache
```

### Run backend tests in container
```bash
docker-compose run --rm backend pytest tests/
```

### Run database migrations
```bash
docker-compose run --rm backend python -m scripts.ensure_schema
```

## Production Deployment

### With Nginx (Optional)

To include Nginx reverse proxy:
```bash
docker-compose --profile with-nginx up -d
```

This will start Nginx on port 80 and 443.

### Environment Variables for Production

Create a production `.env` file with:
```
POSTGRES_PASSWORD=<strong-random-password>
SESSION_SECRET=<strong-random-secret>
CORS_ORIGINS=https://yourdomain.com
VITE_API_URL=https://yourdomain.com/api
BACKEND_PORT=8000
FRONTEND_PORT=3000
```

### SSL/TLS Configuration

For production, configure SSL certificates:
1. Place certificate files in nginx directory
2. Update `nginx.conf` with SSL configuration
3. Add ports 443 to docker-compose.yml

## Troubleshooting

### Database connection errors
1. Check database is running: `docker-compose ps postgres`
2. Verify DATABASE_URL in environment
3. Check network connectivity: `docker network ls`

### Frontend can't connect to API
1. Verify backend is running and healthy
2. Check CORS_ORIGINS setting
3. Verify VITE_API_URL in frontend environment

### Permission denied errors
1. Ensure Docker daemon is running
2. Check user is in docker group: `groups $USER`
3. May need to add user to docker group: `sudo usermod -aG docker $USER`

## Development Workflow

### Hot reload for development
```bash
# Comment out `volumes` in docker-compose.yml to use development mode
docker-compose -f docker-compose.dev.yml up
```

### Execute commands in running containers
```bash
# Backend
docker-compose exec backend bash

# Frontend
docker-compose exec frontend sh

# Database
docker-compose exec postgres psql -U edp_user -d expert_decision_replay
```

## Monitoring and Logging

### View real-time logs with filtering
```bash
docker-compose logs -f --tail=50 backend
```

### Access database directly
```bash
docker-compose exec postgres psql -U edp_user -d expert_decision_replay
```

### Check resource usage
```bash
docker stats
```
