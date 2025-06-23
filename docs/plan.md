# Development Plan - Volunteer Management Platform (MVP First)

## Project Overview
Building a volunteer management platform for Éducaloi to coordinate legal professionals providing educational workshops in Quebec.

**MVP Goals:**
- Basic volunteer registration and profiles
- Simple workshop listing and application system
- Manual coordinator matching workflow
- Foundation for future expansion

**Long-term Goals:**
- 200 recruited volunteers annually
- 50% volunteer retention rate
- 5% super-engaged volunteers (3+ workshops/year)
- Reduce unmatched workshops by 30%

## Development Methodology: Test-Driven Development (TDD)
Each feature follows this workflow:
1. Create Tests
2. Code Implementation
3. Compilation
4. Test Execution
5. Update Documentation

## 🎯 **MVP Phase: Core Functionality (Weeks 1-4)**

### MVP.1 Project Setup & JSON Storage
- [x] **MVP.1.1 Create Tests**: File system operations and JSON handling tests
- [x] **MVP.1.2 Code**: Initialize Node.js project with JSON storage system
- [x] **MVP.1.3 Compile**: Project structure compilation
- [x] **MVP.1.4 Test**: JSON read/write operations testing
- [x] **MVP.1.5 Docs**: Update architecture.md with JSON storage approach

#### JSON Storage Structure:
- [x] **MVP.1.6** `data/users.json` - User accounts and basic info
- [x] **MVP.1.7** `data/volunteer-profiles.json` - Volunteer professional details  
- [x] **MVP.1.8** `data/workshops.json` - Workshop templates and information
- [x] **MVP.1.9** `data/workshop-sessions.json` - Scheduled workshop instances
- [x] **MVP.1.10** `data/applications.json` - Volunteer workshop applications
- [x] **MVP.1.11** File-based ID generation and management system
- [x] **MVP.1.12** JSON validation and error handling

### MVP.1F Frontend Setup & Foundation
- [ ] **MVP.1F.1 Create Tests**: React component tests with Playwright
- [ ] **MVP.1F.2 Code**: Initialize React.js project with TypeScript
- [ ] **MVP.1F.3 Compile**: Frontend build system setup
- [ ] **MVP.1F.4 Test**: Basic component rendering tests
- [ ] **MVP.1F.5 Docs**: Update architecture.md with frontend setup

#### Frontend Foundation Features:
- [ ] **MVP.1F.6** React.js with TypeScript configuration
- [ ] **MVP.1F.7** Component library setup (Material-UI or similar)
- [ ] **MVP.1F.8** Routing system (React Router)
- [ ] **MVP.1F.9** State management setup (Context API or Redux)
- [ ] **MVP.1F.10** API client configuration (Axios)
- [ ] **MVP.1F.11** Basic responsive layout components
- [ ] **MVP.1F.12** Theme and styling system

### MVP.2 Basic Authentication System
- [x] **MVP.2.1 Create Tests**: JWT authentication with JSON storage tests
- [x] **MVP.2.2 Code**: Simple user registration and login with JSON files
- [x] **MVP.2.3 Compile**: Authentication service compilation
- [x] **MVP.2.4 Test**: Login/logout workflow testing
- [x] **MVP.2.5 Docs**: Update API.md with basic auth endpoints

#### MVP Authentication Features:
- [x] **MVP.2.6** User registration (email, password, basic info)
- [x] **MVP.2.7** Simple login/logout with JWT tokens
- [x] **MVP.2.8** Basic role assignment (volunteer, coordinator)
- [x] **MVP.2.9** Password hashing and validation
- [x] **MVP.2.10** Session management with JSON storage

### MVP.2F Frontend Authentication System
- [ ] **MVP.2F.1 Create Tests**: Authentication component tests with Playwright
- [ ] **MVP.2F.2 Code**: Login/Register React components with TypeScript
- [ ] **MVP.2F.3 Compile**: Authentication UI compilation
- [ ] **MVP.2F.4 Test**: Authentication flow E2E tests
- [ ] **MVP.2F.5 Docs**: Update API.md with frontend auth integration

#### Frontend Authentication Features:
- [ ] **MVP.2F.6** User registration form with validation
- [ ] **MVP.2F.7** Login form with error handling
- [ ] **MVP.2F.8** JWT token storage and management
- [ ] **MVP.2F.9** Protected route components
- [ ] **MVP.2F.10** Role-based UI rendering (volunteer/coordinator)
- [ ] **MVP.2F.11** Session persistence and auto-logout
- [ ] **MVP.2F.12** Password strength indicator and validation

