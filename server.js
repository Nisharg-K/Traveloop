const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { syncDatabase } = require('./models');
const { runMigrations } = require('./config/migrations');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body keys:', Object.keys(req.body));
  }
  next();
});

// Routes
const promptRoute = require('./routes/promptRoute');
const blogRoute = require('./routes/blogRoute');
const plagiarismRoute = require('./routes/plagiarismRoute');
const documentRoute = require('./routes/documentRoute');
const linkedinRoute = require('./routes/linkedinRoute');
const authRoute = require('./routes/authRoute');
const historyRoute = require('./routes/historyRoute');
const queueStreamRoute = require('./routes/queueStreamRoute');
const queueStateRoute = require('./routes/queueStateRoute');

app.use('/api/generatePrompt', promptRoute);
app.use('/api/generateBlog', blogRoute);
app.use('/api/checkPlagiarism', plagiarismRoute);
app.use('/api/document', documentRoute);
app.use('/api/linkedin', linkedinRoute);
app.use('/api/auth', authRoute);
app.use('/api/history', historyRoute);
app.use('/api/queue/stream', queueStreamRoute);
app.use('/api/queue/state', queueStateRoute);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SEO Blog Generator API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await syncDatabase();
    
    // Run migrations to add missing columns
    console.log('🔄 Running database migrations...');
    await runMigrations();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📝 API endpoints available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
