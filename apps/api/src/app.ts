import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/index.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import routes from './routes/index.js';

const app: Application = express();

// Middlewares - CORS Configuration
// Configure CORS with environment-based allowed origins
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, or curl)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (config.corsOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Log blocked origins in development for debugging
      if (config.nodeEnv === 'development') {
        console.warn(`⚠️  CORS: Blocked origin: ${origin}`);
        console.warn(`   Allowed origins:`, config.corsOrigins);
      }
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: config.corsCredentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400, // 24 hours - preflight cache
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'CashFlow API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// Routes
app.use('/api', routes);

// Error handling
app.use(errorMiddleware);

// Start server
app.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port}`);
  console.log(`📍 Environment: ${config.nodeEnv}`);
  console.log(`🌐 CORS allowed origins:`, config.corsOrigins);
  console.log(`🔐 CORS credentials: ${config.corsCredentials ? 'enabled' : 'disabled'}`);
});

export default app;