### MVP.3 Basic User Profiles
- [x] **MVP.3.1 Create Tests**: Profile CRUD operations with JSON files
- [x] **MVP.3.2 Code**: Backend profile service and API routes
- [x] **MVP.3.3 Compile**: Backend profile functionality working
- [x] **MVP.3.4 Test**: All 16 profile tests passing (50 total tests)
- [x] **MVP.3.5 Docs**: Update api.md with profile endpoints

#### MVP Profile Features:
- [x] **MVP.3.6** Basic user information (phone, specializations, languages)
- [x] **MVP.3.7** Volunteer details (bar association, license, experience)
- [x] **MVP.3.8** Profile photo upload placeholder (local file storage)
- [x] **MVP.3.9** Basic availability preferences (days, time slots, max workshops)
- [x] **MVP.3.10** Contact information management with validation

### MVP.3F Frontend Profile Management
- [ ] **MVP.3F.1 Create Tests**: Profile component tests with Playwright
- [ ] **MVP.3F.2 Code**: Profile creation and editing React components
- [ ] **MVP.3F.3 Compile**: Profile UI compilation
- [ ] **MVP.3F.4 Test**: Profile management E2E tests
- [ ] **MVP.3F.5 Docs**: Update requirements.md with profile UI features

#### Frontend Profile Features:
- [ ] **MVP.3F.6** Profile creation form with step-by-step wizard
- [ ] **MVP.3F.7** Profile editing interface with live validation
- [ ] **MVP.3F.8** Profile photo upload with preview
- [ ] **MVP.3F.9** Specialization multi-select with search
- [ ] **MVP.3F.10** Availability calendar component
- [ ] **MVP.3F.11** Profile completeness indicator
- [ ] **MVP.3F.12** Coordinator profile search interface

### MVP.4 Simple Workshop System
- [ ] **MVP.4.1 Create Tests**: Workshop CRUD with JSON storage
- [ ] **MVP.4.2 Code**: Basic workshop listing and details
- [ ] **MVP.4.3 Compile**: Workshop management system
- [ ] **MVP.4.4 Test**: Workshop creation and display tests
- [ ] **MVP.4.5 Docs**: Update API.md with workshop endpoints

#### MVP Workshop Features:
- [ ] **MVP.4.6** Workshop creation form (coordinator only)
- [ ] **MVP.4.7** Basic workshop information (title, date, location, description)
- [ ] **MVP.4.8** Workshop listing page for volunteers
- [ ] **MVP.4.9** Workshop detail view
- [ ] **MVP.4.10** Simple workshop status management

### MVP.4F Frontend Workshop System
- [ ] **MVP.4F.1 Create Tests**: Workshop component tests with Playwright
- [ ] **MVP.4F.2 Code**: Workshop listing and detail React components
- [ ] **MVP.4F.3 Compile**: Workshop UI compilation
- [ ] **MVP.4F.4 Test**: Workshop display and creation E2E tests
- [ ] **MVP.4F.5 Docs**: Update API.md with workshop UI integration

#### Frontend Workshop Features:
- [ ] **MVP.4F.6** Workshop creation form (coordinator only)
- [ ] **MVP.4F.7** Workshop listing page with filters
- [ ] **MVP.4F.8** Workshop detail modal/page
- [ ] **MVP.4F.9** Workshop status indicators and management
- [ ] **MVP.4F.10** Workshop search and filtering interface
- [ ] **MVP.4F.11** Calendar view for workshops
- [ ] **MVP.4F.12** Workshop location mapping integration

### MVP.5 Basic Application System
- [ ] **MVP.5.1 Create Tests**: Application workflow tests with JSON
- [ ] **MVP.5.2 Code**: Volunteer application and coordinator review
- [ ] **MVP.5.3 Compile**: Application system compilation
- [ ] **MVP.5.4 Test**: Application submission and approval tests
- [ ] **MVP.5.5 Docs**: Update plan.md with MVP completion status

#### MVP Application Features:
- [ ] **MVP.5.6** Volunteer application form for workshops
- [ ] **MVP.5.7** Application status tracking (pending, approved, declined)
- [ ] **MVP.5.8** Coordinator review interface
- [ ] **MVP.5.9** Basic notification system (email only)
- [ ] **MVP.5.10** Simple application history

