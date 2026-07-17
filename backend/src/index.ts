import express from 'express';
import cors from 'cors';
import pacientesRouter from './routes/pacientes.routes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// --- Middlewares globales ---
app.use(cors()); //            Permite peticiones desde el frontend (Next.js)
app.use(express.json()); //    Parsea el body JSON de las peticiones

// --- Healthcheck ---
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', servicio: 'health-crud-backend' });
});

// --- Rutas de la API ---
app.use('/api/pacientes', pacientesRouter);

// --- Manejo de errores (siempre al final) ---
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 API escuchando en http://localhost:${PORT}`);
});
