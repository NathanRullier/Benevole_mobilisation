# Deployment Documentation

## 1. Infrastructure Overview

### 1.1 Technology Stack
- **Frontend**: React.js with Nginx
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Cache**: Redis
- **Container**: Docker
- **Cloud**: AWS (ECS, RDS, ElastiCache)

### 1.2 Environment Setup
- **Development**: Local Docker containers
- **Staging**: AWS ECS Fargate
- **Production**: AWS ECS with Auto Scaling

## 2. Development Deployment

### 2.1 Local Setup
```bash
# Clone repository
git clone https://github.com/educaloi/volunteer-platform.git

# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# Run migrations
npm run db:migrate

# Start application
npm run dev
```

### 2.2 Development Docker Compose
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: volunteer_platform_dev
      POSTGRES_USER: dev_user  
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://dev_user:dev_password@postgres:5432/volunteer_platform_dev
```

## 3. Staging Deployment

### 3.1 AWS ECS Configuration
- **Cluster**: volunteer-platform-staging
- **Service**: Frontend and Backend services
- **Task Definition**: Fargate compatibility
- **Load Balancer**: Application Load Balancer

### 3.2 Staging Deployment Script
```bash
#!/bin/bash
echo "Deploying to staging..."

# Build images
docker build -t volunteer-frontend:staging ./frontend
docker build -t volunteer-backend:staging ./backend

# Push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_REGISTRY
docker tag volunteer-frontend:staging $ECR_REGISTRY/volunteer-frontend:staging
docker push $ECR_REGISTRY/volunteer-frontend:staging

# Update ECS service
aws ecs update-service --cluster staging --service volunteer-platform --force-new-deployment
```

## 4. Production Deployment

### 4.1 Production Infrastructure
- **Frontend**: React app served by Nginx
- **Backend**: Node.js API with multiple instances
- **Database**: AWS RDS PostgreSQL (Multi-AZ)
- **Cache**: AWS ElastiCache Redis
- **CDN**: AWS CloudFront
- **SSL**: AWS Certificate Manager

### 4.2 Production Docker Configuration
```dockerfile
# Frontend Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

## 5. CI/CD Pipeline

### 5.1 GitHub Actions Workflow
```yaml
name: Deploy Application
on:
  push:
    branches: [main, staging]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run test:e2e

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster production --service volunteer-platform --force-new-deployment
```

## 6. Database Management

### 6.1 Migration Strategy
```javascript
// Database migration example
exports.up = function(knex) {
  return knex.schema.createTable('users', table => {
    table.uuid('id').primary();
    table.string('email').unique().notNullable();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.timestamps(true, true);
  });
};
```

### 6.2 Backup Strategy
- **Automated backups**: Daily RDS snapshots
- **Manual backups**: Before major deployments
- **Retention**: 30 days for automated, 1 year for manual

## 7. Monitoring and Logging

### 7.1 Application Monitoring
- **Health checks**: `/health` endpoint
- **Metrics**: CloudWatch metrics
- **Alerting**: SNS notifications for critical issues
- **Logging**: CloudWatch Logs

### 7.2 Performance Monitoring
- **Response times**: Average < 500ms
- **Error rates**: < 1%
- **Uptime**: 99.9% target
- **Database performance**: Query optimization

## 8. Security Configuration

### 8.1 SSL/TLS Setup
- **Certificate**: AWS Certificate Manager
- **Protocols**: TLS 1.2+
- **HSTS**: Enabled
- **Security headers**: Implemented

### 8.2 Network Security
- **VPC**: Private subnets for database
- **Security groups**: Restrictive rules
- **WAF**: Web Application Firewall enabled
- **Secrets**: AWS Secrets Manager

## 9. Scaling Configuration

### 9.1 Auto Scaling
- **Frontend**: 2-5 instances based on CPU
- **Backend**: 3-10 instances based on memory/CPU
- **Database**: Read replicas for scaling
- **Cache**: Redis cluster mode

### 9.2 Load Balancing
- **Algorithm**: Round robin
- **Health checks**: Every 30 seconds
- **Sticky sessions**: Disabled
- **SSL termination**: At load balancer

## 10. Backup and Recovery

### 10.1 Backup Procedures
```bash
# Database backup
aws rds create-db-snapshot --db-instance-identifier volunteer-platform --db-snapshot-identifier backup-$(date +%Y%m%d)

# Application backup
aws s3 sync /app/uploads s3://volunteer-platform-backups/uploads/
```

### 10.2 Disaster Recovery
- **RTO**: 4 hours (Recovery Time Objective)
- **RPO**: 1 hour (Recovery Point Objective)
- **Multi-region**: Backup region configured
- **Failover**: Manual process with documented procedures

## 11. Deployment Checklist

### 11.1 Pre-Deployment
- [ ] All tests passing
- [ ] Code review completed
- [ ] Database migrations tested
- [ ] Backup completed
- [ ] Monitoring configured

### 11.2 Post-Deployment
- [ ] Health checks passing
- [ ] Application functionality verified
- [ ] Performance metrics normal
- [ ] Error logs reviewed
- [ ] User acceptance testing

## 12. Troubleshooting

### 12.1 Common Issues
```bash
# Check service status
aws ecs describe-services --cluster production --services volunteer-platform

# View logs
aws logs tail /aws/ecs/volunteer-platform --follow

# Database connection test
docker exec backend npm run db:test

# Health check
curl https://api.educaloi-volunteers.ca/health
```

### 12.2 Rollback Procedure
```bash
# Emergency rollback
aws ecs update-service --cluster production --service volunteer-platform --task-definition previous-stable-version

# Verify rollback
aws ecs wait services-stable --cluster production --services volunteer-platform
``` 