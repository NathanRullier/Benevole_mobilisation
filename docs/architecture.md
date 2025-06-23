# Architecture Documentation - Volunteer Management Platform

## 1. System Overview

### 1.1 Architecture Style
- **Pattern**: Microservices-oriented with monolithic deployment initially
- **Frontend**: Single Page Application (SPA) with React.js
- **Backend**: RESTful API with Node.js/Express.js
- **Initial Storage**: JSON files (MVP phase)
- **Future Database**: PostgreSQL with Redis for caching
- **Deployment**: Local development initially, then containerized with Docker

### 1.2 High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Browser   │    │   Mobile App    │    │ Email Clients   │
│   (React SPA)   │    │   (Future)      │    │   (Triggers)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌───────────────────────▼───────────────────────┐
         │              Load Balancer                    │
         │            (NGINX/CloudFlare)                 │
         └───────────────────────┬───────────────────────┘
                                 │
         ┌───────────────────────▼───────────────────────┐
         │              API Gateway                      │
         │          (Express.js Router)                  │
         └───────────────────────┬───────────────────────┘
                                 │
    ┌────────────────────────────┼────────────────────────────┐
    │                            │                            │
    ▼                            ▼                            ▼
┌─────────┐              ┌─────────────┐              ┌─────────────┐
│  Auth   │              │   Core API  │              │ Notification│
│ Service │              │   Service   │              │   Service   │
└─────────┘              └─────────────┘              └─────────────┘
    │                            │                            │
    └────────────────────────────┼────────────────────────────┘
                                 │
         ┌───────────────────────▼───────────────────────┐
         │           Data Layer                          │
         │  PostgreSQL + Redis + File Storage           │
         └───────────────────────────────────────────────┘
```

## 2. Frontend Architecture

### 2.1 React.js Application Structure
```
src/
├── components/           # Reusable UI components
│   ├── common/          # Generic components (buttons, forms, etc.)
│   ├── volunteer/       # Volunteer-specific components
│   ├── workshop/        # Workshop-related components
│   └── admin/           # Admin interface components
├── pages/               # Route-based page components
│   ├── Dashboard/       # User dashboards
│   ├── Profile/         # User profiles
│   ├── Workshops/       # Workshop management
│   ├── Training/        # Training modules
│   └── Community/       # Community features
├── services/            # API communication layer
├── hooks/               # Custom React hooks
├── utils/               # Helper functions
├── store/               # State management (Redux/Zustand)
├── styles/              # Global styles and themes
└── assets/              # Static assets
```

### 2.2 Key Frontend Technologies
- **React 18+** with hooks and functional components
- **TypeScript** for type safety
- **React Router** for navigation
- **Material-UI or Ant Design** for UI components
- **Redux Toolkit** or **Zustand** for state management
- **React Query** for API state management
- **Formik/React Hook Form** for form handling
- **Chart.js/Recharts** for analytics visualization

### 2.3 Responsive Design Strategy
- **Mobile-first** approach
- **Breakpoints**: Mobile (320px), Tablet (768px), Desktop (1024px+)
- **Progressive Web App** capabilities
- **Offline-first** for critical features

## 3. Backend Architecture

### 3.1 Node.js API Structure
```
src/
├── controllers/         # Request handlers
│   ├── auth.js         # Authentication endpoints
│   ├── volunteers.js   # Volunteer management
│   ├── workshops.js    # Workshop operations
│   ├── training.js     # Training modules
│   └── analytics.js    # Reporting endpoints
├── services/           # Business logic layer
│   ├── userService.js  # User operations
│   ├── matchingService.js # Workshop-volunteer matching
│   ├── notificationService.js # Email/SMS notifications
│   └── analyticsService.js # Data analysis
├── models/             # Database models (Sequelize/Prisma)
├── middleware/         # Custom middleware
│   ├── auth.js        # Authentication middleware
│   ├── validation.js  # Input validation
│   └── rateLimiting.js # Rate limiting
├── routes/             # API route definitions
├── utils/              # Helper functions
├── config/             # Configuration files
└── tests/              # Test suites
```

### 3.2 Core Services Architecture

#### 3.2.1 Authentication Service
- **JWT-based authentication**
- **Role-based access control** (RBAC)
- **OAuth integration** with professional associations
- **Multi-factor authentication** support
- **Session management** with Redis

#### 3.2.2 Volunteer Management Service
- **Profile management**
- **Skill/expertise tracking**
- **Availability management**
- **Certification tracking**
- **Geographic location services**

#### 3.2.3 Workshop Management Service
- **Workshop lifecycle management**
- **Automated matching algorithms**
- **Scheduling and calendar integration**
- **Feedback and rating system**
- **Resource management**

#### 3.2.4 Training Service
- **Learning path management**
- **Progress tracking**
- **Assessment and certification**
- **Resource library**
- **Interactive content delivery**

#### 3.2.5 Communication Service
- **Email automation**
- **SMS notifications**
- **In-app messaging**
- **Newsletter management**
- **Template management**

#### 3.2.6 Analytics Service
- **User behavior tracking**
- **Performance metrics**
- **Reporting dashboard data**
- **Predictive analytics**
- **Export capabilities**

## 4. Data Storage Architecture

### 4.1 MVP Phase: JSON File Storage (Current Implementation)

#### 4.1.1 JSON File Structure
```
data/
├── users.json              # User accounts and authentication (IMPLEMENTED)
├── volunteer-profiles.json # Extended volunteer information  
├── workshops.json          # Workshop templates and details
├── workshop-sessions.json  # Scheduled workshop instances
├── applications.json       # Volunteer applications
├── messages.json          # User communications
├── notifications.json     # System notifications
└── system-config.json     # Application configuration
```

#### 4.1.2 JsonStorage Service Implementation
Our JSON storage system uses a robust `JsonStorage` class that provides:

```javascript
// JsonStorage Class Features (backend/utils/jsonStorage.js)
class JsonStorage {
  // Atomic write operations with file locking
  async write(data)           // Write data with backup creation
  async read()                // Read data with corruption recovery
  async addRecord(collection, record)     // Add new record with UUID
  async updateRecord(collection, id, data) // Update existing record
  async deleteRecord(collection, id)      // Delete record by ID
  async findRecords(collection, criteria) // Query records
  
