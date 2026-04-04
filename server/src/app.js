import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import urlRoutes from './routes/urlRoutes.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { globalRateLimiter } from './middlewares/rateLimiter.js';

const app = express();

app.set('trust proxy', 1);

// Configure Helmet with CSP that allows inline scripts for password forms
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
      },
    },
  })
);
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(globalRateLimiter);

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Service is healthy.',
  });
});

app.use('/', urlRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
