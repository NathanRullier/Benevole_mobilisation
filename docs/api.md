# API Documentation - Volunteer Management Platform

## 1. API Overview

### 1.1 Base URL
- **Development**: `http://localhost:3000/api/v1`
- **Production**: `https://api.educaloi-volunteers.ca/api/v1`

### 1.2 Authentication (MVP Implementation)
- **Type**: Bearer Token (JWT)
- **Header**: `Authorization: Bearer <token>`
- **Storage**: JSON file-based session management
- **Token Expiry**: 24 hours
- **Supported Roles**: volunteer, coordinator

### 1.3 Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
```

## 2. Authentication Endpoints (MVP Implementation)

### 2.0 Frontend Authentication Integration

The frontend authentication system is built with React + TypeScript and integrates seamlessly with the backend authentication endpoints. Below is the complete frontend architecture:

#### 2.0.1 Authentication Service (`authService.ts`)
```typescript
import { authService } from '../services/authService';

// Login
const response = await authService.login({ email, password });

// Register
await authService.register({ email, password, firstName, lastName, role });

// Logout
await authService.logout();

// Check authentication status
const isAuthenticated = authService.isAuthenticated();

// Get current user
const user = authService.getUser();

// Verify token
const isValid = await authService.verifyToken();
```

#### 2.0.2 Authentication Context (`AuthContext.tsx`)
```typescript
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();
  
  // Component logic here
};
```

#### 2.0.3 Protected Routes
```typescript
import { ProtectedRoute } from '../components/ProtectedRoute';

// Protect any route
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>

// Role-based protection
<ProtectedRoute requiredRole="coordinator">
  <CoordinatorDashboard />
</ProtectedRoute>
```

#### 2.0.4 JWT Token Management
- **Storage**: localStorage with keys `auth_token`, `user_data`, `session_id`
- **Headers**: Automatically includes `Authorization: Bearer <token>` in API requests
- **Expiration**: Auto-logout on 401 responses
- **Persistence**: Maintains session across page reloads

#### 2.0.5 Role-Based UI Rendering
```typescript
// Coordinators have hierarchical access (volunteer + coordinator features)
const { user } = useAuth();

{user?.role === 'coordinator' && (
  <CoordinatorFeatures />
)}

{(user?.role === 'volunteer' || user?.role === 'coordinator') && (
  <VolunteerFeatures />
)}
```

#### 2.0.6 Password Strength Validation
```typescript
import { PasswordStrengthIndicator } from '../components/PasswordStrengthIndicator';

<PasswordStrengthIndicator 
  password={formData.password}
  showRequirements={true}
/>
```

#### 2.0.7 Frontend Routes
- **Public Routes**: `/`, `/login`, `/register`
- **Volunteer Routes**: `/dashboard` (requires volunteer or coordinator role)
- **Coordinator Routes**: `/coordinator/dashboard` (requires coordinator role)
- **Protected**: All routes automatically redirect to `/login` if not authenticated

#### 2.0.8 Error Handling
- **Network Errors**: Displays user-friendly error messages
- **Token Expiration**: Auto-redirects to login with "session expired" message
- **Validation Errors**: Real-time form validation with helpful feedback
- **Role Access**: Clear error messages for insufficient permissions

#### 2.0.9 Frontend Components Overview
- **LoginPage**: Email/password form with validation and error handling
- **RegisterPage**: Registration form with password strength indicator
- **DashboardPage**: Volunteer dashboard with role-specific navigation
- **CoordinatorDashboardPage**: Coordinator dashboard with hierarchical access
- **ProtectedRoute**: Route wrapper for authentication/authorization
- **PasswordStrengthIndicator**: Real-time password validation component

#### 2.0.10 Integration Testing
The frontend includes comprehensive Playwright E2E tests covering:
- User registration with validation
- Login/logout flows
- Protected route access
- Role-based UI rendering  
- Token storage and management
- Session persistence
- Password strength validation
- Error handling scenarios

## 2. Authentication Endpoints (MVP Implementation)

### 2.1 User Registration
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "volunteer"
}
```

