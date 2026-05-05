<!-- Project-specific instructions for GitHub Copilot -->

# FGN Abogados Frontend - Development Guide

## Project Overview
- **Name**: FGN Abogados - Legal Management Frontend
- **Type**: React + TypeScript + Vite + TailwindCSS
- **Target**: Modern macOS-style desktop web application
- **Purpose**: Legal case and client management system
- **Status**: ✅ Project initialized and ready for development

## Architecture & Structure
- `/src/components` - Reusable UI components
- `/src/pages` - Full page views/layouts
- `/src/services` - API and business logic services
- `/src/store` - Zustand state management
- `/src/types` - TypeScript type definitions
- `/src/utils` - Helper functions and utilities
- `/src/styles` - Global styles and TailwindCSS config

## Technology Stack
- React 18+ with TypeScript
- Vite for building and dev server
- TailwindCSS v4 for styling
- Zustand for state management
- Axios for API calls
- React Router v6 for navigation

## Design System
- **Colors**: Dark blue (#1F2937), White, Grays
- **Style**: macOS-inspired (rounded borders, soft shadows, glassmorphism)
- **Fonts**: Inter / San Francisco
- **Components**: Modern, reusable, accessible

## API Integration
- **Base URL**: http://localhost:3000/api
- **Auth**: JWT Bearer tokens
- **Storage**: Token in localStorage
- **Interceptors**: Automatic token attachment to requests

## Key Features Implemented
1. ✅ Authentication system with JWT tokens
2. ✅ Role-based access control (Admin, Lawyer)
3. ✅ Dashboard with activity summary
4. ✅ Client management (CRUD operations)
5. ✅ Case management foundation
6. ✅ User management for admins
7. ✅ Modern UI components library
8. ✅ Protected routes
9. ✅ Form validation and error handling
10. ✅ Responsive design

## Development Guidelines
- Use TypeScript for type safety
- Follow React hooks patterns (useState, useEffect, useContext)
- Keep components small and focused
- Use Zustand for global state
- Extract business logic to services/hooks
- Create reusable UI components in /src/components
- Use TailwindCSS utilities for styling
- Always add proper error handling and validation

## Build & Run
```bash
npm install           # Install dependencies
npm run dev           # Start development server
npm run build         # Build for production
npm run preview       # Preview production build
npm run lint          # Run linter checks
```

## Common Tasks
- Add new page: Create file in `/src/pages/PageName.tsx`
- Create component: Add to `/src/components/`
- Add API endpoint: Create service in `/src/services/`
- State management: Use Zustand stores in `/src/store/`
- Types: Define in `/src/types/` with descriptive names

## Project Status: READY FOR DEVELOPMENT
- ✅ All dependencies installed
- ✅ Project structure created
- ✅ Core components built
- ✅ API services implemented
- ✅ State management configured
- ✅ Authentication system ready
- ✅ Build process verified (npm run build successful)
- ✅ README.md documentation complete
