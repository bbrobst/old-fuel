const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// import database connection
const pool = require('./database');

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, '..')));

// start server
app.listen(PORT, () => {
  console.log(`\n Server running on http://localhost:${PORT}`);
  console.log(`Database: ${process.env.DB_NAME}`)
})