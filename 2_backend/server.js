require('dotenv').config(); // Load environment variables first

const express = require('express');
const path = require('path');

// Import configurations
const { testConnection } = require('./config/database');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customer');
const registrationRoutes = require('./routes/registration');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 3000;

// Test database connection
testConnection();

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../1_frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API proxy for external services
app.get('/api/countries', async (req, res, next) => {
  try {
    const apiKey = process.env.COUNTRY_STATE_CITY_API_KEY || 'NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA==';
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Countries API key configured:', !!apiKey);
    }
    
    const response = await fetch('https://api.countrystatecity.in/v1/countries', {
      headers: {
        'X-CSCAPI-KEY': apiKey
      }
    });
    
    if (!response.ok) {
      console.error('Countries API response:', response.status, response.statusText);
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Countries API error:', error.message);
    next(error);
  }
});

// Routes
app.use('/', authRoutes);
app.use('/', customerRoutes);
app.use('/', registrationRoutes);
app.use('/', uploadRoutes);

// API info endpoint
app.get('/api', (req, res) => {
    res.json({
        message: 'Welcome to the UniVault API!',
        endpoints: [
            { method: 'GET', path: '/' },
            { method: 'GET', path: '/api' },
            { method: 'POST', path: '/register', description: 'Register a new user' },
            { method: 'POST', path: '/login', description: 'Login as a user' },
            { method: 'POST', path: '/upload', description: 'Upload a file' },
            { method: 'GET', path: '/api/customer/:cif_number', description: 'Get customer info' },
            { method: 'GET', path: '/api/customer/all/:cif_number', description: 'Get all customer data' }
        ]
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.send('UniVault API is running. Use /register and /login endpoints.');
});

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
