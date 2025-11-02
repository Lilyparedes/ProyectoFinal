import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import cors from 'cors';
import bodyParser from 'body-parser';

import { router as usersRouter } from './routes/users.js';
import { router as seatsRouter } from './routes/seats.js';
import { router as reservationsRouter } from './routes/reservations.js';
import { router as reportsRouter } from './routes/reports.js';

import { router as emailRoutes } from './routes/email.js';




const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/email', emailRoutes);

// Swagger
const swaggerDocument = YAML.load('./openapi.yaml');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rutas
app.use('/api/users', usersRouter);
app.use('/api/seats', seatsRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/email', emailRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