  // Safety features
  validateData(data)          // JSON schema validation
  createBackup()              // Automatic backup before writes
  recoverFromBackup()         // Restore from backup if corrupted
  acquireLock()              // File locking for atomic operations
  generateId()               // UUID generation for new records
}
```

#### 4.1.3 Implemented JSON Data Models
```javascript
// users.json structure
{
  "users": [
    {
      "id": "uuid-v4",
      "email": "volunteer@example.com",
      "passwordHash": "bcrypt-hash",
      "firstName": "John",
      "lastName": "Doe", 
      "role": "volunteer|coordinator|admin",
      "status": "pending|verified|suspended",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "lastLogin": "2024-01-01T00:00:00Z"
    }
  ]
}

// volunteer-profiles.json structure
{
  "profiles": [
    {
      "userId": "uuid-v4",
      "barAssociation": "Barreau du Québec",
      "licenseNumber": "12345",
      "specializations": ["Corporate Law", "Employment Law"],
      "experienceYears": 8,
      "languages": ["French", "English"],
      "regions": ["Montreal", "Quebec City"],
      "bio": "Experienced lawyer...",
      "photoUrl": "/uploads/photos/user-id.jpg",
      "availabilityPreferences": {
        "daysOfWeek": ["Monday", "Wednesday"],
        "timeSlots": ["morning", "afternoon"],
        "maxWorkshopsPerMonth": 4
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}

// workshops.json structure
{
  "workshops": [
    {
      "id": "uuid-v4",
      "title": "Introduction to Employment Rights",
      "description": "Basic employment law workshop",
      "type": "school|library|community",
      "duration": 90,
      "targetAudience": "High school students",
      "maxParticipants": 25,
      "createdBy": "coordinator-user-id",
      "status": "active|inactive",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 4.1.4 JSON Management Features (IMPLEMENTED)
- **Atomic Operations**: Read-modify-write operations with file locking ✅
- **Backup Strategy**: Automatic backup before each write operation ✅
- **Validation**: JSON schema validation for data integrity ✅
- **Error Recovery**: Rollback capability from backup files ✅
- **UUID Generation**: Unique ID generation for all records ✅
- **File Safety**: Directory creation, path validation, error handling ✅

**Authentication Storage**: Currently implemented in `data/users.json` with:
- JWT session management
- bcrypt password hashing (12 salt rounds)
- Role-based user management (volunteer/coordinator)
- Session tracking with login timestamps
- Automatic user data validation

### 4.2 Future PostgreSQL Schema Design

#### 4.2.1 Migration Planning
- **Phase 4 Migration**: Transition from JSON to PostgreSQL (Weeks 17-18)
- **Data Migration Scripts**: Automated conversion from JSON to relational structure
- **Zero-Downtime Migration**: Gradual transition with data synchronization

#### 4.2.2 PostgreSQL Schema (Future Implementation)
```sql
-- Users table (volunteers, coordinators, organizers)
users (
  id, email, password_hash, role, status,
  first_name, last_name, phone, 
  created_at, updated_at, last_login
)

-- Professional profiles
volunteer_profiles (
  user_id, bar_association, license_number,
  specializations[], experience_years,
  availability_preferences, bio, photo_url
)

-- Workshops
workshops (
  id, title, description, type, duration,
  target_audience, max_participants,
  created_by, status, created_at
)

-- Workshop instances/sessions
workshop_sessions (
  id, workshop_id, organizer_id, volunteer_id,
  scheduled_date, location, status,
  feedback_score, notes
)
```

#### 4.1.2 Relationship Mapping
- **Users** → **Volunteer Profiles** (1:1)
- **Users** → **Workshop Sessions** (1:N as volunteer)
- **Users** → **Workshop Sessions** (1:N as organizer)
- **Workshops** → **Workshop Sessions** (1:N)
- **Users** → **User Progress** (1:N)
- **Training Modules** → **User Progress** (1:N)

### 4.2 Redis Caching Strategy
- **Session storage** (30-minute TTL)
- **API response caching** (5-minute TTL)
- **Workshop matching results** (1-hour TTL)
- **Analytics data** (24-hour TTL)
- **Rate limiting counters**

### 4.3 File Storage
- **Profile photos** → Cloud storage (AWS S3/Azure Blob)
- **Training materials** → CDN-backed storage
- **Workshop resources** → Secure cloud storage
- **Analytics exports** → Temporary storage (24-hour retention)

## 5. Security Architecture

### 5.1 Authentication & Authorization
- **JWT tokens** with 15-minute access + 7-day refresh
- **Role-based permissions** (Volunteer, Coordinator, Admin)
- **API key authentication** for external integrations
- **OAuth 2.0** for third-party service integration

### 5.2 Data Protection
- **Encryption at rest** (database and file storage)
- **Encryption in transit** (HTTPS/TLS 1.3)
- **Personal data anonymization** for analytics
- **GDPR/PIPEDA compliance** measures

### 5.3 API Security
- **Rate limiting** (100 requests/minute per user)
- **Input validation** and sanitization
- **SQL injection protection** (parameterized queries)
- **XSS protection** (CSP headers)
- **CORS configuration** for allowed origins

## 6. Integration Architecture

### 6.1 External System Integrations

#### 6.1.1 Calendar Systems
- **Google Calendar API** for scheduling
- **Microsoft Outlook** integration
- **CalDAV protocol** support
- **iCal export** functionality

#### 6.1.2 Communication Platforms
- **SendGrid/Mailgun** for email delivery
- **Twilio** for SMS notifications
- **Slack/Teams** for volunteer coordination
- **Zoom/Teams** for virtual workshops

#### 6.1.3 Professional Verification
- **Quebec Bar Association** API
- **Notary Association** verification
- **Professional license** validation services

#### 6.1.4 Analytics & Monitoring
- **Google Analytics** for web analytics
- **Application Insights** for performance monitoring
- **LogRocket** for user session recording
- **Sentry** for error tracking

## 7. Scalability & Performance

### 7.1 Horizontal Scaling Strategy
- **Load balancer** distribution
- **Database read replicas** for analytics
- **CDN** for static assets
- **Microservices** migration path

### 7.2 Performance Optimization
- **Database indexing** strategy
- **Query optimization** and caching
- **Image optimization** and lazy loading
- **Code splitting** and lazy loading (React)

### 7.3 Monitoring & Alerting
- **Application Performance Monitoring** (APM)
- **Database performance** metrics
- **User experience** monitoring
- **Business metrics** dashboards

## 8. Deployment Architecture

### 8.1 Environment Strategy
- **Development**: Local Docker containers
- **Staging**: Cloud-hosted replica of production
- **Production**: Multi-region cloud deployment

### 8.2 CI/CD Pipeline
```
GitHub Repository
    ↓
GitHub Actions CI
    ↓
Automated Testing (Jest, Playwright)
    ↓
Docker Image Build
    ↓
Security Scanning
    ↓
Staging Deployment
    ↓
Production Deployment (Blue/Green)
```

### 8.3 Infrastructure as Code
- **Terraform** for cloud resource management
- **Docker Compose** for local development
- **Kubernetes** for production orchestration (future)
- **Helm Charts** for application deployment

## 9. Data Flow Architecture

### 9.1 User Registration Flow
```
User Registration → Email Verification → Professional Verification → 
Profile Setup → Training Assignment → Community Onboarding
```

### 9.2 Workshop Matching Flow
```
Workshop Request → Requirement Analysis → Volunteer Pool Filtering → 
Matching Algorithm → Volunteer Notification → Confirmation → 
Calendar Integration → Pre-workshop Communication
```

### 9.3 Feedback Loop
```
Workshop Completion → Immediate Feedback → Analytics Update → 
Volunteer Recognition → Continuous Improvement → System Optimization
```

## 10. Technology Stack Summary

### 10.1 Frontend Stack
- **React.js 18+** with TypeScript
- **Material-UI** or **Ant Design**
- **Redux Toolkit** + **React Query**
- **React Router v6**
- **Vite** for build tooling

### 10.2 Backend Stack
- **Node.js 18+** with Express.js
- **TypeScript** for type safety
- **Prisma** or **Sequelize** ORM
- **JWT** for authentication
- **Winston** for logging

### 10.3 Storage & Infrastructure
- **JSON Files** for MVP data storage
- **PostgreSQL 14+** future primary database  
- **Redis 7+** for future caching and sessions
- **Local Development** initial setup
- **Docker** for future containerization
- **AWS/Azure/GCP** future cloud services 