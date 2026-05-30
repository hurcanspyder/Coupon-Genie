import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import storeRoutes from './routes/storeRoutes';
import adminRoutes from './routes/adminRoutes';
import { globalLimiter } from './middleware/rateLimiter';
import db from './config/db';

// Load env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with support for frontend
app.use(cors({
  origin: 'https://coupon-genie-bice.vercel.app/', // For development flexibility
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Apply global rate limiting
app.use('/api', globalLimiter);

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Ping DB
    await db.$queryRaw`SELECT 1`;
    res.json({ status: 'OK', database: 'CONNECTED', timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', database: 'DISCONNECTED', error: String(error) });
  }
});

// Routing layers
app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/admin', adminRoutes);

// 404 Route handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
});

// Global Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : undefined,
  });
});

// Start Server & Test Database Connection
const startServer = async () => {
  try {
    console.log('Verifying connection to database...');
    // Attempt schema check or ping
    await db.$connect();
    console.log('✅ Database connection established successfully.');

    app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      console.log(`🔗 API Base path: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to the database. Starting in offline fallback mode...');
    console.error(error);
    
    // Start server anyway so the frontend can display offline state
    app.listen(PORT, () => {
      console.log(`🚀 Server running in fallback offline mode on port ${PORT}`);
    });
  }
};

startServer();
export default app;