### MVP.5F Frontend Application System
- [ ] **MVP.5F.1 Create Tests**: Application component tests with Playwright
- [ ] **MVP.5F.2 Code**: Application submission and review React components
- [ ] **MVP.5F.3 Compile**: Application UI compilation
- [ ] **MVP.5F.4 Test**: Application workflow E2E tests
- [ ] **MVP.5F.5 Docs**: Update plan.md with complete MVP frontend status

#### Frontend Application Features:
- [ ] **MVP.5F.6** Workshop application form for volunteers
- [ ] **MVP.5F.7** Application status tracking dashboard
- [ ] **MVP.5F.8** Coordinator application review interface
- [ ] **MVP.5F.9** Application history and timeline view
- [ ] **MVP.5F.10** Notification display and management
- [ ] **MVP.5F.11** Application approval/rejection workflow UI
- [ ] **MVP.5F.12** Volunteer application statistics dashboard

## 🚀 **Phase 1: Enhanced Core Features (Weeks 9-12)**

**Note**: Each backend enhancement phase (1-8) should include corresponding frontend UI/UX improvements to support new backend features. Frontend tasks will follow the same TDD methodology using Playwright for E2E testing.

### 1.1 Improved Authentication & Security
- [ ] **1.1.1 Create Tests**: Enhanced security features tests
- [ ] **1.1.2 Code**: Email verification and password reset
- [ ] **1.1.3 Compile**: Security enhancement compilation
- [ ] **1.1.4 Test**: Security workflow testing
- [ ] **1.1.5 Docs**: Update security documentation

#### Enhanced Auth Features:
- [ ] **1.1.6** Email verification system
- [ ] **1.1.7** Password reset functionality
- [ ] **1.1.8** Basic professional credential fields
- [ ] **1.1.9** Improved session management
- [ ] **1.1.10** Basic audit logging in JSON

### 1.2 Enhanced Profile Management
- [ ] **1.2.1 Create Tests**: Extended profile features tests
- [ ] **1.2.2 Code**: Detailed volunteer and organizer profiles
- [ ] **1.2.3 Compile**: Enhanced profile system
- [ ] **1.2.4 Test**: Advanced profile functionality tests
- [ ] **1.2.5 Docs**: Update API.md with enhanced endpoints

#### Enhanced Profile Features:
- [ ] **1.2.6** Detailed professional information
- [ ] **1.2.7** Multiple specialization selection
- [ ] **1.2.8** Geographic region preferences
- [ ] **1.2.9** Experience level tracking
- [ ] **1.2.10** Availability calendar (basic)

### 1.3 Workshop Matching System
- [ ] **1.3.1 Create Tests**: Basic matching algorithm tests
- [ ] **1.3.2 Code**: Simple automated matching based on location/skills
- [ ] **1.3.3 Compile**: Matching service compilation
- [ ] **1.3.4 Test**: Matching accuracy tests
- [ ] **1.3.5 Docs**: Update architecture.md with matching design

#### Basic Matching Features:
- [ ] **1.3.6** Location-based matching
- [ ] **1.3.7** Skill/specialization matching
- [ ] **1.3.8** Availability checking
- [ ] **1.3.9** Coordinator override capability
- [ ] **1.3.10** Matching suggestions interface

## 📊 **Phase 2: Communication & Workflow (Weeks 13-16)**

### 2.1 Basic Communication System
- [ ] **2.1.1 Create Tests**: Messaging and notification tests
- [ ] **2.1.2 Code**: Simple messaging between users
- [ ] **2.1.3 Compile**: Communication system
- [ ] **2.1.4 Test**: Message delivery and notification tests
- [ ] **2.1.5 Docs**: Update API.md with messaging endpoints

#### Communication Features:
- [ ] **2.1.6** Direct messaging between volunteers and coordinators
- [ ] **2.1.7** Workshop-related notifications
- [ ] **2.1.8** Email notification integration
- [ ] **2.1.9** Basic message history (JSON storage)
- [ ] **2.1.10** System announcements

### 2.2 Workshop Coordination Workflow
- [ ] **2.2.1 Create Tests**: Workflow automation tests
- [ ] **2.2.2 Code**: Workshop lifecycle management
- [ ] **2.2.3 Compile**: Workflow system
- [ ] **2.2.4 Test**: End-to-end workflow tests
- [ ] **2.2.5 Docs**: Update requirements.md

#### Workflow Features:
- [ ] **2.2.6** Workshop request workflow
- [ ] **2.2.7** Automated status updates
- [ ] **2.2.8** Pre-workshop reminders
- [ ] **2.2.9** Post-workshop feedback collection
- [ ] **2.2.10** Basic reporting for coordinators

