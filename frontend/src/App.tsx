import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import AcademicResultsPage from './pages/AcademicResultsPage';
import DashboardPage from './pages/DashboardPage';
import DocumentsPage from './pages/DocumentsPage';
import ExaminationsPage from './pages/ExaminationsPage';
import FeesPage from './pages/FeesPage';
import HelsbPage from './pages/HelsbPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import RegistrationsPage from './pages/RegistrationsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/registrations" element={<RegistrationsPage />} />
              <Route path="/fees" element={<FeesPage />} />
              <Route path="/examinations" element={<ExaminationsPage />} />
              <Route path="/academic-results" element={<AcademicResultsPage />} />
              <Route path="/helsb" element={<HelsbPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
