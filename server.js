import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Обслуживаем собранный фронтенд
app.use(express.static(path.join(__dirname, 'dist')));

// Для SPA — всегда отдаём index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});


//docker build -t hutarka .
//docker run -p 3000:3000 hutarka