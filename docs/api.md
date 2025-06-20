# API Documentation - Volunteer Management Platform

## 1. API Overview

### 1.1 Base URL
- **Development**: `http://localhost:3000/api/v1`
- **Production**: `https://api.educaloi-volunteers.ca/api/v1`

### 1.2 Authentication
- **Type**: Bearer Token (JWT)
- **Header**: `Authorization: Bearer <token>`

### 1.3 Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
```

## 2. Authentication Endpoints

### 2.1 User Registration
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password",
  "firstName": "John",
  "lastName": "Doe",
  "role": "volunteer"
}
```

### 2.2 User Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

## 3. User Management Endpoints

### 3.1 Get User Profile
```http
GET /users/me
Authorization: Bearer <token>
```

### 3.2 Update User Profile
```http
PUT /users/me
Authorization: Bearer <token>
```

## 4. Workshop Management Endpoints

### 4.1 Get Available Workshops
```http
GET /workshops
Authorization: Bearer <token>
```

### 4.2 Apply for Workshop
```http
POST /workshops/:id/apply
Authorization: Bearer <token>
```

## 5. Training Module Endpoints

### 5.1 Get Training Modules
```http
GET /training/modules
Authorization: Bearer <token>
```

### 5.2 Complete Training
```http
POST /training/modules/:id/complete
Authorization: Bearer <token>
```

## 6. Communication Endpoints

### 6.1 Get Messages
```http
GET /messages
Authorization: Bearer <token>
```

### 6.2 Send Message
```http
POST /messages
Authorization: Bearer <token>
```

## 7. Analytics Endpoints

### 7.1 Get Dashboard Data
```http
GET /analytics/dashboard
Authorization: Bearer <token>
```

### 7.2 Generate Reports
```http
POST /analytics/reports
Authorization: Bearer <token>
```

## 8. Volunteer Profile Endpoints

### 8.1 Create Volunteer Profile
```http
POST /volunteers/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "barAssociation": "Barreau du Québec",
  "licenseNumber": "12345",
  "specializations": ["Corporate Law", "Employment Law"],
  "experienceYears": 8,
  "languages": ["French", "English"],
  "regions": ["Montreal", "Quebec City"],
  "availabilityPreferences": {
    "daysOfWeek": ["Monday", "Wednesday", "Friday"],
    "timeSlots": ["morning", "afternoon"],
    "maxWorkshopsPerMonth": 4
  }
}
```

### 8.2 Update Professional Credentials
```http
PUT /volunteers/profile/credentials
Authorization: Bearer <token>
Content-Type: application/json

{
  "certifications": [
    {
      "name": "Legal Education Certificate",
      "issuer": "CAIJ",
      "dateObtained": "2023-06-15",
      "expiryDate": "2026-06-15"
    }
  ]
}
```

### 8.3 Update Availability
```http
PUT /volunteers/profile/availability
Authorization: Bearer <token>
Content-Type: application/json

{
  "calendar": [
    {
      "date": "2024-02-15",
      "timeSlots": ["09:00-12:00", "13:00-16:00"],
      "status": "available"
    }
  ]
}
```

### 8.4 Get Volunteer Statistics
```http
GET /volunteers/me/stats
Authorization: Bearer <token>
```

## 9. Workshop Creation & Management (Organizers)

### 9.1 Create Workshop Request
```http
POST /workshops/requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Introduction to Employment Rights",
  "description": "Basic employment law workshop for high school students",
  "type": "school",
  "targetAudience": "High school students (grades 10-11)",
  "preferredDate": "2024-03-15",
  "alternativeDates": ["2024-03-22", "2024-03-29"],
  "duration": 90,
  "expectedParticipants": 25,
  "location": {
    "name": "École Secondaire de Montréal",
    "address": "123 Rue Education, Montreal, QC",
    "room": "Classroom 205"
  },
  "specialRequirements": "Projector needed",
  "contactInfo": {
    "name": "Marie Dubois",
    "email": "marie.dubois@school.ca",
    "phone": "+1-514-555-0199"
  }
}
```

### 9.2 Get My Workshop Requests
```http
GET /workshops/requests/mine
Authorization: Bearer <token>
```

### 9.3 Update Workshop Request
```http
PUT /workshops/requests/:id
Authorization: Bearer <token>
```

## 10. Training Module Endpoints

### 10.1 Get Available Training Modules
```http
GET /training/modules
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "modules": [
      {
        "id": "ccd-101",
        "title": "Clear Legal Communication 101",
        "description": "Fundamentals of accessible legal communication",
        "duration": 120,
        "difficulty": "beginner",
        "prerequisites": [],
        "status": "available"
      }
    ]
  }
}
```

### 10.2 Enroll in Training Module
```http
POST /training/modules/:id/enroll
Authorization: Bearer <token>
```

### 10.3 Get Module Content
```http
GET /training/modules/:id/content
Authorization: Bearer <token>
```

### 10.4 Submit Module Progress
```http
POST /training/modules/:id/progress
Authorization: Bearer <token>
Content-Type: application/json

{
  "sectionId": "section-1",
  "completed": true,
  "timeSpent": 25,
  "score": 85
}
```

### 10.5 Complete Module Assessment
```http
POST /training/modules/:id/assessment
Authorization: Bearer <token>
Content-Type: application/json

{
  "answers": [
    {
      "questionId": "q1",
      "answer": "B"
    }
  ]
}
```

