require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const compilerRoutes = require('./routes/compilerRoutes');
const judge0Service = require('./judge0Service');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Static frontend assets
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes
app.use('/api', compilerRoutes);

// Fallback to index.html for single page app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Start server
app.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(`🚀 Web Compiler Server running on http://localhost:${PORT}`);
  console.log(`Checking Judge0 connection...`);
  const health = await judge0Service.checkHealth();
  if (health.connected) {
    console.log(`✅ Judge0 Connected: ${health.url} (version ${health.version})`);
  } else {
    console.log(`⚠️ Judge0 Connection Warning: Unable to reach ${health.url}`);
    console.log(`   Error: ${health.error}`);
    console.log(`   Make sure your WSL2 / Docker Judge0 containers are active.`);
  }
  console.log(`====================================================`);
});
