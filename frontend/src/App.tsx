import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { PageLoading } from '@/components/ui/Spinner'

const LandingPage = lazy(async () => ({ default: (await import('@/pages/LandingPage')).LandingPage }))
const LoginPage = lazy(async () => ({ default: (await import('@/pages/LoginPage')).LoginPage }))
const RegisterPage = lazy(async () => ({ default: (await import('@/pages/RegisterPage')).RegisterPage }))
const NotFoundPage = lazy(async () => ({ default: (await import('@/pages/NotFoundPage')).NotFoundPage }))
const PatientLayout = lazy(async () => ({ default: (await import('@/pages/patient/PatientLayout')).PatientLayout }))
const PatientDashboard = lazy(async () => ({ default: (await import('@/pages/patient/PatientDashboard')).PatientDashboard }))
const DepartmentsPage = lazy(async () => ({ default: (await import('@/pages/patient/DepartmentsPage')).DepartmentsPage }))
const DoctorsPage = lazy(async () => ({ default: (await import('@/pages/patient/DoctorsPage')).DoctorsPage }))
const DoctorDetailPage = lazy(async () => ({ default: (await import('@/pages/patient/DoctorDetailPage')).DoctorDetailPage }))
const AppointmentsPage = lazy(async () => ({ default: (await import('@/pages/patient/AppointmentsPage')).AppointmentsPage }))
const RecordsPage = lazy(async () => ({ default: (await import('@/pages/patient/RecordsPage')).RecordsPage }))
const RecordDetailPage = lazy(async () => ({ default: (await import('@/pages/patient/RecordDetailPage')).RecordDetailPage }))
const ProfilePage = lazy(async () => ({ default: (await import('@/pages/patient/ProfilePage')).ProfilePage }))
const DoctorLayout = lazy(async () => ({ default: (await import('@/pages/doctor/DoctorLayout')).DoctorLayout }))
const DoctorDashboard = lazy(async () => ({ default: (await import('@/pages/doctor/DoctorDashboard')).DoctorDashboard }))
const DoctorAppointmentsPage = lazy(async () => ({ default: (await import('@/pages/doctor/DoctorAppointmentsPage')).DoctorAppointmentsPage }))
const WriteRecordPage = lazy(async () => ({ default: (await import('@/pages/doctor/WriteRecordPage')).WriteRecordPage }))
const DoctorSchedulesPage = lazy(async () => ({ default: (await import('@/pages/doctor/DoctorSchedulesPage')).DoctorSchedulesPage }))
const DoctorRecordsPage = lazy(async () => ({ default: (await import('@/pages/doctor/DoctorRecordsPage')).DoctorRecordsPage }))
const DoctorProfilePage = lazy(async () => ({ default: (await import('@/pages/doctor/DoctorProfilePage')).DoctorProfilePage }))
const AdminLayout = lazy(async () => ({ default: (await import('@/pages/admin/AdminLayout')).AdminLayout }))
const AdminDashboard = lazy(async () => ({ default: (await import('@/pages/admin/AdminDashboard')).AdminDashboard }))
const AdminDepartmentsPage = lazy(async () => ({ default: (await import('@/pages/admin/AdminDepartmentsPage')).AdminDepartmentsPage }))
const AdminDoctorsPage = lazy(async () => ({ default: (await import('@/pages/admin/AdminDoctorsPage')).AdminDoctorsPage }))
const AdminSchedulesPage = lazy(async () => ({ default: (await import('@/pages/admin/AdminSchedulesPage')).AdminSchedulesPage }))
const AdminAppointmentsPage = lazy(async () => ({ default: (await import('@/pages/admin/AdminAppointmentsPage')).AdminAppointmentsPage }))
const AdminUsersPage = lazy(async () => ({ default: (await import('@/pages/admin/AdminUsersPage')).AdminUsersPage }))

export default function App() {
  return (
    <Suspense fallback={<PageLoading label="正在加载页面..." />}>
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
    </Suspense>
  )
}
