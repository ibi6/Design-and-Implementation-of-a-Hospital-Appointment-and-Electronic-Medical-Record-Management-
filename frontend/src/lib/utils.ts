import { clsx, type ClassValue } from 'clsx'
import type { AppointmentStatus, TimeSlot } from '@/types'

const HOSPITAL_TIME_ZONE = 'Asia/Shanghai'
const hospitalDateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: HOSPITAL_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** Formats an instant as a calendar date in the hospital's operating time zone. */
function formatHospitalDate(date: Date) {
  let year = ''
  let month = ''
  let day = ''
  for (const part of hospitalDateFormatter.formatToParts(date)) {
    if (part.type === 'year') year = part.value
    if (part.type === 'month') month = part.value
    if (part.type === 'day') day = part.value
  }
  if (!year || !month || !day) throw new Error('无法格式化医院日期')
  return `${year}-${month}-${day}`
}

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function delay(ms = 380) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function genId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

export function genNo(prefix: string) {
  const d = new Date()
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  return `${prefix}${stamp}${Math.floor(Math.random() * 9000 + 1000)}`
}

export function formatDate(iso: string) {
  return iso.slice(0, 10)
}

export function todayStr() {
  return formatHospitalDate(new Date())
}

export function addDays(base: Date, days: number) {
  const shifted = new Date(base.getTime() + days * 24 * 60 * 60 * 1000)
  return formatHospitalDate(shifted)
}

export const TIME_SLOT_LABEL: Record<TimeSlot, string> = {
  MORNING: '上午 08:30-12:00',
  AFTERNOON: '下午 14:00-17:30',
}

export const STATUS_LABEL: Record<AppointmentStatus, string> = {
  PENDING: '待就诊',
  COMPLETED: '已就诊',
  CANCELLED: '已取消',
  NO_SHOW: '爽约',
}

export const ROLE_LABEL: Record<string, string> = {
  PATIENT: '患者',
  DOCTOR: '医生',
  ADMIN: '管理员',
}

export function statusBadgeClass(status: AppointmentStatus) {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-50 text-amber-700 ring-amber-200'
    case 'COMPLETED':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
    case 'CANCELLED':
      return 'bg-slate-100 text-slate-600 ring-slate-200'
    case 'NO_SHOW':
      return 'bg-rose-50 text-rose-700 ring-rose-200'
    default:
      return 'bg-slate-100 text-slate-600 ring-slate-200'
  }
}
