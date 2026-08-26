var wget = require('../wget');

// Production limits
var MAX_CONCURRENT_DOWNLOADS = Number(process.env.MAX_CONCURRENT_DOWNLOADS) || 5;
var MAX_DOWNLOADS_PER_IP = Number(process.env.MAX_DOWNLOADS_PER_IP) || 2;

// Track active downloads per IP
var activeDownloadsByIp = new Map();

/**
 * Release the per-IP concurrency slot for a finished or cancelled download.
 */
function releaseSlot(socket, ip) {
  if (!socket.job) return;
  socket.job.cancel();
  socket.job = null;
  var current = activeDownloadsByIp.get(ip) || 1;
  if (current <= 1) {
    activeDownloadsByIp.delete(ip);
  } else {
    activeDownloadsByIp.set(ip, current - 1);
  }
}

module.exports = (io) => {
  // Apply connection-level rate limiting
  io.use(function (socket, next) {
    var ip = socket.handshake.address;
    var count = activeDownloadsByIp.get(ip) || 0;
    if (count >= MAX_DOWNLOADS_PER_IP) {
      return next(new Error('You have too many active downloads. Please wait for one to finish.'));
    }
    next();
  });

  io.on('connection', function (socket) {
    var ip = socket.handshake.address;
    console.log('[SOCKET] Client connected: %s', ip);

    socket.on('request', function (data) {
      if (!data || typeof data.token !== 'string' || !data.token) return;

      // Validate token format (alphanumeric only)
      if (!/^[a-zA-Z0-9]{10,}$/.test(data.token)) {
        socket.emit(data.token, { error: 'Invalid session token.' });
        return;
      }

      // One download at a time per connection
      if (socket.job) {
        socket.emit(data.token, { error: 'Please wait for your current download to finish.' });
        return;
      }

      // Track per-IP concurrency
      var ipCount = activeDownloadsByIp.get(ip) || 0;

      // Global concurrency limit
      var totalActive = 0;
      for (var v of activeDownloadsByIp.values()) totalActive += v;
      if (totalActive >= MAX_CONCURRENT_DOWNLOADS) {
        socket.emit(data.token, {
          error: 'Server is busy. Please try again in a moment.',
        });
        return;
      }

      activeDownloadsByIp.set(ip, ipCount + 1);
      console.log('[SOCKET] Download started for %s (active: %d)', ip, ipCount + 1);

      socket.job = wget(socket, data, function () {
        releaseSlot(socket, ip);
        console.log('[SOCKET] Download finished for %s', ip);
      });
    });

    socket.on('disconnect', function () {
      console.log('[SOCKET] Client disconnected: %s', ip);
      releaseSlot(socket, ip);
    });
  });
};