### 10.6 Get Training Progress
```http
GET /training/progress
Authorization: Bearer <token>
```

## 11. Community & Communication Endpoints

### 11.1 Get Discussion Forums
```http
GET /community/forums
Authorization: Bearer <token>
```

### 11.2 Create Forum Post
```http
POST /community/forums/:forumId/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Tips for engaging high school students",
  "content": "I'd like to share some techniques...",
  "tags": ["pedagogy", "high-school"]
}
```

### 11.3 Get Messages
```http
GET /messages?type=unread
Authorization: Bearer <token>
```

### 11.4 Send Message
```http
POST /messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipientId": "user_uuid",
  "subject": "Workshop follow-up",
  "content": "Thank you for the excellent workshop..."
}
```

### 11.5 Get Notifications
```http
GET /notifications?unread=true
Authorization: Bearer <token>
```

### 11.6 Mark Notification as Read
```http
PUT /notifications/:id/read
Authorization: Bearer <token>
```

## 12. Recognition & Achievement Endpoints

### 12.1 Get User Achievements
```http
GET /achievements/mine
Authorization: Bearer <token>
```

### 12.2 Get Leaderboards
```http
GET /recognition/leaderboards?type=monthly&category=workshops
Authorization: Bearer <token>
```

**Query Parameters**:
- `type`: monthly, yearly, all-time
- `category`: workshops, hours, participants
- `region`: Filter by region

### 12.3 Get Recognition Statistics
```http
GET /recognition/stats
Authorization: Bearer <token>
```

### 12.4 Submit Testimonial
```http
POST /recognition/testimonials
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "volunteer_experience",
  "content": "My experience as a volunteer has been incredibly rewarding...",
  "rating": 5,
  "allowPublicUse": true
}
```

## 13. Analytics & Reporting Endpoints

### 13.1 Get Analytics Dashboard Data
```http
GET /analytics/dashboard?period=last_30_days
Authorization: Bearer <token>
```

### 13.2 Generate Reports
```http
POST /analytics/reports
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "volunteer_activity",
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-03-31"
  },
  "filters": {
    "region": "Montreal",
    "workshopType": "school"
  },
  "format": "pdf"
}
```

### 13.3 Export Data
```http
GET /analytics/export?type=workshops&format=csv
Authorization: Bearer <token>
```

## 14. Administrative Endpoints

### 14.1 Get All Users (Admin Only)
```http
GET /admin/users?role=volunteer&status=active
Authorization: Bearer <admin_token>
```

### 14.2 Update User Status (Admin Only)
```http
PUT /admin/users/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "verified",
  "reason": "Professional credentials confirmed"
}
```

### 14.3 Get System Statistics (Admin Only)
```http
GET /admin/stats
Authorization: Bearer <admin_token>
```

### 14.4 Send Bulk Communications (Admin Only)
```http
POST /admin/communications/bulk
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "type": "newsletter",
  "subject": "Monthly Volunteer Update",
  "content": "HTML content here...",
  "recipients": {
    "filter": {
      "role": "volunteer",
      "status": "active",
      "region": "Montreal"
    }
  },
  "scheduledFor": "2024-02-01T09:00:00Z"
}
```

## 15. Matching Algorithm Endpoints

### 15.1 Get Matching Suggestions
```http
GET /matching/suggestions?workshopId=uuid
Authorization: Bearer <token>
```

### 15.2 Run Manual Matching
```http
POST /matching/manual
Authorization: Bearer <coordinator_token>
Content-Type: application/json

{
  "workshopId": "workshop_uuid",
  "volunteerId": "volunteer_uuid",
  "priority": "high",
  "notes": "Perfect match based on expertise"
}
```

### 15.3 Get Matching Statistics
```http
GET /matching/stats
Authorization: Bearer <coordinator_token>
```

## 16. Error Codes

### 16.1 Authentication Errors
- `AUTH_001`: Invalid credentials
- `AUTH_002`: Token expired
- `AUTH_003`: Token invalid
- `AUTH_004`: User not verified
- `AUTH_005`: Account suspended

### 16.2 Validation Errors
- `VAL_001`: Required field missing
- `VAL_002`: Invalid email format
- `VAL_003`: Password too weak
- `VAL_004`: Invalid phone number
- `VAL_005`: Invalid date format

### 16.3 Business Logic Errors
- `BIZ_001`: Workshop already assigned
- `BIZ_002`: Volunteer not qualified
- `BIZ_003`: Schedule conflict
- `BIZ_004`: Maximum capacity reached
- `BIZ_005`: Registration period closed

### 16.4 System Errors
- `SYS_001`: Database connection error
- `SYS_002`: File upload failed
- `SYS_003`: External service unavailable
- `SYS_004`: Rate limit exceeded
- `SYS_005`: Internal server error

## 17. Rate Limiting

### 17.1 Rate Limits by Endpoint Type
- **Authentication**: 10 requests/minute
- **Standard API**: 100 requests/minute
- **File uploads**: 5 requests/minute
- **Bulk operations**: 1 request/minute

### 17.2 Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

## 18. Webhooks (Future Enhancement)

### 18.1 Workshop Status Changes
```json
{
  "event": "workshop.status_changed",
  "data": {
    "workshopId": "uuid",
    "oldStatus": "scheduled",
    "newStatus": "completed",
    "volunteerId": "uuid",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### 18.2 User Registration
```json
{
  "event": "user.registered",
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "role": "volunteer",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
``` 