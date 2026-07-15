CREATE TABLE IF NOT EXISTS sys_user (
  id BIGINT PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  real_name VARCHAR(64) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  role VARCHAR(16) NOT NULL,
  status VARCHAR(16) NOT NULL,
  avatar_url VARCHAR(255),
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  deleted INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS department (
  id BIGINT PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  description VARCHAR(512),
  sort_order INT DEFAULT 0,
  status VARCHAR(16) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  deleted INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS doctor (
  id BIGINT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  department_id BIGINT NOT NULL,
  title VARCHAR(64) NOT NULL,
  specialty VARCHAR(255),
  introduction VARCHAR(1024),
  status VARCHAR(16) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  deleted INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS schedule (
  id BIGINT PRIMARY KEY,
  doctor_id BIGINT NOT NULL,
  work_date DATE NOT NULL,
  time_slot VARCHAR(16) NOT NULL,
  total_quota INT NOT NULL,
  reserved_count INT NOT NULL DEFAULT 0,
  status VARCHAR(16) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  deleted INT DEFAULT 0
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
  created_at TIMESTAMP NOT NULL,
  cancelled_at TIMESTAMP,
  deleted INT DEFAULT 0
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
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  deleted INT DEFAULT 0
);
