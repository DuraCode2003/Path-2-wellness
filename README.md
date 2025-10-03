# Path2Wellness Unified Navigation System

A centralized React Router-based navigation system that integrates all Path2Wellness applications with role-based routing and authentication.

## 🎯 Overview

The unified app serves as the main entry point for the Path2Wellness monorepo, providing seamless navigation between different applications based on user roles.

## 🏗️ Architecture

```
unified-app/
├── src/
│   ├── components/
│   │   ├── Homepage.jsx           # Landing page with Get Started button
│   │   ├── ProfileManagement.jsx  # Login/Authentication page
│   │   ├── PatientPortal.jsx      # Patient dashboard wrapper
│   │   ├── DoctorDashboard.jsx    # Doctor dashboard wrapper
│   │   ├── AdminDashboard.jsx     # Admin dashboard wrapper
│   │   ├── ProtectedRoute.jsx     # Route protection component
│   │   └── NotFound.jsx           # 404 error page
│   ├── contexts/
│   │   └── AuthContext.jsx        # Authentication state management
│   ├── App.jsx                    # Main router configuration
│   └── main.jsx                   # Application entry point
├── package.json
├── vite.config.js
├── tailwind.config.js
└── Dockerfile
```

## 🚀 Navigation Flow

### 1. Homepage → Get Started
- **Route**: `/`
- **Component**: `Homepage`
- **Action**: "Get Started" button navigates to `/profile-management`
- **Features**: 
  - Modern landing page with feature showcase
  - Automatic redirect to dashboard if already logged in
  - Responsive design with Tailwind CSS

### 2. Profile Management (Login)
- **Route**: `/profile-management`
- **Component**: `ProfileManagement`
- **Features**:
  - Email/username and password authentication
  - Demo credentials for testing
  - Integration with existing authentication APIs
  - Automatic role-based redirection after login

### 3. Role-Based Dashboards

#### Patient Portal
- **Route**: `/home/*`
- **Component**: `PatientPortal`
- **Access**: Patients only
- **Features**: Health dashboard, appointments, medical records

#### Doctor Dashboard
- **Route**: `/doctor-dashboard/*`
- **Component**: `DoctorDashboard`
- **Access**: Doctors only
- **Features**: Patient management, escalation tickets, schedule

#### Admin Dashboard
- **Route**: `/admin-dashboard/*`
- **Component**: `AdminDashboard`
- **Access**: Admins only
- **Features**: User management, system monitoring, analytics

## 🔐 Authentication System

### API Endpoints
The unified app integrates with existing authentication systems:

1. **Primary**: PathAI API (`http://localhost:5002/api/auth/login`)
2. **Fallback**: Profile Management API (`http://localhost:3004/api/auth/users/login`)

### Demo Credentials
```javascript
// Admin Access
Email: admin@path2wellness.com
Password: Admin123!@#

// Doctor Access  
Email: doctor@path2wellness.com
Password: Doctor123!@#

// Patient Access
Email: patient@path2wellness.com
Password: Patient123!@#
```

### Authentication Flow
1. User enters credentials on `/profile-management`
2. System attempts login via PathAI API
3. If PathAI fails, fallback to Profile Management API
4. On success, JWT token stored in localStorage
5. User redirected based on role:
   - `Patient` → `/home`
   - `Doctor` → `/doctor-dashboard`
   - `Admin` → `/admin-dashboard`

## 🛡️ Route Protection

### ProtectedRoute Component
- Checks authentication status
- Validates user roles
- Redirects unauthorized users
- Shows loading states during authentication

### Route Configuration
```javascript
// Public Routes
/ (Homepage)
/profile-management (Login)
/404 (Not Found)

// Protected Routes
/home/* (Patient only)
/doctor-dashboard/* (Doctor only)  
/admin-dashboard/* (Admin only)
```

## 🎨 UI/UX Features

### Design System
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Theme**: Modern gradients with glassmorphism effects

### Responsive Design
- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly interface elements

### User Experience
- Smooth transitions and animations
- Loading states and error handling
- Intuitive navigation patterns
- Accessibility considerations

## 🚀 Getting Started

### Development Mode
```bash
cd unified-app
npm install
npm run dev
```
Access at: http://localhost:3001

### Production Build
```bash
npm run build
npm run preview
```

### Docker Deployment
```bash
docker build -t path2wellness-unified .
docker run -p 3000:3000 path2wellness-unified
```

## 🔧 Configuration

### Environment Variables
The app automatically detects and connects to:
- Profile Management API: `http://localhost:3004`
- PathAI API: `http://localhost:5002`

### Vite Configuration
- Path aliases for clean imports
- Development server with HMR
- Production optimizations

## 🧪 Testing the System

### Manual Testing Steps
1. **Homepage Navigation**
   - Visit http://localhost:3001
   - Click "Get Started" → Should navigate to login

2. **Authentication Testing**
   - Use demo credentials to test each role
   - Verify proper dashboard redirection
   - Test logout functionality

3. **Route Protection**
   - Try accessing protected routes without login
   - Verify role-based access restrictions
   - Test invalid route handling (404)

### Integration Points
- ✅ MongoDB Atlas authentication
- ✅ JWT token management
- ✅ Role-based access control
- ✅ Existing API compatibility

## 📁 Monorepo Structure

```
Path2Wellness/
├── apps/
│   ├── homepage/              # Legacy homepage (port 5173)
│   ├── profile-management/    # Auth backend (port 3004)
│   ├── home/                  # Patient portal (port 3001)
│   ├── doctor-dashboard/      # Doctor dashboard (port 3002)
│   └── admin-dashboard/       # Admin dashboard (port 3003)
├── unified-app/               # Main navigation app (port 3001)
├── pathAi/                    # AI system (port 5002)
└── docker-compose.yml         # Container orchestration
```

## 🔄 Migration Notes

### From Individual Apps
- Each app maintains its existing functionality
- Unified app provides centralized entry point
- Existing APIs remain unchanged
- Docker configuration updated for new structure

### Backward Compatibility
- Legacy routes still accessible
- Existing authentication systems preserved
- Database connections maintained
- API endpoints unchanged

## 🚀 Deployment

### Development
```bash
# Start all services
docker-compose up -d

# Or start unified app only
cd unified-app && npm run dev
```

### Production
- Unified app serves as main entry point on port 3000
- Individual services run on their respective ports
- Load balancer can route to unified app
- CDN integration for static assets

## 📊 Performance

### Optimizations
- Code splitting by route
- Lazy loading of components
- Optimized bundle sizes
- Fast refresh in development

### Monitoring
- Authentication success rates
- Route navigation patterns
- Error tracking and logging
- Performance metrics

## 🔮 Future Enhancements

### Planned Features
- Single Sign-On (SSO) integration
- Multi-factor authentication
- Advanced role permissions
- Real-time notifications
- Progressive Web App (PWA) features

### Scalability
- Micro-frontend architecture ready
- API gateway integration
- Horizontal scaling support
- Multi-tenant capabilities

---

## 🎉 Success Metrics

✅ **Unified Navigation**: Single entry point for all applications  
✅ **Role-Based Routing**: Automatic redirection based on user roles  
✅ **Folder-Based Structure**: Clean monorepo organization  
✅ **Authentication Integration**: Works with existing MongoDB Atlas system  
✅ **Modern UI/UX**: Professional healthcare application design  
✅ **Docker Ready**: Full containerization support  
✅ **Production Ready**: Optimized builds and deployment configuration  

The unified navigation system successfully integrates all Path2Wellness applications into a cohesive, role-based healthcare management platform.
