import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ConfirmProvider } from './context/ConfirmContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';

import Home from './pages/Home.jsx';
import Courses from './pages/Courses.jsx';
import CourseDetail from './pages/CourseDetail.jsx';
import Trainings from './pages/Trainings.jsx';
import TrainingDetail from './pages/TrainingDetail.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import InternshipApplication from './pages/InternshipApplication.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import VerifyCertificate from './pages/VerifyCertificate.jsx';
import Terms from './pages/Terms.jsx';
import Privacy from './pages/Privacy.jsx';
import RefundPolicy from './pages/RefundPolicy.jsx';
import NotFound from './pages/NotFound.jsx';

import StudentLayout from './layouts/StudentLayout.jsx';
import DashboardHome from './pages/student/DashboardHome.jsx';
import MyCourses from './pages/student/MyCourses.jsx';
import MyTrainings from './pages/student/MyTrainings.jsx';
import Assignments from './pages/student/Assignments.jsx';
import Tests from './pages/student/Tests.jsx';
import Certificates from './pages/student/Certificates.jsx';
import Payments from './pages/student/Payments.jsx';
import Profile from './pages/student/Profile.jsx';
import ChangePassword from './pages/student/ChangePassword.jsx';
import TakeTest from './pages/student/TakeTest.jsx';

import AdminLayout from './layouts/AdminLayout.jsx';
import AdminDashboardHome from './admin/DashboardHome.jsx';
import AdminStudents from './admin/Students.jsx';
import AdminCourses from './admin/Courses.jsx';
import CourseEditor from './admin/CourseEditor.jsx';
import AdminTrainings from './admin/Trainings.jsx';
import InternshipApplications from './admin/InternshipApplications.jsx';
import TrainingEditor from './admin/TrainingEditor.jsx';
import AdminAssignments from './admin/AdminAssignments.jsx';
import AdminTests from './admin/AdminTests.jsx';
import AdminCertificates from './admin/AdminCertificates.jsx';
import CertificateTemplate from './admin/CertificateTemplate.jsx';
import AdminPayments from './admin/AdminPayments.jsx';
import EmailLogs from './admin/EmailLogs.jsx';
import AdminReports from './admin/Reports.jsx';
import AuditLogs from './admin/AuditLogs.jsx';

export default function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <AuthProvider>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:slug" element={<CourseDetail />} />
          <Route path="/trainings" element={<Trainings />} />
          <Route path="/trainings/:slug" element={<TrainingDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/apply-internship" element={<InternshipApplication />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify-certificate" element={<VerifyCertificate />} />
          <Route path="/verify-certificate/:certificateId" element={<VerifyCertificate />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="courses" element={<MyCourses />} />
            <Route path="trainings" element={<MyTrainings />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="tests" element={<Tests />} />
            <Route path="tests/:id" element={<TakeTest />} />
            <Route path="certificates" element={<Certificates />} />
            <Route path="payments" element={<Payments />} />
            <Route path="profile" element={<Profile />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboardHome />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="courses/:id" element={<CourseEditor />} />
            <Route path="trainings" element={<AdminTrainings />} />
            <Route path="trainings/:id" element={<TrainingEditor />} />
            <Route path="internship-applications" element={<InternshipApplications />} />
            <Route path="assignments" element={<AdminAssignments />} />
            <Route path="tests" element={<AdminTests />} />
            <Route path="certificates" element={<AdminCertificates />} />
            <Route path="certificates/template" element={<CertificateTemplate />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="email-logs" element={<EmailLogs />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="audit-logs" element={<AuditLogs />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </AuthProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}