## 📈 **Phase 3: Analytics & Reporting (Weeks 17-20)**

### 3.1 Basic Analytics Dashboard
- [ ] **3.1.1 Create Tests**: Analytics calculation tests
- [ ] **3.1.2 Code**: Simple dashboard with JSON data aggregation
- [ ] **3.1.3 Compile**: Analytics system
- [ ] **3.1.4 Test**: Dashboard accuracy tests
- [ ] **3.1.5 Docs**: Update architecture.md

#### Analytics Features:
- [ ] **3.1.6** Volunteer activity summary
- [ ] **3.1.7** Workshop completion statistics
- [ ] **3.1.8** Basic coordinator overview
- [ ] **3.1.9** Simple charts and graphs
- [ ] **3.1.10** Data export to CSV

### 3.2 Basic Reporting System
- [ ] **3.2.1 Create Tests**: Report generation tests
- [ ] **3.2.2 Code**: Simple report generation from JSON data
- [ ] **3.2.3 Compile**: Reporting system
- [ ] **3.2.4 Test**: Report accuracy and export tests
- [ ] **3.2.5 Docs**: Update deployment.md

#### Reporting Features:
- [ ] **3.2.6** Monthly activity reports
- [ ] **3.2.7** Volunteer engagement reports
- [ ] **3.2.8** Workshop demand analysis
- [ ] **3.2.9** Basic performance metrics
- [ ] **3.2.10** PDF report generation

## 🔄 **Phase 4: Database Migration Preparation (Weeks 21-22)**

### 4.1 Database Migration Planning
- [ ] **4.1.1 Create Tests**: Database migration tests
- [ ] **4.1.2 Code**: Database schema design (PostgreSQL)
- [ ] **4.1.3 Compile**: Migration scripts
- [ ] **4.1.4 Test**: Data migration validation
- [ ] **4.1.5 Docs**: Update architecture.md with database design

#### Migration Features:
- [ ] **4.1.6** PostgreSQL schema design
- [ ] **4.1.7** JSON to database migration scripts
- [ ] **4.1.8** Data validation and integrity checks
- [ ] **4.1.9** Backup and rollback procedures
- [ ] **4.1.10** Performance optimization planning

### 4.2 Database Implementation
- [ ] **4.2.1 Create Tests**: Database integration tests
- [ ] **4.2.2 Code**: Replace JSON storage with PostgreSQL
- [ ] **4.2.3 Compile**: Database integration
- [ ] **4.2.4 Test**: Full system testing with database
- [ ] **4.2.5 Docs**: Update deployment documentation

#### Database Features:
- [ ] **4.2.6** PostgreSQL integration
- [ ] **4.2.7** Connection pooling and optimization
- [ ] **4.2.8** Database security implementation
- [ ] **4.2.9** Backup and recovery procedures
- [ ] **4.2.10** Performance monitoring

## 🎨 **Phase 5: User Experience Enhancement (Weeks 23-26)**

### 5.1 UI/UX Improvements
- [ ] **5.1.1 Create Tests**: UI component and accessibility tests
- [ ] **5.1.2 Code**: Enhanced React components and user interface
- [ ] **5.1.3 Compile**: Frontend optimization
- [ ] **5.1.4 Test**: User experience testing with Playwright
- [ ] **5.1.5 Docs**: Update requirements.md

#### UX Features:
- [ ] **5.1.6** Responsive design optimization
- [ ] **5.1.7** Improved navigation and user flows
- [ ] **5.1.8** Better form validation and error handling
- [ ] **5.1.9** Loading states and user feedback
- [ ] **5.1.10** Accessibility improvements

### 5.2 Mobile Responsiveness
- [ ] **5.2.1 Create Tests**: Mobile compatibility tests
- [ ] **5.2.2 Code**: Mobile-optimized components
- [ ] **5.2.3 Compile**: Responsive build
- [ ] **5.2.4 Test**: Cross-device testing
- [ ] **5.2.5 Docs**: Update architecture.md

#### Mobile Features:
- [ ] **5.2.6** Mobile-first responsive design
- [ ] **5.2.7** Touch-friendly interface
- [ ] **5.2.8** Optimized mobile workflows
- [ ] **5.2.9** Progressive Web App features
- [ ] **5.2.10** Offline capability (basic)

## 🚀 **Phase 6: Advanced Features (Weeks 27-30)**

