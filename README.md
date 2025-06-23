# Éducaloi Volunteer Management Platform

A comprehensive volunteer management system for coordinating 200+ legal volunteers providing educational workshops in schools, libraries, and community organizations across Quebec.

## 🚀 Quick Start

### Prerequisites

- **Node.js**: Version 18.0 or higher ([Download here](https://nodejs.org/))
- **npm**: Comes with Node.js
- **Git**: For version control ([Download here](https://git-scm.com/))

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd "AI test"
   ```

2. **Install root dependencies:**
   ```bash
   npm install
   ```

3. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

## 🖥️ Running the Application

### Option 1: Run Both Servers Simultaneously (Recommended)

Open **two separate terminal windows** in the project root directory:

**Terminal 1 - Backend Server:**
```bash
npm run dev
```
The backend will start on: http://localhost:3000

**Terminal 2 - Frontend Server:**
```bash
cd frontend
npm run dev
```
The frontend will start on: http://localhost:5173

### Option 2: Run Servers Individually

**Backend only:**
```bash
npm start
# or
npm run dev  # for development with auto-restart
```

**Frontend only:**
```bash
cd frontend
npm run dev
```

## 🌐 Accessing the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health

## 🧪 Running Tests

### Backend Tests
```bash
npm test
```

### Frontend Tests (Playwright E2E)
```bash
cd frontend
npm test
```

### View Test Reports
```bash
cd frontend
npm run test:report
```

## 📁 Project Structure

```
AI test/
├── backend/                 # Node.js/Express backend
│   ├── app.js              # Express application setup
│   ├── server.js           # Server configuration
│   ├── routes/             # API route handlers
│   ├── services/           # Business logic services
│   ├── middleware/         # Custom middleware
│   └── utils/              # Utility functions
├── frontend/               # React.js frontend
│   ├── src/                # Source code
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   └── main.tsx        # Application entry point
│   ├── tests/              # Playwright E2E tests
│   └── public/             # Static assets
├── data/                   # JSON data storage
├── docs/                   # Project documentation
└── tests/                  # Backend tests
```

## 🔧 Development Scripts

### Root Package Scripts
- `npm start` - Start backend server (production mode)
- `npm run dev` - Start backend server (development mode with auto-restart)
- `npm test` - Run backend tests

### Frontend Package Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run Playwright tests
- `npm run test:ui` - Run tests with UI
- `npm run test:report` - Show test report

## 🛠️ Technology Stack

### Frontend
- **React.js 19.1.0** - UI framework
- **TypeScript** - Type safety
- **Material-UI 7.1.2** - UI components
- **React Router 7.6.2** - Navigation
- **Vite 6.3.5** - Build tool
- **Axios 1.10.0** - HTTP client
- **Playwright 1.53.1** - E2E testing

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **JWT** - Authentication
- **JSON Storage** - Data persistence (MVP phase)
- **Jest** - Testing framework

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Profiles
- `GET /api/profiles` - Get all profiles
- `GET /api/profiles/:id` - Get profile by ID
- `POST /api/profiles` - Create profile
- `PUT /api/profiles/:id` - Update profile
- `DELETE /api/profiles/:id` - Delete profile

### System
- `GET /api/health` - Health check endpoint

## 🚨 Troubleshooting

### Port Already in Use
If you get `EADDRINUSE` error:

**Windows:**
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
lsof -ti:3000 | xargs kill -9
```

### Frontend Not Loading
1. Ensure both servers are running
2. Check that ports 3000 and 5173 are available
3. Clear browser cache
4. Check browser console for errors

### Common Issues

1. **Missing Dependencies**: Run `npm install` in both root and frontend directories
2. **Node Version**: Ensure Node.js version 18+ is installed
3. **Port Conflicts**: Change ports in configuration if needed
4. **Browser Compatibility**: Use modern browsers (Chrome, Firefox, Safari, Edge)

## 📊 Testing Status

- **Backend Tests**: 50 tests passing ✅
- **Frontend Tests**: 50 tests passing ✅
- **Total Coverage**: 100 end-to-end tests ✅

## 🗂️ Data Storage

Currently using JSON files for data persistence (MVP phase):
- `data/users.json` - User accounts
- `data/volunteer-profiles.json` - Volunteer profiles
- `data/workshops.json` - Workshop information
- `data/applications.json` - Workshop applications
- `data/system-config.json` - System configuration

## 🚀 Development Workflow

This project follows Test-Driven Development (TDD):

1. **Create Tests** - Write comprehensive tests first
2. **Code** - Implement functionality to pass tests
3. **Compile** - Ensure code compiles without errors
4. **Test** - Run all tests to verify functionality
5. **Update Docs** - Update documentation and commit changes

## 📈 Current MVP Status

- ✅ **MVP.1**: Project Setup & JSON Storage (12/12 tasks)
- ✅ **MVP.1F**: Frontend Setup & Foundation (12/12 tasks)
- ✅ **MVP.2**: Basic Authentication System (10/10 tasks)
- ✅ **MVP.3**: Basic User Profiles (10/10 tasks)
- ⏳ **Next**: MVP.2F Frontend Authentication System

## 🤝 Contributing

1. Follow the TDD workflow
2. Run tests before committing
3. Update documentation for new features
4. Use consistent code formatting

## 📄 License

This project is developed for Éducaloi's volunteer management needs.

## 📞 Support

For technical support or questions about the project, please refer to the documentation in the `docs/` directory:
- `docs/requirements.md` - Functional requirements
- `docs/architecture.md` - Technical architecture
- `docs/api.md` - API documentation
- `docs/plan.md` - Development plan
- `docs/deployment.md` - Deployment guide

---

**Last Updated**: January 2025
**Version**: MVP Phase - Frontend Foundation Complete 