import express from 'express';
import cors from 'cors';
import pacientesRouter from './routes/pacientes.routes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Global middleware
app.use(cors()); // Allow cross-origin requests from the frontend
app.use(express.json()); // Parse JSON request bodies

// Healthcheck
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'health-crud-backend' });
});

// API routes
app.use('/api/pacientes', pacientesRouter);

// Error handling (registered last)
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
