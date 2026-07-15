import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PatientLayout } from '@/pages/patient/PatientLayout'
import { PatientDashboard } from '@/pages/patient/PatientDashboard'
import { DepartmentsPage } from '@/pages/patient/DepartmentsPage'
import { DoctorsPage } from '@/pages/patient/DoctorsPage'
import { DoctorDetailPage } from '@/pages/patient/DoctorDetailPage'
import { AppointmentsPage } from '@/pages/patient/AppointmentsPage'
import { RecordsPage } from '@/pages/patient/RecordsPage'
import { RecordDetailPage } from '@/pages/patient/RecordDetailPage'
import { ProfilePage } from '@/pages/patient/ProfilePage'
import { DoctorLayout } from '@/pages/doctor/DoctorLayout'
import { DoctorDashboard } from '@/pages/doctor/DoctorDashboard'
import { DoctorAppointmentsPage } from '@/pages/doctor/DoctorAppointmentsPage'
import { WriteRecordPage } from '@/pages/doctor/WriteRecordPage'
import { DoctorSchedulesPage } from '@/pages/doctor/DoctorSchedulesPage'
import { DoctorRecordsPage } from '@/pages/doctor/DoctorRecordsPage'
import { DoctorProfilePage } from '@/pages/doctor/DoctorProfilePage'
import { AdminLayout } from '@/pages/admin/AdminLayout'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { AdminDepartmentsPage } from '@/pages/admin/AdminDepartmentsPage'
import { AdminDoctorsPage } from '@/pages/admin/AdminDoctorsPage'
import { AdminSchedulesPage } from '@/pages/admin/AdminSchedulesPage'
import { AdminAppointmentsPage } from '@/pages/admin/AdminAppointmentsPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/patient"
        element={
          <ProtectedRoute roles={['PATIENT']}>
            <PatientLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PatientDashboard />} />
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="doctors" element={<DoctorsPage />} />
        <Route path="doctors/:id" element={<DoctorDetailPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="records" element={<RecordsPage />} />
        <Route path="records/:id" element={<RecordDetailPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route
        path="/doctor"
        element={
          <ProtectedRoute roles={['DOCTOR']}>
            <DoctorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DoctorDashboard />} />
        <Route path="appointments" element={<DoctorAppointmentsPage />} />
        <Route path="appointments/:id/record" element={<WriteRecordPage />} />
        <Route path="schedules" element={<DoctorSchedulesPage />} />
        <Route path="records" element={<DoctorRecordsPage />} />
        <Route path="profile" element={<DoctorProfilePage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="departments" element={<AdminDepartmentsPage />} />
        <Route path="doctors" element={<AdminDoctorsPage />} />
        <Route path="schedules" element={<AdminSchedulesPage />} />
        <Route path="appointments" element={<AdminAppointmentsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
      </Route>

      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
