CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE TABLE productivity_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  tasks_completed INT DEFAULT 0
);

INSERT INTO users (username, email, password_hash) 
VALUES 
('diego', 'diego@example.com', 'hash_super_seguro_123'),
('ana', 'ana@example.com', 'otro_hash_456');

INSERT INTO tasks (user_id, title, description, status, completed_at) 
VALUES 
(1, 'Configurar el backend', 'Terminar la conexión a la base de datos y crear las rutas API.', 'pending', NULL),
(1, 'Revisar el frontend', 'Ajustar el CSS de la página de login.', 'completed', NOW()),
(2, 'Diseñar el logo', 'Hacer un borrador del logo en Figma.', 'pending', NULL);

INSERT INTO productivity_logs (user_id, date, tasks_completed) 
VALUES 
(1, '2025-11-02', 1),
(2, '2025-11-01', 0);

SELECT * FROM users;
SELECT * FROM tasks;
SELECT * FROM productivity_logs;
