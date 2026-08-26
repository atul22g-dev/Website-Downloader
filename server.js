#!/usr/bin/env node

var express = require('express');
var path = require('path');
var logger = require('morgan');
var helmet = require('helmet');
var compression = require('compression');
var cors = require('cors');
var http = require('http');
var { Server } = require('socket.io');

var isProd = process.env.NODE_ENV === 'production';
var port = parseInt(process.env.PORT, 10) || 3000;
var CORS_ORIGIN = isProd ? false : 'http://localhost:3000';

// ── Express ──────────────────────────────────────────────────────────
var app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(logger(isProd ? 'combined' : 'dev'));

// Static: downloaded ZIPs (no cache)
app.use('/sites', express.static(path.join(__dirname, 'public', 'sites'), {
  setHeaders: function (res) { res.setHeader('Cache-Control', 'no-store'); },
}));

// ── HTTP + Socket.IO ─────────────────────────────────────────────────
var server = http.createServer(app);

var io = new Server(server, {
  cors: { origin: CORS_ORIGIN, credentials: true },
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e6,
  transports: ['websocket', 'polling'],
});

require('./socket/socket')(io);
var cleanup = require('./cleanup');

// ── Next.js ──────────────────────────────────────────────────────────
var next;

async function startNext() {
  next = require('next')({ dev: !isProd, dir: path.join(__dirname, 'client'), hostname: 'localhost', port: port });
  await next.prepare();

  var handle = next.getRequestHandler();

  app.all('*', function (req, res) {
    return handle(req, res);
  });

  // Error handler
  app.use(function (err, req, res, _next) {
    var status = err.status || 500;
    if (status >= 500) {
      console.error('[ERROR]', new Date().toISOString(), err.stack || err.message);
    }
    res.status(status).json({
      error: isProd && status >= 500 ? 'Internal server error' : err.message,
    });
  });

  server.listen(port, function () {
    console.log('[SERVER] Website Downloader running on http://localhost:' + port);
    console.log('[SERVER] Environment: %s', isProd ? 'production' : 'development');
    cleanup.start();
  });
}

// ── Graceful shutdown ────────────────────────────────────────────────
var isShuttingDown = false;

function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log('\n[SERVER] Received %s — shutting down...', signal);

  cleanup.stop();
  io.close();
  server.close(function () {
    if (next) next.close();
    process.exit(0);
  });

  setTimeout(function () {
    console.error('[SERVER] Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', function () { gracefulShutdown('SIGTERM'); });
process.on('SIGINT', function () { gracefulShutdown('SIGINT'); });
process.on('uncaughtException', function (err) {
  console.error('[FATAL] Uncaught exception:', err);
  gracefulShutdown('uncaughtException');
});
process.on('unhandledRejection', function (reason) {
  console.error('[FATAL] Unhandled rejection:', reason);
});

// ── Start ────────────────────────────────────────────────────────────
startNext().catch(function (err) {
  console.error('[FATAL] Failed to start server:', err);
  process.exit(1);
});
