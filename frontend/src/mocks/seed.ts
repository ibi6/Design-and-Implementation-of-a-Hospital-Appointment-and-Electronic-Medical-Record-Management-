import type { AppStore, Schedule, TimeSlot } from '@/types'
import { addDays } from '@/lib/utils'

function buildSchedules(): Schedule[] {
  const doctorIds = ['doc_li', 'doc_wang', 'doc_chen', 'doc_zhao', 'doc_liu', 'doc_sun']
  const slots: TimeSlot[] = ['MORNING', 'AFTERNOON']
  const schedules: Schedule[] = []
  const base = new Date()

  doctorIds.forEach((doctorId, di) => {
    for (let d = 0; d < 7; d++) {
      slots.forEach((timeSlot, si) => {
        schedules.push({
          id: `sch_${doctorId}_${d}_${timeSlot}`,
          doctorId,
          workDate: addDays(base, d),
          timeSlot,
          totalQuota: 10,
          reservedCount: di === 0 && d === 1 && si === 0 ? 1 : 0,
          status: 'ACTIVE',
        })
      })
    }
  })
  return schedules
}

export function createSeed(): AppStore {
  const departments = [
    {
      id: 'dep_internal',
      name: '内科',
      description: '呼吸、消化、心血管等常见内科疾病诊治',
      sortOrder: 1,
      status: 'ACTIVE' as const,
    },
    {
      id: 'dep_surgery',
      name: '外科',
      description: '普通外科门诊与术前评估',
      sortOrder: 2,
      status: 'ACTIVE' as const,
    },
    {
      id: 'dep_pedia',
      name: '儿科',
      description: '儿童常见病、生长发育咨询',
      sortOrder: 3,
      status: 'ACTIVE' as const,
    },
    {
      id: 'dep_gyn',
      name: '妇科',
      description: '妇科常见病与健康体检',
      sortOrder: 4,
      status: 'ACTIVE' as const,
    },
    {
      id: 'dep_ortho',
      name: '骨科',
      description: '骨关节疼痛、运动损伤',
      sortOrder: 5,
      status: 'ACTIVE' as const,
    },
    {
      id: 'dep_derm',
      name: '皮肤科',
      description: '皮肤过敏、痤疮、皮炎等',
      sortOrder: 6,
      status: 'ACTIVE' as const,
    },
  ]

  const users = [
    {
      id: 'u_patient',
      username: 'patient',
      password: '123456',
      realName: '张小明',
      phone: '13800001111',
      role: 'PATIENT' as const,
      status: 'ACTIVE' as const,
      createdAt: '2026-07-01T08:00:00.000Z',
    },
    {
      id: 'u_patient2',
      username: 'patient2',
      password: '123456',
      realName: '王芳',
      phone: '13800001112',
      role: 'PATIENT' as const,
      status: 'ACTIVE' as const,
      createdAt: '2026-07-02T08:00:00.000Z',
    },
    {
      id: 'u_doctor',
      username: 'doctor',
      password: '123456',
      realName: '李华',
      phone: '13800002222',
      role: 'DOCTOR' as const,
      status: 'ACTIVE' as const,
      createdAt: '2026-07-01T08:00:00.000Z',
    },
    {
      id: 'u_doctor2',
      username: 'doctor2',
      password: '123456',
      realName: '王强',
      phone: '13800002223',
      role: 'DOCTOR' as const,
      status: 'ACTIVE' as const,
      createdAt: '2026-07-01T08:00:00.000Z',
    },
    {
      id: 'u_doctor3',
      username: 'doctor3',
      password: '123456',
      realName: '陈敏',
      phone: '13800002224',
      role: 'DOCTOR' as const,
      status: 'ACTIVE' as const,
      createdAt: '2026-07-01T08:00:00.000Z',
    },
    {
      id: 'u_doctor4',
      username: 'doctor4',
      password: '123456',
      realName: '赵雪',
      phone: '13800002225',
      role: 'DOCTOR' as const,
      status: 'ACTIVE' as const,
      createdAt: '2026-07-01T08:00:00.000Z',
    },
    {
      id: 'u_doctor5',
      username: 'doctor5',
      password: '123456',
      realName: '刘洋',
      phone: '13800002226',
      role: 'DOCTOR' as const,
      status: 'ACTIVE' as const,
      createdAt: '2026-07-01T08:00:00.000Z',
    },
    {
      id: 'u_doctor6',
      username: 'doctor6',
      password: '123456',
      realName: '孙婷',
      phone: '13800002227',
      role: 'DOCTOR' as const,
      status: 'ACTIVE' as const,
      createdAt: '2026-07-01T08:00:00.000Z',
    },
    {
      id: 'u_admin',
      username: 'admin',
      password: '123456',
      realName: '系统管理员',
      phone: '13800003333',
      role: 'ADMIN' as const,
      status: 'ACTIVE' as const,
      createdAt: '2026-07-01T08:00:00.000Z',
    },
  ]

  const doctors = [
    {
      id: 'doc_li',
      userId: 'u_doctor',
      departmentId: 'dep_internal',
      title: '主任医师',
      specialty: '高血压、冠心病、慢性胃炎',
      introduction: '从事内科临床工作 20 年，擅长慢病综合管理与个性化用药方案。',
      status: 'ACTIVE' as const,
    },
    {
      id: 'doc_wang',
      userId: 'u_doctor2',
      departmentId: 'dep_surgery',
      title: '副主任医师',
      specialty: '疝气、胆囊结石、体表肿物',
      introduction: '专注微创外科，注重术后康复指导。',
      status: 'ACTIVE' as const,
    },
    {
      id: 'doc_chen',
      userId: 'u_doctor3',
      departmentId: 'dep_pedia',
      title: '主治医师',
      specialty: '小儿呼吸道感染、消化不良',
      introduction: '亲和耐心，擅长与家长沟通儿童护理要点。',
      status: 'ACTIVE' as const,
    },
    {
      id: 'doc_zhao',
      userId: 'u_doctor4',
      departmentId: 'dep_gyn',
      title: '副主任医师',
      specialty: '月经不调、妇科炎症',
      introduction: '强调规范诊疗与隐私保护。',
      status: 'ACTIVE' as const,
    },
    {
      id: 'doc_liu',
      userId: 'u_doctor5',
      departmentId: 'dep_ortho',
      title: '主治医师',
      specialty: '颈椎病、腰腿痛、运动损伤',
      introduction: '结合康复训练给出综合治疗建议。',
      status: 'ACTIVE' as const,
    },
    {
      id: 'doc_sun',
      userId: 'u_doctor6',
      departmentId: 'dep_derm',
      title: '主治医师',
      specialty: '湿疹、痤疮、荨麻疹',
      introduction: '关注皮肤屏障修复与生活方式干预。',
      status: 'ACTIVE' as const,
    },
  ]

  const schedules = buildSchedules()
  const tomorrow = addDays(new Date(), 1)
  const dayAfter = addDays(new Date(), 2)

  const appointments = [
    {
      id: 'apt_demo1',
      appointmentNo: 'AP20260711001',
      patientId: 'u_patient',
      doctorId: 'doc_li',
      scheduleId: `sch_doc_li_1_MORNING`,
      departmentId: 'dep_internal',
      status: 'PENDING' as const,
      symptomNote: '最近头晕、血压偏高',
      createdAt: '2026-07-10T09:00:00.000Z',
    },
    {
      id: 'apt_demo2',
      appointmentNo: 'AP20260710002',
      patientId: 'u_patient',
      doctorId: 'doc_sun',
      scheduleId: `sch_doc_sun_0_AFTERNOON`,
      departmentId: 'dep_derm',
      status: 'COMPLETED' as const,
      symptomNote: '手臂红疹瘙痒',
      createdAt: '2026-07-08T10:00:00.000Z',
    },
    {
      id: 'apt_demo3',
      appointmentNo: 'AP20260711003',
      patientId: 'u_patient2',
      doctorId: 'doc_li',
      scheduleId: `sch_doc_li_2_AFTERNOON`,
      departmentId: 'dep_internal',
      status: 'PENDING' as const,
      symptomNote: '胃部不适一周',
      createdAt: '2026-07-10T11:00:00.000Z',
    },
  ]

  // keep reservedCount consistent for demo schedules
  const sch1 = schedules.find((s) => s.id === 'sch_doc_li_1_MORNING')
  if (sch1) sch1.reservedCount = 1
  const sch2 = schedules.find((s) => s.id === 'sch_doc_li_2_AFTERNOON')
  if (sch2) sch2.reservedCount = 1
  const sch3 = schedules.find((s) => s.id === 'sch_doc_sun_0_AFTERNOON')
  if (sch3) sch3.reservedCount = 1

  void tomorrow
  void dayAfter

  const records = [
    {
      id: 'rec_demo1',
      recordNo: 'MR20260710001',
      appointmentId: 'apt_demo2',
      patientId: 'u_patient',
      doctorId: 'doc_sun',
      chiefComplaint: '双前臂红疹伴瘙痒 3 天',
      presentIllness: '患者 3 天前接触清洁剂后出现红疹，夜间加重，无发热。',
      physicalExam: '双前臂散在红斑丘疹，无破溃，浅表淋巴结未触及肿大。',
      diagnosis: '接触性皮炎',
      treatment: '避免刺激物，保持皮肤清洁湿润，口服抗组胺药。',
      prescription: '氯雷他定片 10mg 每晚一次 × 5 天；炉甘石洗剂外用',
      createdAt: '2026-07-09T15:30:00.000Z',
      updatedAt: '2026-07-09T15:30:00.000Z',
    },
  ]

  return { users, departments, doctors, schedules, appointments, records }
}
