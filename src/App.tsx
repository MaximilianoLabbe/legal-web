import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ClientsPage } from './pages/ClientsPage';
import { ClientDetailsPage } from './pages/ClientDetailsPage';
import { CreateClientPage } from './pages/CreateClientPage';
import { CasesPage } from './pages/CasesPage';
import { CreateCasePage } from './pages/CreateCasePage';
import { EditCasePage } from './pages/EditCasePage';
import { TasksPage } from './pages/TasksPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { CreateUserPage } from './pages/CreateUserPage';
import { ProtectedRoute } from './pages/ProtectedRoute';
import { RoleBasedRoute } from './components/layout/RoleBasedRoute';
import { MainLayout } from './pages/MainLayout';

// Styles
import './styles/index.css';

function App() {
  const { token } = useAuthStore();

  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/clients/:clientId" element={<ClientDetailsPage />} />
          <Route path="/clients/:clientId/edit" element={<CreateClientPage />} />
          <Route path="/clients/create" element={<CreateClientPage />} />
          <Route path="/clients/new" element={<CreateClientPage />} />
          <Route path="/cases" element={<CasesPage />} />
          <Route path="/cases/new" element={<CreateCasePage />} />
          <Route path="/cases/:caseId" element={<EditCasePage />} />
          <Route path="/cases/create" element={<CreateCasePage />} />
          <Route path="/tasks" element={<TasksPage />} />

          {/* Admin only routes - Protected by role */}
          <Route
            path="/admin/users"
            element={
              <RoleBasedRoute requiredRole="admin">
                <AdminUsersPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/admin/users/create"
            element={
              <RoleBasedRoute requiredRole="admin">
                <CreateUserPage />
              </RoleBasedRoute>
            }
          />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
