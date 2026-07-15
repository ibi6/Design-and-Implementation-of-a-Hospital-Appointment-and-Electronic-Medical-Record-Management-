import { Outlet } from 'react-router-dom'
import { CalendarDays, ClipboardPlus, FileText, Home, UserRound } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'

const nav = [
  { to: '/doctor', label: '工作台', icon: Home, end: true },
  { to: '/doctor/appointments', label: '接诊列表', icon: ClipboardPlus },
  { to: '/doctor/schedules', label: '我的排班', icon: CalendarDays },
  { to: '/doctor/records', label: '历史病历', icon: FileText },
  { to: '/doctor/profile', label: '个人中心', icon: UserRound },
]

export function DoctorLayout() {
  return (
    <AppShell nav={nav} title="医生工作站" subtitle="接诊 · 写病历 · 排班">
      <Outlet />
    </AppShell>
  )
}
