export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN'
export type AppointmentStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
export type EntityStatus = 'ACTIVE' | 'DISABLED'
export type TimeSlot = 'MORNING' | 'AFTERNOON'

export interface User {
  id: string
  username: string
  password: string
  realName: string
  phone: string
  role: UserRole
  status: EntityStatus
  avatarUrl?: string
  createdAt: string
}

export type UserPublic = Omit<User, 'password'>

export interface Department {
  id: string
  name: string
  description: string
  sortOrder: number
  status: EntityStatus
}

export interface Doctor {
  id: string
  userId: string
  departmentId: string
  title: string
  specialty: string
  introduction: string
  status: EntityStatus
}

export interface Schedule {
  id: string
  doctorId: string
  workDate: string
  timeSlot: TimeSlot
  totalQuota: number
  reservedCount: number
  status: EntityStatus
}

export interface Appointment {
  id: string
  appointmentNo: string
  patientId: string
  doctorId: string
  scheduleId: string
  departmentId: string
  status: AppointmentStatus
  symptomNote: string
  createdAt: string
  cancelledAt?: string
}

export interface MedicalRecord {
  id: string
  recordNo: string
  appointmentId: string
  patientId: string
  doctorId: string
  chiefComplaint: string
  presentIllness: string
  physicalExam: string
  diagnosis: string
  treatment: string
  prescription: string
  createdAt: string
  updatedAt: string
}

export interface AppStore {
  users: User[]
  departments: Department[]
  doctors: Doctor[]
  schedules: Schedule[]
  appointments: Appointment[]
  records: MedicalRecord[]
}

export interface DoctorView extends Doctor {
  realName: string
  phone: string
  departmentName: string
}

export interface AppointmentView extends Appointment {
  patientName: string
  doctorName: string
  departmentName: string
  workDate: string
  timeSlot: TimeSlot
  doctorTitle?: string
}

export interface RecordView extends MedicalRecord {
  patientName: string
  doctorName: string
  departmentName: string
  appointmentNo: string
  workDate?: string
}

export interface StatsOverview {
  userCount: number
  doctorCount: number
  departmentCount: number
  todayAppointments: number
  pendingCount: number
  completedCount: number
  cancelledCount: number
}
