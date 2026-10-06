const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'campuscare-dev-secret';
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'campus_service_db',
};

const state = {
  mode: 'demo',
  pool: null,
};

const demoUsers = [
  {
    id: 1,
    name: 'Campus Admin',
    email: 'admin@campuscare.edu',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    department: 'Administrative Office',
    studentId: null,
  },
  {
    id: 2,
    name: 'Aisha Sharma',
    email: 'student@campuscare.edu',
    password: bcrypt.hashSync('student123', 10),
    role: 'student',
    department: null,
    studentId: 'STU-2025-101',
  },
];

const demoRequests = [
  {
    id: 1,
    userId: 2,
    title: 'Projector not working in seminar hall',
    category: 'Classroom',
    location: 'Main Auditorium',
    description: 'The projector is flickering and audio output is also failing during lectures.',
    priority: 'High',
    status: 'in_progress',
    assignedTo: 'AV Support Team',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    userId: 2,
    title: 'Broken tap in hostel washroom',
    category: 'Maintenance',
    location: 'Hostel Block B',
    description: 'The water tap is leaking and making noise continuously. Needs urgent repair.',
    priority: 'Medium',
    status: 'open',
    assignedTo: null,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 3,
    userId: 2,
    title: 'Wi-Fi slow in library',
    category: 'IT / Network',
    location: 'Central Library',
    description: 'Students are unable to connect to the library Wi-Fi during peak hours.',
    priority: 'High',
    status: 'resolved',
    assignedTo: 'IT Helpdesk',
    createdAt: new Date(Date.now() - 120000000).toISOString(),
    updatedAt: new Date(Date.now() - 60000000).toISOString(),
  },
];

app.use(cors());
app.use(express.json());

function toPublicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department || null,
    studentId: user.studentId || null,
  };
}

function buildToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

async function getDbPool() {
  if (!state.pool) {
    return null;
  }
  return state.pool;
}

