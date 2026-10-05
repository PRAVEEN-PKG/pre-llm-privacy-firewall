require('dotenv').config();

const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const scanRouter = require('./routes/scan');
const policiesRouter = require('./routes/policies');
const scansRouter = require('./routes/scans');

const app = express();
const PORT = Number(process.env.PORT) || 3001;

const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: corsOrigin === '*' ? '*' : corsOrigin.split(',').map((origin) => origin.trim())
}));
app.use(express.json({ limit: '64kb' }));

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'OK' });
});
app.use('/api/scan', scanRouter);
app.use('/api/policies', policiesRouter);
app.use('/api/scans', scansRouter);

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found.' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error.type === 'entity.too.large') {
    return res.status(413).json({ success: false, error: 'Request body too large' });
  }

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ success: false, error: 'Request body must contain valid JSON.' });
  }

  console.error('Request failed.');
  return res.status(500).json({ success: false, error: 'Internal server error.' });
});

async function start() {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Connected to MongoDB.');
    } catch {
      console.error('MongoDB connection failed; using in-memory scan history.');
    }
  } else {
    console.log('MONGODB_URI is not set; using in-memory scan history.');
  }

  return app.listen(PORT, () => {
    console.log(`Privacy Firewall API listening on port ${PORT}.`);
  });
}

if (require.main === module) {
  start().catch((error) => {
    console.error('Failed to start the API.');
    process.exitCode = 1;
  });
}

module.exports = app;
module.exports.app = app;
module.exports.start = start;
