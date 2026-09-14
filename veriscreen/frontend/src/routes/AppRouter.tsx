import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import PublicLayout from '../layouts/PublicLayout';
import StudentLayout from '../layouts/StudentLayout';
import HelsbStudentLayout from '../layouts/HelsbStudentLayout';
import OfficerLayout from '../layouts/OfficerLayout';
import AdminLayout from '../layouts/AdminLayout';

import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';

import StudentDashboard from '../pages/student/StudentDashboard';
import StudentProfile from '../pages/student/StudentProfile';
import DocumentsPage from '../pages/student/DocumentsPage';
import StudentApplications from '../pages/student/StudentApplications';
import AcademicRecordsPage from '../pages/student/AcademicRecordsPage';
import RegistrationRecordPage from '../pages/student/RegistrationRecordPage';
import FeeHistoryRecordPage from '../pages/student/FeeHistoryRecordPage';
import AcademicResultsRecordPage from '../pages/student/AcademicResultsRecordPage';
import SettingsPage from '../pages/SettingsPage';
import ProfilePage from '../pages/ProfilePage';

import HelsbStudentDashboard from '../pages/helsb/HelsbStudentDashboard';
import HelsbPayment from '../pages/helsb/HelsbPayment';
import HelsbBankDetails from '../pages/helsb/HelsbBankDetails';
import HelsbScreeningResult from '../pages/helsb/HelsbScreeningResult';
import HelsbContract from '../pages/helsb/HelsbContract';

import OfficerDashboard from '../pages/officer/OfficerDashboard';
import OfficerApplications from '../pages/officer/OfficerApplications';
import OfficerApplicationDetail from '../pages/officer/OfficerApplicationDetail';
import OfficerSearch from '../pages/officer/OfficerSearch';

import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminAuditLogs from '../pages/admin/AdminAuditLogs';

import NotificationsPage from '../pages/NotificationsPage';
import VerificationPage from '../pages/public/VerificationPage';
import { Page401, Page403, Page404, Page500 } from '../pages/errors/ErrorPages';

import ProtectedRoute from './ProtectedRoute';
import type { Role } from '../types';

const guard = (roles: Role[], Layout: React.ComponentType) => (
  <ProtectedRoute allowedRoles={roles}>
    <Layout />
  </ProtectedRoute>
);

const AppRouter: React.FC = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<PublicLayout />}>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    </Route>

    {/* Standalone public */}
    <Route path="/verify/:verificationCode" element={<VerificationPage />} />
    <Route path="/401" element={<Page401 />} />
    <Route path="/403" element={<Page403 />} />
    <Route path="/500" element={<Page500 />} />

    {/* Student */}
    <Route element={guard(['STUDENT'], StudentLayout)}>
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/student/profile" element={<StudentProfile />} />
      <Route path="/student/documents" element={<DocumentsPage />} />
      <Route path="/student/applications" element={<StudentApplications />} />
      <Route path="/student/records" element={<AcademicRecordsPage />} />
      <Route path="/student/records/registration" element={<RegistrationRecordPage />} />
      <Route path="/student/records/fees" element={<FeeHistoryRecordPage />} />
      <Route path="/student/records/results" element={<AcademicResultsRecordPage />} />
      <Route path="/student/settings" element={<SettingsPage />} />
      <Route path="/student/notifications" element={<NotificationsPage />} />
    </Route>

    {/* HELSB Student */}
    <Route element={guard(['HELSB_STUDENT'], HelsbStudentLayout)}>
      <Route path="/helsb/dashboard" element={<HelsbStudentDashboard />} />
      <Route path="/helsb/payment" element={<HelsbPayment />} />
      <Route path="/helsb/bank-details" element={<HelsbBankDetails />} />
      <Route path="/helsb/screening" element={<HelsbScreeningResult />} />
      <Route path="/helsb/contract" element={<HelsbContract />} />
      <Route path="/helsb/profile" element={<ProfilePage />} />
      <Route path="/helsb/settings" element={<SettingsPage />} />
      <Route path="/helsb/notifications" element={<NotificationsPage />} />
    </Route>

    {/* Officer */}
    <Route element={guard(['HELSB_OFFICER'], OfficerLayout)}>
      <Route path="/officer/dashboard" element={<OfficerDashboard />} />
      <Route path="/officer/applications" element={<OfficerApplications />} />
      <Route path="/officer/applications/:id" element={<OfficerApplicationDetail />} />
      <Route path="/officer/search" element={<OfficerSearch />} />
      <Route path="/officer/profile" element={<ProfilePage />} />
      <Route path="/officer/settings" element={<SettingsPage />} />
      <Route path="/officer/notifications" element={<NotificationsPage />} />
    </Route>

    {/* Admin */}
    <Route element={guard(['ADMIN'], AdminLayout)}>
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
      <Route path="/admin/profile" element={<ProfilePage />} />
      <Route path="/admin/settings" element={<SettingsPage />} />
      <Route path="/admin/notifications" element={<NotificationsPage />} />
    </Route>

    {/* Root redirect */}
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="*" element={<Page404 />} />
  </Routes>
);

export default AppRouter;
