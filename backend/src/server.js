import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Security HTTP Headers
app.use(helmet());

// CORS configuration
const allowedOrigins = [env.clientOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, postman) or matching allowed origins / local dev ports
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error(`CORS error: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Request Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Development Request Logger
app.use((req, res, next) => {
  if (env.nodeEnv === 'development') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// Root welcome endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Store Rating Platform API',
    version: '1.0.0',
    healthCheck: '/api/v1/health',
    documentation: '/api/v1',
  });
});

// Mount API v1 Routes (with serverless alias fallbacks for Vercel)
app.use('/api/v1', apiRouter);
app.use('/v1', apiRouter);
app.use('/api', apiRouter);

// 404 Unmatched Route Handler
app.use(notFoundHandler);

// Centralized Error Handler Middleware
app.use(errorHandler);

// Start HTTP Server only when executing standalone (not during serverless/test environments)
const isServerless = process.env.VERCEL === '1' || process.env.NODE_ENV === 'test' || process.argv.some((arg) => arg.includes('test'));

if (!isServerless) {
  const server = app.listen(env.port, () => {
    console.log(`🚀 Backend API Server running in [${env.nodeEnv}] mode on http://localhost:${env.port}`);
    console.log(`🏥 Health Check available at http://localhost:${env.port}/api/v1/health`);
  });

  // Graceful shutdown listeners for nodemon / process exit
  const closeServer = () => {
    if (server && server.listening) {
      server.close();
    }
  };

  process.once('SIGINT', closeServer);
  process.once('SIGTERM', closeServer);
  process.once('SIGUSR2', () => {
    closeServer();
    process.kill(process.pid, 'SIGUSR2');
  });
}

export default app;