async function initializeDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: DB_CONFIG.host,
      port: DB_CONFIG.port,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      multipleStatements: true,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\``);
    await connection.end();

    const pool = mysql.createPool({
      host: DB_CONFIG.host,
      port: DB_CONFIG.port,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      database: DB_CONFIG.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(120) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
        department VARCHAR(100),
        studentId VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
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
      )
    `);

    const [userRows] = await pool.query('SELECT id FROM users WHERE email = ?', ['admin@campuscare.edu']);
    if (!userRows.length) {
      await pool.query(
        `INSERT INTO users (name, email, password, role, department) VALUES (?, ?, ?, 'admin', ?)`,
        ['Campus Admin', 'admin@campuscare.edu', bcrypt.hashSync('admin123', 10), 'Administrative Office']
      );
    }

    state.mode = 'mysql';
    state.pool = pool;
    console.log('MySQL database ready.');
  } catch (error) {
    state.mode = 'demo';
    console.warn('MySQL unavailable. Demo mode will be used instead.', error.message);
  }
}

async function findUserByEmail(email) {
  if (state.mode === 'mysql') {
    const pool = await getDbPool();
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  }

  return demoUsers.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null;
}

async function findUserById(id) {
  if (state.mode === 'mysql') {
    const pool = await getDbPool();
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  }

  return demoUsers.find((user) => user.id === Number(id)) || null;
}

async function getRequestsForUser(userId, isAdmin = false) {
  if (state.mode === 'mysql') {
    const pool = await getDbPool();
    if (isAdmin) {
      const [rows] = await pool.query('SELECT * FROM requests ORDER BY created_at DESC');
      return rows;
    }

    const [rows] = await pool.query('SELECT * FROM requests WHERE userId = ? ORDER BY created_at DESC', [userId]);
    return rows;
  }

  if (isAdmin) {
    return demoRequests.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return demoRequests.filter((request) => request.userId === Number(userId));
}

async function getRequestById(id) {
  if (state.mode === 'mysql') {
    const pool = await getDbPool();
    const [rows] = await pool.query('SELECT * FROM requests WHERE id = ?', [id]);
    return rows[0] || null;
  }

  return demoRequests.find((request) => request.id === Number(id)) || null;
}

async function createRequest({ userId, title, category, location, description, priority }) {
  const finalPriority = priority || 'Medium';

  if (state.mode === 'mysql') {
    const pool = await getDbPool();
    const [result] = await pool.query(
      `INSERT INTO requests (userId, title, category, location, description, priority, status, assignedTo)
       VALUES (?, ?, ?, ?, ?, ?, 'open', NULL)`,
      [userId, title, category, location, description, finalPriority]
    );
    const [rows] = await pool.query('SELECT * FROM requests WHERE id = ?', [result.insertId]);
    return rows[0];
  }

  const newId = demoRequests.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
  const newRequest = {
    id: newId,
    userId: Number(userId),
    title,
    category,
    location,
    description,
    priority: finalPriority,
    status: 'open',
    assignedTo: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  demoRequests.unshift(newRequest);
  return newRequest;
}

async function updateRequestStatus(id, status, assignedTo) {
  if (state.mode === 'mysql') {
    const pool = await getDbPool();
    await pool.query(
      'UPDATE requests SET status = ?, assignedTo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, assignedTo || null, id]
    );
    const [rows] = await pool.query('SELECT * FROM requests WHERE id = ?', [id]);
    return rows[0] || null;
  }

  const entry = demoRequests.find((request) => request.id === Number(id));
  if (!entry) {
    return null;
  }

  entry.status = status;
  if (assignedTo) {
    entry.assignedTo = assignedTo;
  }
  entry.updatedAt = new Date().toISOString();
  return entry;
}

async function createUser({ name, email, password, role = 'student', department = null, studentId = null }) {
  const normalizedEmail = String(email).trim().toLowerCase();
  const hashedPassword = await bcrypt.hash(password, 10);

  if (state.mode === 'mysql') {
    const pool = await getDbPool();
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, role, department, studentId) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, normalizedEmail, hashedPassword, role, department, studentId]
    );

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    return rows[0];
  }

  const newId = demoUsers.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
  const newUser = {
    id: newId,
    name,
    email: normalizedEmail,
    password: hashedPassword,
    role,
    department,
    studentId,
  };

  demoUsers.push(newUser);
  return newUser;
}

async function getStats() {
  const requests = await getRequestsForUser(0, true);

  return {
    total: requests.length,
    open: requests.filter((request) => request.status === 'open').length,
    in_progress: requests.filter((request) => request.status === 'in_progress').length,
    resolved: requests.filter((request) => request.status === 'resolved').length,
    high_priority: requests.filter((request) => request.priority === 'High').length,
  };
}

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication token missing.' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    mode: state.mode,
    message: 'CampusCare backend is running.',
  });
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role = 'student', department = null, studentId = null } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  const normalized = String(email).trim().toLowerCase();
  const existingUser = await findUserByEmail(normalized);

  if (existingUser) {
    return res.status(409).json({ message: 'A user with this email already exists.' });
  }

  const finalRole = role === 'admin' ? 'admin' : 'student';
  const generatedStudentId = finalRole === 'student' ? studentId || `STU-${Date.now().toString().slice(-6)}` : null;

  const user = await createUser({
    name: String(name).trim(),
    email: normalized,
    password,
    role: finalRole,
    department,
    studentId: generatedStudentId,
  });

  const token = buildToken(user);

  return res.status(201).json({
    user: toPublicUser(user),
    token,
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = await findUserByEmail(String(email).trim().toLowerCase());

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = buildToken(user);
  return res.json({
    user: toPublicUser(user),
    token,
  });
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  return res.json({ user: toPublicUser(req.user) });
});

app.get('/api/requests', authMiddleware, async (req, res) => {
  const requests = await getRequestsForUser(req.user.id, req.user.role === 'admin');
  return res.json({ requests });
});

app.get('/api/requests/:id', authMiddleware, async (req, res) => {
  const request = await getRequestById(req.params.id);

  if (!request) {
    return res.status(404).json({ message: 'Request not found.' });
  }

  if (req.user.role !== 'admin' && request.userId !== req.user.id) {
    return res.status(403).json({ message: 'You are not authorized to view this request.' });
  }

  return res.json({ request });
});

app.post('/api/requests', authMiddleware, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Only students can raise requests.' });
  }

  const { title, category, location, description, priority } = req.body;

  if (!title || !category || !location || !description) {
    return res.status(400).json({ message: 'Title, category, location, and description are required.' });
  }

  const request = await createRequest({
    userId: req.user.id,
    title,
    category,
    location,
    description,
    priority,
  });

  return res.status(201).json({ request });
});

app.patch('/api/requests/:id/status', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only administrators can update statuses.' });
  }

  const { status, assignedTo } = req.body;
  const allowedStatuses = ['open', 'in_progress', 'resolved'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value.' });
  }

  const updatedRequest = await updateRequestStatus(req.params.id, status, assignedTo || null);

  if (!updatedRequest) {
    return res.status(404).json({ message: 'Request not found.' });
  }

  return res.json({ request: updatedRequest });
});

app.patch('/api/requests/:id/assign', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only administrators can assign requests.' });
  }

  const { assignedTo } = req.body;

  if (!assignedTo) {
    return res.status(400).json({ message: 'Assigned staff name is required.' });
  }

  const updatedRequest = await updateRequestStatus(req.params.id, 'in_progress', assignedTo);

  if (!updatedRequest) {
    return res.status(404).json({ message: 'Request not found.' });
  }

  return res.json({ request: updatedRequest });
});

app.get('/api/stats', authMiddleware, async (_req, res) => {
  const stats = await getStats();
  return res.json({ stats });
});

initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`CampusCare backend running on http://localhost:${PORT}`);
  });
});