**Response (201 Created)**:
```json
{
  "message": "User registered successfully",
  "userId": "uuid-string",
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "volunteer"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid email format, weak password, or invalid role
- `409 Conflict`: User with email already exists

### 2.2 User Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK)**:
```json
{
  "message": "Login successful",
  "token": "jwt-token-string",
  "sessionId": "session-uuid",
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "volunteer",
    "isActive": true,
    "lastLogin": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Missing email or password
- `401 Unauthorized`: Invalid credentials or deactivated account

### 2.3 User Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "message": "Successfully logged out"
}
```

### 2.4 Get Current User Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "volunteer",
    "isActive": true,
    "lastLogin": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 2.5 Update User Profile
```http
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith"
}
```

**Response (200 OK)**:
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "volunteer",
    "isActive": true,
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

### 2.6 Verify Token
```http
GET /auth/verify
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "valid": true,
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "volunteer"
  }
}
```

### 2.7 Refresh Token
```http
POST /auth/refresh
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "message": "Token refreshed successfully",
  "token": "new-jwt-token-string"
}
```

### 2.8 Password Requirements
Password must meet the following criteria:
- At least 8 characters long
- Contains at least one uppercase letter (A-Z)
- Contains at least one lowercase letter (a-z)
- Contains at least one number (0-9)
- Contains at least one special character (!@#$%^&*(),.?":{}|<>)
- Cannot be a common password (password, 123456789, qwerty, etc.)

### 2.9 JWT Token Details
- **Algorithm**: HS256
- **Expiration**: 24 hours
- **Issuer**: volunteer-platform
- **Audience**: volunteer-platform-users
- **Payload includes**: userId, email, role, sessionId

### 2.10 Role-Based Access Control
- **volunteer**: Can access own profile, workshops, applications
- **coordinator**: Can access volunteer features + workshop management, volunteer oversight
- Roles are hierarchical: coordinators have all volunteer permissions

### 2.11 Coordinator Endpoints (MVP Implementation)

#### 2.11.1 Get Coordinator Dashboard
```http
GET /coordinator/dashboard
Authorization: Bearer <coordinator_token>
```

**Response (200 OK)**:
```json
{
  "dashboard": {
    "totalWorkshops": 0,
    "pendingApplications": 0,
    "activeVolunteers": 0,
    "upcomingWorkshops": [],
    "recentActivity": []
  },
  "coordinator": {
    "id": "uuid-string",
    "email": "coordinator@example.com",
    "firstName": "Jane",
    "lastName": "Coordinator",
    "role": "coordinator"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Insufficient privileges (not a coordinator)

#### 2.11.2 Get All Workshops (Coordinator Only)
```http
GET /coordinator/workshops
Authorization: Bearer <coordinator_token>
```

**Response (200 OK)**:
```json
{
  "workshops": [],
  "total": 0
}
```

#### 2.11.3 Create Workshop (Coordinator Only)
```http
POST /coordinator/workshops
Authorization: Bearer <coordinator_token>
Content-Type: application/json

{
  "title": "Introduction to Employment Law",
  "description": "Basic employment law workshop for students",
  "date": "2024-03-15T10:00:00Z",
  "location": "Montreal High School"
}
```

**Response (201 Created)**:
```json
{
  "message": "Workshop created successfully",
  "workshop": {
    "id": "workshop_1234567890",
    "title": "Introduction to Employment Law",
    "description": "Basic employment law workshop for students",
    "date": "2024-03-15T10:00:00Z",
    "location": "Montreal High School",
    "coordinatorId": "uuid-string",
    "status": "draft",
    "createdAt": "2024-01-15T12:00:00Z",
    "updatedAt": "2024-01-15T12:00:00Z"
  }
}
```

#### 2.11.4 Get All Volunteers (Coordinator Only)
```http
GET /coordinator/volunteers
Authorization: Bearer <coordinator_token>
```

**Response (200 OK)**:
```json
{
  "volunteers": [],
  "total": 0
}
```

## 3. Volunteer Profile Management Endpoints (MVP Implementation)

### 3.1 Create Volunteer Profile
```http
POST /profiles
Authorization: Bearer <token>
Content-Type: application/json

{
  "phone": "+1-514-555-0123",
  "barAssociation": "Barreau du Québec",
  "licenseNumber": "BQ123456",
  "specializations": ["Employment Law", "Corporate Law"],
  "experienceYears": 5,
  "languages": ["French", "English"],
  "regions": ["Montreal", "Laval"],
  "bio": "Experienced employment lawyer passionate about education",
  "availabilityPreferences": {
    "daysOfWeek": ["Monday", "Wednesday", "Friday"],
    "timeSlots": ["morning", "afternoon"],
    "maxWorkshopsPerMonth": 3
  }
}
```

**Response (201 Created)**:
```json
{
  "message": "Profile created successfully",
  "profileId": "prof-uuid-here",
  "profile": {
    "profileId": "prof-uuid-here",
    "userId": "user-uuid-here",
    "phone": "+1-514-555-0123",
    "barAssociation": "Barreau du Québec",
    "licenseNumber": "BQ123456",
    "specializations": ["Employment Law", "Corporate Law"],
    "experienceYears": 5,
    "languages": ["French", "English"],
    "regions": ["Montreal", "Laval"],
    "bio": "Experienced employment lawyer passionate about education",
    "availabilityPreferences": {
      "daysOfWeek": ["Monday", "Wednesday", "Friday"],
      "timeSlots": ["morning", "afternoon"],
      "maxWorkshopsPerMonth": 3
    },
    "profilePhoto": "/uploads/photos/default-avatar.jpg",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z",
    "isActive": true
  }
}
```

**Error Responses**:
- `400 Bad Request`: Validation failed (missing required fields, invalid format)
- `409 Conflict`: Profile already exists for this user
- `401 Unauthorized`: Authentication required

### 3.2 Get Current User Profile
```http
GET /profiles/me
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "profile": {
    "profileId": "prof-uuid-here",
    "userId": "user-uuid-here",
    "phone": "+1-514-555-0123",
    "specializations": ["Employment Law"],
    "languages": ["French", "English"],
    "regions": ["Montreal"],
    "bio": "Experienced lawyer",
    "profilePhoto": "/uploads/photos/default-avatar.jpg",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  }
}
```

**Error Responses**:
- `404 Not Found`: Profile not found
- `401 Unauthorized`: Authentication required

### 3.3 Update Volunteer Profile
```http
PUT /profiles/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "phone": "+1-514-555-9999",
  "specializations": ["Employment Law", "Corporate Law"],
  "experienceYears": 8
}
```

**Response (200 OK)**:
```json
{
  "message": "Profile updated successfully",
  "profile": {
    "profileId": "prof-uuid-here",
    "userId": "user-uuid-here",
    "phone": "+1-514-555-9999",
    "specializations": ["Employment Law", "Corporate Law"],
    "experienceYears": 8,
    "updatedAt": "2024-01-01T11:00:00.000Z"
  }
}
```

### 3.4 Delete Volunteer Profile
```http
DELETE /profiles/me
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "message": "Profile deleted successfully"
}
```

### 3.5 Update Profile Photo
```http
POST /profiles/me/photo
Authorization: Bearer <token>
Content-Type: application/json

{
  "photoUrl": "/uploads/photos/user-photo.jpg"
}
```

**Response (200 OK)**:
```json
{
  "message": "Profile photo updated successfully",
  "profile": {
    "profileId": "prof-uuid-here",
    "profilePhoto": "/uploads/photos/user-photo.jpg",
    "updatedAt": "2024-01-01T11:00:00.000Z"
  }
}
```

### 3.6 Search Volunteer Profiles (Coordinator Only)
```http
GET /profiles/search?specialization=Employment Law&region=Montreal
Authorization: Bearer <coordinator_token>
```

**Query Parameters**:
- `specialization`: Filter by legal specialization
- `region`: Filter by geographic region
- `language`: Filter by language capability
- `experienceMin`: Minimum years of experience
- `experienceMax`: Maximum years of experience
- `availability`: Filter by availability day

**Response (200 OK)**:
```json
{
  "profiles": [
    {
      "profileId": "prof-uuid-here",
      "userId": "user-uuid-here",
      "specializations": ["Employment Law", "Corporate Law"],
      "regions": ["Montreal", "Laval"],
      "languages": ["French", "English"],
      "experienceYears": 5
    }
  ],
  "count": 1,
  "filters": {
    "specialization": "Employment Law",
    "region": "Montreal"
  }
}
```

### 3.7 Get All Volunteer Profiles (Coordinator Only)
```http
GET /profiles/all
Authorization: Bearer <coordinator_token>
```

**Response (200 OK)**:
```json
{
  "profiles": [...],
  "count": 25
}
```

### 3.8 Get Profile Statistics (Coordinator Only)
```http
GET /profiles/stats
Authorization: Bearer <coordinator_token>
```

**Response (200 OK)**:
```json
{
  "stats": {
    "totalProfiles": 25,
    "bySpecialization": {
      "Employment Law": 8,
      "Corporate Law": 5,
      "Family Law": 12
    },
    "byRegion": {
      "Montreal": 15,
      "Quebec City": 6,
      "Laval": 4
    },
    "byLanguage": {
      "French": 25,
      "English": 18,
      "Spanish": 3
    },
    "averageExperience": 7.2
  }
}
```

### 3.9 Profile Validation Rules
- **Phone**: Must follow format `+1-xxx-xxx-xxxx`
- **Specializations**: Required array with at least one item
- **Experience Years**: Optional number between 0-50
- **Languages**: Optional array
- **Regions**: Optional array
- **Bio**: Optional string
- **Availability Preferences**: Optional object with daysOfWeek (array), timeSlots (array), maxWorkshopsPerMonth (number ≥ 1)

## 4. Workshop Management Endpoints (MVP Implementation)

### 4.1 Create Workshop (Coordinator Only)
```http
POST /workshops
Authorization: Bearer <coordinator_token>
Content-Type: application/json

{
  "title": "Introduction to Employment Law",
  "description": "A comprehensive workshop covering the basics of employment law in Quebec.",
  "date": "2024-03-15",
  "startTime": "09:00",
  "endTime": "12:00",
  "location": {
    "name": "École Secondaire Jean-Baptiste-Meilleur",
    "address": "777 Av. Sainte-Croix, Saint-Laurent, QC H4L 3Y5",
    "city": "Saint-Laurent",
    "region": "Montreal"
  },
  "maxVolunteers": 2,
  "requiredSpecializations": ["Employment Law"],
  "targetAudience": "Secondary School Students",
  "workshopType": "Educational Presentation",
  "status": "draft",
  "contactPerson": {
    "name": "Pierre Leclerc",
    "email": "p.leclerc@school.qc.ca",
    "phone": "+1-514-555-0199"
  }
}
```

**Response (201 Created)**:
```json
{
  "message": "Workshop created successfully",
  "workshopId": "workshop-uuid-here",
  "workshop": {
    "id": "workshop-uuid-here",
    "title": "Introduction to Employment Law",
    "description": "A comprehensive workshop covering the basics of employment law in Quebec.",
    "date": "2024-03-15",
    "startTime": "09:00",
    "endTime": "12:00",
    "location": {
      "name": "École Secondaire Jean-Baptiste-Meilleur",
      "address": "777 Av. Sainte-Croix, Saint-Laurent, QC H4L 3Y5",
      "city": "Saint-Laurent",
      "region": "Montreal"
    },
    "maxVolunteers": 2,
    "requiredSpecializations": ["Employment Law"],
    "targetAudience": "Secondary School Students",
    "workshopType": "Educational Presentation",
    "status": "draft",
    "contactPerson": {
      "name": "Pierre Leclerc",
      "email": "p.leclerc@school.qc.ca",
      "phone": "+1-514-555-0199"
    },
    "createdBy": "coordinator-uuid",
    "applicationsCount": 0,
    "applications": [],
    "createdAt": "2024-01-15T12:00:00Z",
    "updatedAt": "2024-01-15T12:00:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Validation failed (missing required fields, invalid date/time format)
- `403 Forbidden`: Access denied (volunteer role attempting to create workshop)
- `401 Unauthorized`: Authentication required

### 4.2 Get All Workshops (Filtered)
```http
GET /workshops?region=Montreal&specialization=Employment Law&status=published&search=employment&date=2024-03-15
Authorization: Bearer <token>
```

**Query Parameters**:
- `region`: Filter by location region or city
- `specialization`: Filter by required specialization
- `status`: Filter by workshop status (published, draft, cancelled, completed)
- `search`: Search in title and description
- `date`: Filter by specific date (YYYY-MM-DD)
- `includeAllStatuses`: (Coordinator only) Include all workshop statuses

**Response (200 OK)**:
```json
{
  "workshops": [
    {
      "id": "workshop-uuid-here",
      "title": "Employment Law Workshop",
      "description": "Employment law basics",
      "date": "2024-03-15",
      "startTime": "09:00",
      "endTime": "12:00",
      "location": {
        "city": "Montreal",
        "region": "Montreal"
      },
      "requiredSpecializations": ["Employment Law"],
      "status": "published",
      "applicationsCount": 1,
      "maxVolunteers": 2,
      "createdBy": "coordinator-uuid",
      "createdAt": "2024-01-15T12:00:00Z",
      "updatedAt": "2024-01-15T12:00:00Z"
    }
  ],
  "total": 1
}
```

**Access Control**:
- **Volunteers**: Can only see published workshops
- **Coordinators**: Can see all workshops (with `includeAllStatuses=true`)

### 4.3 Get Workshop by ID
```http
GET /workshops/{workshopId}
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "workshop": {
    "id": "workshop-uuid-here",
    "title": "Contract Law Workshop",
    "description": "Understanding contracts",
    "date": "2024-03-25",
    "startTime": "10:00",
    "endTime": "13:00",
    "location": {
      "city": "Montreal",
      "region": "Montreal"
    },
    "status": "published",
    "maxVolunteers": 2,
    "applicationsCount": 0,
    "applications": [],
    "createdBy": "coordinator-uuid",
    "contactPerson": {
      "name": "Marie Dubois",
      "email": "m.dubois@school.qc.ca",
      "phone": "+1-514-555-0188"
    },
    "createdAt": "2024-01-15T12:00:00Z",
    "updatedAt": "2024-01-15T12:00:00Z"
  }
}
```

**Error Responses**:
- `404 Not Found`: Workshop not found or not accessible (volunteers can't see draft workshops)
- `401 Unauthorized`: Authentication required

### 4.4 Update Workshop (Coordinator Only)
```http
PUT /workshops/{workshopId}
Authorization: Bearer <coordinator_token>
Content-Type: application/json

{
  "title": "Updated Workshop Title",
  "description": "Updated description with more details",
  "date": "2024-03-20",
  "startTime": "10:00",
  "endTime": "13:00",
  "status": "published"
}
```

**Response (200 OK)**:
```json
{
  "message": "Workshop updated successfully",
  "workshop": {
    "id": "workshop-uuid-here",
    "title": "Updated Workshop Title",
    "description": "Updated description with more details",
    "date": "2024-03-20",
    "startTime": "10:00",
    "endTime": "13:00",
    "status": "published",
    "updatedAt": "2024-01-15T13:00:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Validation failed
- `403 Forbidden`: Access denied (volunteers cannot update workshops)
- `404 Not Found`: Workshop not found

### 4.5 Update Workshop Status (Coordinator Only)
```http
PUT /workshops/{workshopId}/status
Authorization: Bearer <coordinator_token>
Content-Type: application/json

{
  "status": "cancelled",
  "cancellationReason": "Insufficient volunteer applications"
}
```

**Valid Status Values**: `draft`, `published`, `cancelled`, `completed`

**Response (200 OK)**:
```json
{
  "message": "Workshop status updated successfully",
  "workshop": {
    "id": "workshop-uuid-here",
    "status": "cancelled",
    "cancellationReason": "Insufficient volunteer applications",
    "updatedAt": "2024-01-15T13:00:00Z"
  }
}
```

### 4.6 Delete Workshop (Coordinator Only)
```http
DELETE /workshops/{workshopId}
Authorization: Bearer <coordinator_token>
```

**Response (200 OK)**:
```json
{
  "message": "Workshop deleted successfully"
}
```

**Error Responses**:
- `403 Forbidden`: Access denied (volunteers cannot delete workshops)
- `404 Not Found`: Workshop not found

### 4.7 Get Coordinator's Workshops
```http
GET /workshops/coordinator/my-workshops
Authorization: Bearer <coordinator_token>
```

**Response (200 OK)**:
```json
{
  "workshops": [
    {
      "id": "workshop-uuid-here",
      "title": "My Workshop",
      "status": "published",
      "date": "2024-03-20",
      "applicationsCount": 2,
      "maxVolunteers": 3,
      "createdAt": "2024-01-15T12:00:00Z"
    }
  ],
  "total": 1
}
```

### 4.8 Get Available Workshops for Volunteer
```http
GET /workshops/volunteer/available?region=Montreal&specialization=Employment Law&date=2024-03-15
Authorization: Bearer <volunteer_token>
```

**Query Parameters**:
- `region`: Filter by location region or city
- `specialization`: Filter by required specialization
- `date`: Filter by specific date

**Response (200 OK)**:
```json
{
  "workshops": [
    {
      "id": "workshop-uuid-here",
      "title": "Employment Law Workshop",
      "description": "Basics of employment law",
      "date": "2024-03-15",
      "startTime": "09:00",
      "endTime": "12:00",
      "location": {
        "city": "Montreal",
        "region": "Montreal"
      },
      "requiredSpecializations": ["Employment Law"],
      "maxVolunteers": 2,
      "applicationsCount": 0,
      "status": "published"
    }
  ],
  "total": 1
}
```

**Note**: Only returns published workshops that are in the future.

### 4.9 Workshop Data Validation Rules
#### Required Fields (Creation):
- `title`: Workshop title (string, max 200 characters)
- `description`: Workshop description (string, max 2000 characters)
- `date`: Workshop date (YYYY-MM-DD format, must be future date)
- `startTime`: Start time (HH:MM format, 24-hour)
- `endTime`: End time (HH:MM format, 24-hour, must be after start time)

#### Optional Fields:
- `location`: Object with name, address, city, region
- `maxVolunteers`: Number of volunteers needed (integer, min: 1, max: 10)
- `requiredSpecializations`: Array of required legal specializations
- `targetAudience`: Target audience description
- `workshopType`: Type of workshop (presentation, Q&A, etc.)
- `contactPerson`: Object with name, email, phone
- `status`: Workshop status (defaults to 'draft')

#### Validation Rules:
- Date cannot be in the past
- End time must be after start time
- Time format must be HH:MM (24-hour)
- Email format validation for contact person
- Status must be one of: draft, published, cancelled, completed
- Max volunteers must be between 1 and 10

### 4.10 Workshop Status Workflow
1. **Draft**: Initial creation state, not visible to volunteers
2. **Published**: Visible to volunteers, accepting applications
3. **Cancelled**: Workshop cancelled, no longer accepting applications
4. **Completed**: Workshop has been completed

### 4.11 Workshop Authorization Matrix
| Endpoint | Volunteer | Coordinator |
|----------|-----------|-------------|
| Create Workshop | ❌ | ✅ |
| View Published Workshops | ✅ | ✅ |
| View Draft/Cancelled Workshops | ❌ | ✅ |
| Update Workshop | ❌ | ✅ |
| Delete Workshop | ❌ | ✅ |
| Change Status | ❌ | ✅ |
| View All Workshops | ❌ | ✅ (with includeAllStatuses) |

## 5. User Management Endpoints

### 5.1 Get User Profile
```http
GET /users/me
Authorization: Bearer <token>
```

### 5.2 Update User Profile
```http
PUT /users/me
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