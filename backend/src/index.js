import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import chatRouter from './routes/chat.router.js';

const app = express();
const PORT = process.env.PORT ?? 5000;

app.use(cors());
app.use(express.json());

app.use('/api/chat', chatRouter);

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'OK', data: { uptime: process.uptime() } });
});

// Global error boundary so a failing automation never crashes the server.
app.use((err, _req, res, _next) => {
  res.status(500).json({
    success: false,
    message: err?.message ?? 'Internal server error',
    data: null,
  });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
