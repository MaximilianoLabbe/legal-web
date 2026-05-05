# FGN Abogados - Legal Management Frontend

A modern, professional desktop web application for managing legal cases and clients at FGN Abogados. Built with React, TypeScript, Vite, and Tailwind CSS.

## 🎯 Features

### 🔐 Authentication
- Secure JWT-based authentication
- Login with role-based access control
- Session management with localStorage persistence

### 👤 Modules

#### Lawyer Dashboard
- **Dashboard**: Real-time activity summary with key metrics
- **Client Management**: 
  - Create, read, update, and delete clients
  - Store client information (RUT, name, phone, email)
  - Search and filter capabilities
- **Case Management**:
  - Track case status (open, in progress, closed, paused)
  - Add notes and updates to cases
  - View case history and details
- **Search & Filters**: Advanced filtering across all modules

#### Admin Panel
- **User Management**: Create and manage system users
- **Access Control**: Set user roles and permissions
- **System Administration**: Configure system settings

### 🎨 Design
- Modern macOS-inspired UI with:
  - Rounded corners and soft shadows
  - Glassmorphism effects
  - Clean, professional typography
  - Responsive design for all screen sizes
  - Dark sidebar with light main content area
- Tailwind CSS for efficient styling
- Smooth animations and transitions

## 🛠️ Tech Stack

- **Frontend Framework**: React 18+
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **API Client**: Axios
- **Routing**: React Router v6
- **Icons**: React Icons
- **Package Manager**: npm

## 📦 Project Structure

```
src/
├── components/           # Reusable components
│   ├── common/          # Common components (Dashboard, etc)
│   ├── layout/          # Layout components (Sidebar, Header)
│   └── ui/              # UI components (Button, Input, Card, etc)
├── pages/               # Page components
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── ClientsPage.tsx
│   ├── CreateClientPage.tsx
│   ├── CasesPage.tsx
│   ├── AdminUsersPage.tsx
│   ├── ProtectedRoute.tsx
│   └── MainLayout.tsx
├── services/            # API services
│   ├── api.ts
│   ├── authService.ts
│   ├── clientService.ts
│   ├── caseService.ts
│   ├── userService.ts
│   └── index.ts
├── store/               # Zustand stores
│   ├── authStore.ts
│   ├── clientStore.ts
│   ├── caseStore.ts
│   └── index.ts
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── constants/           # App constants
├── styles/              # Global styles
├── App.tsx              # Main app component
└── main.tsx             # React DOM entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm 9+
- Backend API running on `http://localhost:3000`

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd frontend-ls
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your backend API URL:
```env
VITE_API_URL=http://localhost:3000/api
VITE_API_TIMEOUT=30000
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173/`

### Build

Build for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## 🌐 Deployment

### Deploy to Vercel

This project is configured and optimized for deployment on [Vercel](https://vercel.com).

#### Prerequisites
- Vercel account (sign up at https://vercel.com)
- GitHub repository with this code

#### Deployment Steps

1. **Push your code to GitHub**:
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to https://vercel.com
   - Click "Add New Project"
   - Select your GitHub repository
   - Vercel will auto-detect it's a Vite project

3. **Configure Environment Variables**:
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add the following variable:
     ```
     VITE_API_URL=https://your-api-domain.com/api
     ```
   - You can also add it per environment (Production, Preview, Development)

4. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically build and deploy your application
   - Your app will be available at `https://<project-name>.vercel.app`

#### Production Environment Variables

Make sure to set the correct API URL for production:
- **Development**: `http://localhost:3000/api`
- **Preview/Staging**: `https://staging-api.example.com/api`
- **Production**: `https://api.example.com/api`

#### Custom Domain

To use a custom domain with Vercel:
1. Go to Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

#### Automatic Deployments

Every push to your GitHub repository will automatically trigger a new deployment on Vercel.

#### Build Configuration

The `vercel.json` file contains the build configuration:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Development Command**: `npm run dev`
- **Framework**: Vite

No additional configuration is needed for most projects.

## 🔑 Demo Credentials

- **Email**: admin@example.com
- **Password**: password123
- **Role**: Admin (full access)

## 📋 API Integration

The application connects to the backend API with the following endpoints:

### Authentication
- `POST /api/auth/login` - Login with credentials

### Clients
- `GET /api/clients` - List all clients
- `POST /api/clients` - Create new client
- `GET /api/clients/{id}` - Get client details
- `PUT /api/clients/{id}` - Update client
- `DELETE /api/clients/{id}` - Delete client
- `GET /api/clients/stats/count` - Get client statistics

### Cases
- `GET /api/cases` - List all cases
- `POST /api/cases` - Create new case
- `GET /api/cases/{id}` - Get case details
- `PUT /api/cases/{id}` - Update case
- `DELETE /api/cases/{id}` - Delete case
- `GET /api/cases/client/{client_id}` - Get cases by client

### Users (Admin Only)
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `GET /api/users/{id}` - Get user details
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

## 🎨 UI Components

### Basic Components
- **Button**: Primary, secondary, danger, and ghost variants
- **Input**: Text inputs with validation and error handling
- **Card**: Container component with shadows and rounded corners
- **Badge**: Status indicators with multiple variants
- **Alert**: Notification component with different alert types

### Layout Components
- **Sidebar**: Navigation sidebar with mobile responsiveness
- **Header**: Page header with title and optional action

## 🔒 Security Features

- JWT authentication with Bearer tokens
- Secure token storage in localStorage
- Automatic token refresh on 401 responses
- Role-based access control (RBAC)
- Protected routes with authentication checks
- Form validation and error handling

## 📱 Responsive Design

- Mobile-first approach
- Responsive grid layouts
- Mobile navigation toggle
- Adaptive component sizing
- Touch-friendly interface elements

## 🎯 Future Enhancements

- [ ] Dark mode implementation
- [ ] Advanced case search and filtering
- [ ] Case document management
- [ ] Email notifications
- [ ] Export reports (PDF/Excel)
- [ ] Multi-language support
- [ ] Real-time collaboration features
- [ ] Advanced analytics dashboard

## 📝 Code Style

- ESLint configuration for code quality
- TypeScript strict mode enabled
- Consistent formatting with Prettier
- Component-based architecture
- Proper type definitions for all props

## 🐛 Known Issues

None currently reported.

## 📞 Support

For issues or questions, please contact the development team.

## 📄 License

© 2026 FGN Abogados. All rights reserved.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Commit with clear messages
4. Push to the branch
5. Create a Pull Request

---

**Last Updated**: May 1, 2026  
**Version**: 1.0.0

import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
