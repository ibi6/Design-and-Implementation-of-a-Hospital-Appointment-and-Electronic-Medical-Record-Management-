import type {
  AppointmentStatus,
  AppointmentView,
  Department,
  DoctorView,
  EntityStatus,
  RecordView,
  Schedule,
  StatsOverview,
  TimeSlot,
  UserPublic,
  UserRole,
} from '@/types'
import { http, qs } from './http'

export async function login(username: string, password: string): Promise<UserPublic> {
  const data = await http<{ token: string; user: UserPublic }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  return data.user
}

export async function register(payload: {
  username: string
  password: string
  realName: string
  phone: string
}): Promise<UserPublic> {
  const data = await http<{ token: string; user: UserPublic }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return data.user
}

export async function getUserById(_id: string): Promise<UserPublic | null> {
  try {
    return await http<UserPublic>('/api/auth/me')
  } catch {
    return null
  }
}

export async function getMe(): Promise<UserPublic> {
  return http<UserPublic>('/api/auth/me')
}

export async function getDepartments(includeDisabled = false): Promise<Department[]> {
  return http<Department[]>(`/api/departments${qs({ includeDisabled })}`)
}

export async function saveDepartment(
  input: Partial<Department> & { name: string },
): Promise<Department> {
  if (input.id) {
    return http<Department>(`/api/departments/${input.id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    })
  }
  return http<Department>('/api/departments', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function getDoctors(filters?: {
  departmentId?: string
  keyword?: string
  includeDisabled?: boolean
}): Promise<DoctorView[]> {
  return http<DoctorView[]>(
    `/api/doctors${qs({
      departmentId: filters?.departmentId,
      keyword: filters?.keyword,
      includeDisabled: filters?.includeDisabled,
    })}`,
  )
}

export async function getDoctor(id: string): Promise<DoctorView | null> {
  try {
    return await http<DoctorView>(`/api/doctors/${id}`)
  } catch {
    return null
  }
}

export async function getDoctorByUserId(userId: string): Promise<DoctorView | null> {
  try {
    return await http<DoctorView>(`/api/doctors/by-user/${userId}`)
  } catch {
    return null
  }
}

export async function saveDoctor(input: {
  id?: string
  userId?: string
  username?: string
  password?: string
  realName: string
  phone: string
  departmentId: string
  title: string
  specialty: string
  introduction: string
  status?: EntityStatus
}): Promise<DoctorView> {
  if (input.id) {
    return http<DoctorView>(`/api/doctors/${input.id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    })
  }
  return http<DoctorView>('/api/doctors', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function getSchedules(filters?: {
  doctorId?: string
  fromDate?: string
}): Promise<Schedule[]> {
  return http<Schedule[]>(
    `/api/schedules${qs({
      doctorId: filters?.doctorId,
      fromDate: filters?.fromDate,
    })}`,
  )
}

export async function saveSchedule(input: {
  id?: string
  doctorId: string
  workDate: string
  timeSlot: TimeSlot
  totalQuota: number
}): Promise<Schedule> {
  if (input.id) {
    return http<Schedule>(`/api/schedules/${input.id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    })
  }
  return http<Schedule>('/api/schedules', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function createAppointment(input: {
  patientId: string
  scheduleId: string
  symptomNote: string
}): Promise<AppointmentView> {
  return http<AppointmentView>('/api/appointments', {
    method: 'POST',
    body: JSON.stringify({
      scheduleId: input.scheduleId,
      symptomNote: input.symptomNote,
    }),
  })
}

export async function getAppointments(filters?: {
  patientId?: string
  doctorId?: string
  status?: AppointmentStatus | 'ALL'
}): Promise<AppointmentView[]> {
  return http<AppointmentView[]>(
    `/api/appointments${qs({
      patientId: filters?.patientId,
      doctorId: filters?.doctorId,
      status: filters?.status,
    })}`,
  )
}

export async function getAppointment(id: string): Promise<AppointmentView | null> {
  try {
    return await http<AppointmentView>(`/api/appointments/${id}`)
  } catch {
    return null
  }
}

export async function cancelAppointment(id: string, _operatorId: string): Promise<AppointmentView> {
  return http<AppointmentView>(`/api/appointments/${id}/cancel`, { method: 'POST' })
}

export async function getRecords(filters?: {
  patientId?: string
  doctorId?: string
}): Promise<RecordView[]> {
  return http<RecordView[]>(
    `/api/records${qs({
      patientId: filters?.patientId,
      doctorId: filters?.doctorId,
    })}`,
  )
}

export async function getRecord(id: string): Promise<RecordView | null> {
  try {
    return await http<RecordView>(`/api/records/${id}`)
  } catch {
    return null
  }
}

export async function getRecordByAppointment(appointmentId: string): Promise<RecordView | null> {
  try {
    return await http<RecordView>(`/api/records/by-appointment/${appointmentId}`)
  } catch {
    return null
  }
}

export async function createRecord(input: {
  appointmentId: string
  doctorUserId: string
  chiefComplaint: string
  presentIllness: string
  physicalExam: string
  diagnosis: string
  treatment: string
  prescription: string
}): Promise<RecordView> {
  return http<RecordView>('/api/records', {
    method: 'POST',
    body: JSON.stringify({
      appointmentId: input.appointmentId,
      chiefComplaint: input.chiefComplaint,
      presentIllness: input.presentIllness,
      physicalExam: input.physicalExam,
      diagnosis: input.diagnosis,
      treatment: input.treatment,
      prescription: input.prescription,
    }),
  })
}

export async function getUsers(role?: UserRole): Promise<UserPublic[]> {
  return http<UserPublic[]>(`/api/users${qs({ role })}`)
}

export async function setUserStatus(userId: string, status: EntityStatus): Promise<UserPublic> {
  return http<UserPublic>(`/api/users/${userId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
}

export async function getStats(): Promise<StatsOverview> {
  return http<StatsOverview>('/api/stats/overview')
}

export async function logoutClient(): Promise<void> {
  await http<void>('/api/auth/logout', { method: 'POST' })
}
