require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { UPLOAD_DIR } = require('./middleware/upload');
const hotelsRouter = require('./routes/hotels');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploaded images are served from the Node server itself
app.use('/uploads', express.static(UPLOAD_DIR));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/hotels', hotelsRouter);

app.use('/api', (req, res) => res.status(404).json({ message: 'Route not found' }));

// Central error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5 MB or smaller' : err.message;
    return res.status(400).json({ message, errors: { image: message } });
  }
  if (err.status === 400) {
    return res.status(400).json({ message: err.message, errors: { image: err.message } });
  }
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
