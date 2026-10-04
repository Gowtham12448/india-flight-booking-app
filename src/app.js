const express = require('express');
const cors = require('cors');
const path = require('path');

const airportRoutes = require('./routes/airportRoutes');
const flightRoutes = require('./routes/flightRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Healthcheck probe for Docker / Jenkins / K8s
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/airports', airportRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/bookings', bookingRoutes);

// Static Web Views
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});

app.get('/my-bookings', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/bookings.html'));
});

module.exports = app;
