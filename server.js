const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');
require('dotenv').config();

// Override default DNS servers to prevent querySrv ECONNREFUSED issues on local Windows configurations
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  console.warn('DNS server override failed:', err.message);
}

const authRoutes = require('./routes/auth');
const stationRoutes = require('./routes/stations');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());

// Print backend startup info
console.log('----------------------------------------------------');
console.log('EV Charging Station Navigator - Starting Backend...');
console.log('----------------------------------------------------');

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('SUCCESS: Connected to MongoDB Database.');
  })
  .catch(err => {
    console.error('WARNING: Could not connect to MongoDB Database.');
    console.error('Detail:', err.message);
    console.log('Notice: The server will continue running in OFFLINE/FALLBACK mode.');
    console.log('To store users and stations, make sure MongoDB is running locally at:');
    console.log('   mongodb://localhost:27017/ev_navigator');
    console.log('Or configure your Atlas URL in backend/.env');
    console.log('----------------------------------------------------');
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);

// Root test route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'EV Charging Station Navigator Backend API is active.',
    databaseConnected: mongoose.connection.readyState === 1,
    endpoints: {
      auth: ['/api/auth/register', '/api/auth/login', '/api/auth/reset-password'],
      stations: ['/api/stations', '/api/stations/:id', '/api/stations/seed']
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'An internal server error occurred.' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Backend Server listening at http://localhost:${PORT}`);
  console.log('----------------------------------------------------');
});
