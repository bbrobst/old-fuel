const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// import database connection
const pool = require('./database');

// import routes
const carRoutes = require('./routes/cars');  // Assuming cars.js is in a 'routes' folder

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, '..')));

// use routes
app.use('/api', carRoutes);  // This makes routes available at /api/cars

// start server
app.listen(PORT, () => {
  console.log(`\nServer running on http://localhost:${PORT}`);
  console.log(`Database: ${process.env.DB_NAME}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api/cars`);
});