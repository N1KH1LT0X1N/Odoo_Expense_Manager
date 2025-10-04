import express, { type Request, Response } from "express";
import { registerRoutes } from "../server/routes";
import path from "path";
import fs from "fs";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve uploaded files
const uploadsPath = path.join(process.cwd(), 'uploads');
if (fs.existsSync(uploadsPath)) {
  app.use('/uploads', express.static(uploadsPath));
}

// Register API routes
(async () => {
  await registerRoutes(app);
})();

// Health check
app.get('/api', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Error handler
app.use((err: any, _req: Request, res: Response) => {
  console.error('API Error:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message, error: process.env.NODE_ENV === 'development' ? err.stack : undefined });
});

export default app;
