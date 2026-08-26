/** @type {import('next').NextConfig} */
var path = require('path');
var nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname, '..'),
};

module.exports = nextConfig;