### 6.1 Training System
- [ ] **6.1.1 Create Tests**: Training module tests
- [ ] **6.1.2 Code**: Basic learning management system
- [ ] **6.1.3 Compile**: Training system
- [ ] **6.1.4 Test**: Learning progress tests
- [ ] **6.1.5 Docs**: Update API.md

#### Training Features:
- [ ] **6.1.6** Training module creation and management
- [ ] **6.1.7** Progress tracking
- [ ] **6.1.8** Basic assessment functionality
- [ ] **6.1.9** Certificate generation
- [ ] **6.1.10** Training resource library

### 6.2 Community Features
- [ ] **6.2.1 Create Tests**: Community interaction tests
- [ ] **6.2.2 Code**: Basic forum and discussion features
- [ ] **6.2.3 Compile**: Community system
- [ ] **6.2.4 Test**: Community interaction tests
- [ ] **6.2.5 Docs**: Update requirements.md

#### Community Features:
- [ ] **6.2.6** Discussion forums
- [ ] **6.2.7** Q&A sections
- [ ] **6.2.8** Best practices sharing
- [ ] **6.2.9** Peer-to-peer messaging
- [ ] **6.2.10** Community guidelines and moderation

## 🏆 **Phase 7: Recognition & Gamification (Weeks 31-34)**

### 7.1 Achievement System
- [ ] **7.1.1 Create Tests**: Achievement calculation tests
- [ ] **7.1.2 Code**: Badge and recognition system
- [ ] **7.1.3 Compile**: Recognition system
- [ ] **7.1.4 Test**: Achievement award tests
- [ ] **7.1.5 Docs**: Update API.md

#### Recognition Features:
- [ ] **7.1.6** Workshop completion badges
- [ ] **7.1.7** Impact metrics tracking
- [ ] **7.1.8** Volunteer of the Month system
- [ ] **7.1.9** Annual recognition awards
- [ ] **7.1.10** Public recognition display

### 7.2 Advanced Analytics
- [ ] **7.2.1 Create Tests**: Advanced analytics tests
- [ ] **7.2.2 Code**: Comprehensive analytics dashboard
- [ ] **7.2.3 Compile**: Advanced analytics
- [ ] **7.2.4 Test**: Analytics accuracy tests
- [ ] **7.2.5 Docs**: Update architecture.md

#### Advanced Analytics Features:
- [ ] **7.2.6** Predictive analytics
- [ ] **7.2.7** Trend analysis
- [ ] **7.2.8** Performance benchmarking
- [ ] **7.2.9** Advanced reporting
- [ ] **7.2.10** Data visualization improvements

## 🔐 **Phase 8: Production Readiness (Weeks 35-36)**

### 8.1 Security Hardening
- [ ] **8.1.1 Create Tests**: Security vulnerability tests
- [ ] **8.1.2 Code**: Production security measures
- [ ] **8.1.3 Compile**: Security implementation
- [ ] **8.1.4 Test**: Security audit and penetration testing
- [ ] **8.1.5 Docs**: Update security documentation

#### Security Features:
- [ ] **8.1.6** Input validation and sanitization
- [ ] **8.1.7** Rate limiting and DDoS protection
- [ ] **8.1.8** Security headers implementation
- [ ] **8.1.9** Data encryption enhancements
- [ ] **8.1.10** Audit logging and monitoring

### 8.2 Performance Optimization
- [ ] **8.2.1 Create Tests**: Performance benchmark tests
- [ ] **8.2.2 Code**: Caching and optimization
- [ ] **8.2.3 Compile**: Optimized production build
- [ ] **8.2.4 Test**: Load testing and performance validation
- [ ] **8.2.5 Docs**: Update deployment.md

#### Performance Features:
- [ ] **8.2.6** Database query optimization
- [ ] **8.2.7** Redis caching implementation
- [ ] **8.2.8** CDN setup for static assets
- [ ] **8.2.9** Image optimization
- [ ] **8.2.10** API response optimization

## 📋 **JSON Storage Implementation Details**

### File Structure:
```
data/
├── users.json              # User accounts and authentication
├── volunteer-profiles.json # Extended volunteer information
├── workshops.json          # Workshop templates and details
├── workshop-sessions.json  # Scheduled workshop instances
├── applications.json       # Volunteer applications
├── messages.json          # User communications
├── notifications.json     # System notifications
└── system-config.json     # Application configuration
```

