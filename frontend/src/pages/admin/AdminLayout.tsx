import { Outlet } from 'react-router-dom'
import {
  Building2,
  CalendarRange,
  ClipboardList,
  Home,
  Stethoscope,
  Users,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'

const nav = [
  { to: '/admin', label: '数据看板', icon: Home, end: true },
  { to: '/admin/departments', label: '科室管理', icon: Building2 },
  { to: '/admin/doctors', label: '医生管理', icon: Stethoscope },
  { to: '/admin/schedules', label: '排班管理', icon: CalendarRange },
  { to: '/admin/appointments', label: '预约管理', icon: ClipboardList },
  { to: '/admin/users', label: '用户管理', icon: Users },
]

export function AdminLayout() {
  return (
    <AppShell nav={nav} title="系统管理" subtitle="组织 · 号源 · 数据总览">
      <Outlet />
    </AppShell>
  )
}
