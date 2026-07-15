import { Outlet } from 'react-router-dom'
import {
  Building2,
  CalendarDays,
  FileText,
  Home,
  Stethoscope,
  UserRound,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'

const nav = [
  { to: '/patient', label: '工作台', icon: Home, end: true },
  { to: '/patient/departments', label: '找科室', icon: Building2 },
  { to: '/patient/doctors', label: '找医生', icon: Stethoscope },
  { to: '/patient/appointments', label: '我的预约', icon: CalendarDays },
  { to: '/patient/records', label: '我的病历', icon: FileText },
  { to: '/patient/profile', label: '个人中心', icon: UserRound },
]

export function PatientLayout() {
  return (
    <AppShell nav={nav} title="患者中心" subtitle="预约挂号 · 病历查询">
      <Outlet />
    </AppShell>
  )
}
