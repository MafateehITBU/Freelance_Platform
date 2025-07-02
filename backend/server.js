import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import http from 'http';
import { Server } from 'socket.io';
import { chatSocket } from './utils/socketChat.js';

// Import config and database connection
import connectDB from './config/database.js';
import config from './config/config.js';

// Import daily cron job
import './utils/subscriptionCheck.js';

// Import routes
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import freelancerRoutes from './routes/freelancerRoutes.js';
import influencerRoutes from './routes/influencerRoutes.js';
import postRoutes from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import subcategoryRoutes from './routes/subcategoryRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import addOnRoutes from './routes/addOnRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import subscriptionPlanRoutes from './routes/subscriptionPlanRoutes.js';
import walletRoutes from './routes/walletRoutes.js';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  }
});
chatSocket(io);

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database
connectDB();

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/freelancer', freelancerRoutes);
app.use('/api/influencer', influencerRoutes);
app.use('/api/post', postRoutes);
app.use('/api/comment', commentRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/subcategory', subcategoryRoutes);
app.use('/api/service', serviceRoutes);
app.use('/api/add-on', addOnRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/rating', ratingRoutes);
app.use('/api/chat', messageRoutes);
app.use('/api/subscription-plan', subscriptionPlanRoutes);4
app.use('/api/wallet', walletRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Handle multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files uploaded.' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Unexpected file field.' });
    }
    return res.status(400).json({ message: 'File upload error: ' + err.message });
  }

  // Handle validation errors
  if (err.message && err.message.includes('Only image files are allowed')) {
    return res.status(400).json({ message: err.message });
  }

  // Handle other errors
  res.status(500).json({ message: 'Something went wrong!' });
});

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
});