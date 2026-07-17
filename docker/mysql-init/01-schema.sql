CREATE DATABASE IF NOT EXISTS hospital DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hospital;

CREATE TABLE IF NOT EXISTS sys_user (
  id BIGINT PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  real_name VARCHAR(64) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  role VARCHAR(16) NOT NULL,
  status VARCHAR(16) NOT NULL,
  avatar_url VARCHAR(255),
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted INT DEFAULT 0,
  CONSTRAINT chk_user_role CHECK (role IN ('PATIENT', 'DOCTOR', 'ADMIN')),
  CONSTRAINT chk_user_status CHECK (status IN ('ACTIVE', 'DISABLED')),
  INDEX idx_user_role_status (role, status)
);

CREATE TABLE IF NOT EXISTS department (
  id BIGINT PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  description VARCHAR(512),
  sort_order INT DEFAULT 0,
  status VARCHAR(16) NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted INT DEFAULT 0,
  CONSTRAINT uq_department_name UNIQUE (name),
  CONSTRAINT chk_department_status CHECK (status IN ('ACTIVE', 'DISABLED'))
);

CREATE TABLE IF NOT EXISTS doctor (
  id BIGINT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  department_id BIGINT NOT NULL,
  title VARCHAR(64) NOT NULL,
  specialty VARCHAR(255),
  introduction VARCHAR(1024),
  status VARCHAR(16) NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted INT DEFAULT 0,
  CONSTRAINT uq_doctor_user UNIQUE (user_id),
  CONSTRAINT fk_doctor_user FOREIGN KEY (user_id) REFERENCES sys_user(id),
  CONSTRAINT fk_doctor_department FOREIGN KEY (department_id) REFERENCES department(id),
  CONSTRAINT chk_doctor_status CHECK (status IN ('ACTIVE', 'DISABLED')),
  INDEX idx_doctor_department_status (department_id, status)
);

CREATE TABLE IF NOT EXISTS schedule (
  id BIGINT PRIMARY KEY,
  doctor_id BIGINT NOT NULL,
  work_date DATE NOT NULL,
  time_slot VARCHAR(16) NOT NULL,
  total_quota INT NOT NULL,
  reserved_count INT NOT NULL DEFAULT 0,
  status VARCHAR(16) NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted INT DEFAULT 0,
  CONSTRAINT uq_schedule_slot UNIQUE (doctor_id, work_date, time_slot),
  CONSTRAINT fk_schedule_doctor FOREIGN KEY (doctor_id) REFERENCES doctor(id),
  CONSTRAINT chk_schedule_slot CHECK (time_slot IN ('MORNING', 'AFTERNOON')),
  CONSTRAINT chk_schedule_quota CHECK (total_quota > 0 AND reserved_count >= 0 AND reserved_count <= total_quota),
  INDEX idx_schedule_date_status (work_date, status)
);

CREATE TABLE IF NOT EXISTS appointment (
  id BIGINT PRIMARY KEY,
  appointment_no VARCHAR(32) NOT NULL UNIQUE,
  patient_id BIGINT NOT NULL,
  doctor_id BIGINT NOT NULL,
  schedule_id BIGINT NOT NULL,
  department_id BIGINT NOT NULL,
  status VARCHAR(16) NOT NULL,
  symptom_note VARCHAR(512),
  created_at DATETIME NOT NULL,
  cancelled_at DATETIME NULL,
  deleted INT DEFAULT 0,
  CONSTRAINT fk_appointment_patient FOREIGN KEY (patient_id) REFERENCES sys_user(id),
  CONSTRAINT fk_appointment_doctor FOREIGN KEY (doctor_id) REFERENCES doctor(id),
  CONSTRAINT fk_appointment_schedule FOREIGN KEY (schedule_id) REFERENCES schedule(id),
  CONSTRAINT fk_appointment_department FOREIGN KEY (department_id) REFERENCES department(id),
  CONSTRAINT chk_appointment_status CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
  INDEX idx_appointment_patient_status (patient_id, status),
  INDEX idx_appointment_doctor_status (doctor_id, status),
  INDEX idx_appointment_schedule (schedule_id)
);

CREATE TABLE IF NOT EXISTS medical_record (
  id BIGINT PRIMARY KEY,
  record_no VARCHAR(32) NOT NULL UNIQUE,
  appointment_id BIGINT NOT NULL UNIQUE,
  patient_id BIGINT NOT NULL,
  doctor_id BIGINT NOT NULL,
  chief_complaint VARCHAR(512) NOT NULL,
  present_illness VARCHAR(1024),
  physical_exam VARCHAR(1024),
  diagnosis VARCHAR(512) NOT NULL,
  treatment VARCHAR(1024),
  prescription VARCHAR(1024),
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted INT DEFAULT 0,
  CONSTRAINT fk_record_appointment FOREIGN KEY (appointment_id) REFERENCES appointment(id),
  CONSTRAINT fk_record_patient FOREIGN KEY (patient_id) REFERENCES sys_user(id),
  CONSTRAINT fk_record_doctor FOREIGN KEY (doctor_id) REFERENCES doctor(id),
  INDEX idx_record_patient (patient_id),
  INDEX idx_record_doctor (doctor_id)
);
