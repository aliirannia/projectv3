const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware پایه
app.use(express.static(__dirname));

// پروکسی API
app.use('/api', createProxyMiddleware({
  target: 'https://edu-api.havirkesht.ir',
  changeOrigin: true,
  pathRewrite: { '^/api': '' }
}));

// Routeهای اصلی
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/main', (req, res) => {
  res.sendFile(path.join(__dirname, 'main.html'));
});

// Health check برای لیارا
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    app: 'havirkesht-frontend'
  });
});

// هندل 404
app.use('*', (req, res) => {
  res.redirect('/');
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`📡 Health: http://0.0.0.0:${PORT}/health`);
});