CREATE DATABASE IF NOT EXISTS campus_service_db;
USE campus_service_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
  department VARCHAR(100),
  studentId VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  category VARCHAR(80) NOT NULL,
  location VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(30) NOT NULL DEFAULT 'Medium',
  status VARCHAR(30) NOT NULL DEFAULT 'open',
  assignedTo VARCHAR(120),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

INSERT INTO users (name, email, password, role, department)
VALUES ('Campus Admin', 'admin@campuscare.edu', '$2a$10$8q0oF3boLI0kzXb3nDNxfaYDZsH/xD2kQb3b3b7V4Ka1Wm9KKGmI6', 'admin', 'Administrative Office')
ON DUPLICATE KEY UPDATE email = email;