### JSON Management Features:
- [x] **JSON.1** Atomic file operations for data consistency
- [x] **JSON.2** Automatic backup before writes
- [x] **JSON.3** JSON schema validation
- [x] **JSON.4** Error handling and recovery
- [x] **JSON.5** File locking mechanisms
- [x] **JSON.6** Data migration utilities for database transition

## 📊 **Task Numbering System Overview**

The development plan uses a systematic numbering approach for easy task tracking and reference:

### MVP Phase Tasks:
- **MVP.X.Y** format for backend (e.g., MVP.1.1, MVP.2.5)
- **MVP.XF.Y** format for frontend (e.g., MVP.1F.1, MVP.2F.5)

#### Backend MVP Tasks:
- **MVP.1**: Project Setup & JSON Storage (MVP.1.1 - MVP.1.12)
- **MVP.2**: Basic Authentication System (MVP.2.1 - MVP.2.10)
- **MVP.3**: Basic User Profiles (MVP.3.1 - MVP.3.10)
- **MVP.4**: Simple Workshop System (MVP.4.1 - MVP.4.10)
- **MVP.5**: Basic Application System (MVP.5.1 - MVP.5.10)

#### Frontend MVP Tasks:
- **MVP.1F**: Frontend Setup & Foundation (MVP.1F.1 - MVP.1F.12)
- **MVP.2F**: Frontend Authentication System (MVP.2F.1 - MVP.2F.12)
- **MVP.3F**: Frontend Profile Management (MVP.3F.1 - MVP.3F.12)
- **MVP.4F**: Frontend Workshop System (MVP.4F.1 - MVP.4F.12)
- **MVP.5F**: Frontend Application System (MVP.5F.1 - MVP.5F.12)

### Development Phase Tasks:
- **X.Y.Z** format (e.g., 1.1.1, 2.2.5, 8.1.10)
- **Phase 1**: Enhanced Core Features (1.1.1 - 1.3.10)
- **Phase 2**: Communication & Workflow (2.1.1 - 2.2.10)
- **Phase 3**: Analytics & Reporting (3.1.1 - 3.2.10)
- **Phase 4**: Database Migration (4.1.1 - 4.2.10)
- **Phase 5**: User Experience Enhancement (5.1.1 - 5.2.10)
- **Phase 6**: Advanced Features (6.1.1 - 6.2.10)
- **Phase 7**: Recognition & Gamification (7.1.1 - 7.2.10)
- **Phase 8**: Production Readiness (8.1.1 - 8.2.10)

### Special Tasks:
- **JSON.X** format for JSON management utilities (JSON.1 - JSON.6)

### Total Task Count:
- **MVP Phase Backend**: 52 tasks
- **MVP Phase Frontend**: 60 tasks
- **Development Phases**: 160 tasks
- **JSON Management**: 6 tasks
- **Total**: 278 numbered tasks

## Success Metrics Tracking

### MVP Success Criteria:
- [ ] **10 registered volunteers**: ___ / 10 (___%)
- [ ] **5 workshops created**: ___ / 5 (___%)
- [ ] **3 successful applications**: ___ / 3 (___%)
- [ ] **Basic matching functionality**: Working (Yes/No)

### Long-term Goals:
- [ ] **200 recruited volunteers**: ___ / 200 (___%)
- [ ] **50% retention rate**: ___% achieved
- [ ] **5% super-engaged**: ___% achieved
- [ ] **30% reduction unmatched**: ___% reduction

## Timeline & Resources

**MVP Timeline**: 6-8 weeks (expanded to include full-stack implementation)
**Full Development**: 36-40 weeks (9-10 months)
**Team Size**: 2-3 developers initially
**Key Roles**: Full-stack developer, UI/UX designer, QA tester

**Technology Stack:**
- **Frontend**: React.js with TypeScript, Material-UI/MUI, React Router
- **Backend**: Node.js with Express.js
- **Testing**: Jest (backend), Playwright (frontend E2E)
- **Initial Storage**: JSON files
- **Future Database**: PostgreSQL
- **Authentication**: JWT tokens
- **State Management**: Context API or Redux Toolkit
- **Build Tools**: Vite or Create React App
- **Deployment**: Local development, then cloud (Vercel/Netlify + Railway/Heroku)

**Next Steps**: 
1. Complete remaining backend MVP features (MVP.4, MVP.5)
2. Begin frontend implementation starting with MVP.1F
3. Focus on getting working full-stack prototype quickly
4. Implement comprehensive E2E testing with Playwright
5. Plan database migration and advanced features 