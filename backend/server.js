const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import config and database connection
const connectDB = require('./config/database');
const config = require('./config/config');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database
connectDB();

// Routes
// TODO: Import and use routes here

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
}); 