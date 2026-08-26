var fs = require('fs');
var path = require('path');

var SITES_DIR = path.join(__dirname, '..', 'public', 'sites');

// Delete ZIPs older than this (default 30 minutes, configurable via env)
var MAX_AGE_MS = Number(process.env.ZIP_MAX_AGE_MS) || 30 * 60 * 1000;

// How often to sweep (default every 5 minutes)
var SWEEP_INTERVAL_MS = Number(process.env.ZIP_SWEEP_INTERVAL_MS) || 5 * 60 * 1000;

var timer = null;

/**
 * Delete every .zip in public/sites/ whose age exceeds MAX_AGE_MS.
 * Non-.zip files (like a favicon or placeholder) are left alone.
 */
function sweep() {
  var entries;
  try {
    entries = fs.readdirSync(SITES_DIR);
  } catch (err) {
    // Directory may not exist yet — nothing to clean.
    return;
  }

  var now = Date.now();
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    if (!entry.endsWith('.zip')) continue;

    var filePath = path.join(SITES_DIR, entry);
    try {
      var stat = fs.statSync(filePath);
      if (now - stat.mtimeMs > MAX_AGE_MS) {
        fs.unlinkSync(filePath);
        console.log('[CLEANUP] Deleted old zip: ' + entry);
      }
    } catch (err) {
      // File may have been removed between readdir and stat — skip it.
    }
  }
}

module.exports.start = function start() {
  sweep();
  timer = setInterval(sweep, SWEEP_INTERVAL_MS);
  console.log('[CLEANUP] Sweeping public/sites/ every ' +
    (SWEEP_INTERVAL_MS / 60000) + ' min (max age: ' +
    (MAX_AGE_MS / 60000) + ' min)');
};

module.exports.stop = function stop() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

module.exports.sweep = sweep;
