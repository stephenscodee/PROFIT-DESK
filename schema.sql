-- PostgreSQL minimal schema for Profit Desk
-- Run this to create the database schema manually if needed

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','employee')),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  monthly_cost NUMERIC(12,2) NOT NULL,
  hours_per_month INTEGER DEFAULT 160,
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price_type TEXT NOT NULL CHECK (price_type IN ('fixed','hourly')),
  price_value NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS time_entries (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id) NOT NULL,
  project_id INTEGER REFERENCES projects(id) NOT NULL,
  entry_date DATE NOT NULL,
  hours NUMERIC(5,2) NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_time_entries_employee ON time_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project ON time_entries(project_id);

