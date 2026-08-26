<h1 align="center">🌐 Website Downloader</h1>

<p align="center">
  Download the complete source code and assets of any website for offline viewing.
</p>

## ✨ Features

- **Full site mirroring** — downloads HTML, CSS, JS, images, fonts, and all linked assets
- **Offline-ready output** — links are converted to relative paths for local browsing
- **Real-time progress** — live WebSocket updates show each file as it downloads
- **ZIP download** — archived automatically, ready to save to disk
- **Dark mode** — built-in light/dark theme toggle with system preference detection
- **Mobile responsive** — optimized layout for phones, tablets, and desktops
- **Configurable limits** — quota ceiling and timeout prevent runaway downloads
- **Docker support** — multi-stage Dockerfile for one-command deployment anywhere

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | [Next.js](https://nextjs.org/) 15.x + [React](https://react.dev/) 19.x |
| Styling | [Tailwind CSS](https://tailwindcss.com/) 4.x |
| Server | [Express.js](https://expressjs.com/) 4.x |
| Real-time | [Socket.IO](https://socket.io/) 4.x |
| Download engine | [GNU wget](https://www.gnu.org/software/wget/) |
| Archiving | [archiver](https://github.com/archiverjs/node-archiver) (ZIP) |
| Security | [Helmet](https://helmetjs.github.io/), [CORS](https://github.com/expressjs/cors) |
| Container | Docker (Alpine + Node 18) |

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+**
- **wget** on your PATH:
  | OS | Install command |
  |---|---|
  | Debian / Ubuntu | `apt install wget` |
  | macOS | `brew install wget` |
  | Windows | `winget install JernejSimoncic.Wget` |

### Local development

```bash
# Clone the repo
git clone https://github.com/AhmadIbrahiim/Website-downloader.git
cd Website-downloader

# Install dependencies (root + client)
npm install
cd client && npm install && cd ..

# Start in dev mode
npm run dev
```

Open **http://localhost:3000** and enter any URL to download.

### Production build

```bash
# Build the Next.js frontend
npm run build

# Start in production mode
npm start
```

## 🐳 Docker

### Build & run

```bash
docker build -t website-downloader .
docker run -p 3000:3000 website-downloader
```

### Docker Compose

```bash
docker compose up -d
```

## ⚙️ Configuration

All settings are passed as environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Port the server listens on |
| `NODE_ENV` | `development` | Set to `production` for optimized logging & caching |
| `DOWNLOAD_QUOTA` | `100m` | Max disk usage per download (wget `--quota`) |
| `DOWNLOAD_TIMEOUT_MS` | `300000` | Max download time in ms before forced stop |
| `MAX_CONCURRENT_DOWNLOADS` | `5` | Global limit of simultaneous downloads |
| `MAX_DOWNLOADS_PER_IP` | `2` | Max concurrent downloads per IP address |

## 📁 Project Structure

```
.
├── server.js             # Custom server (Express + Socket.IO + Next.js)
├── socket/
│   └── socket.js         # WebSocket event handlers
├── wget/
│   └── index.js          # wget wrapper (download engine)
├── archiver/
│   └── index.js          # ZIP archiver
├── public/
│   └── sites/            # Generated ZIP files (gitignored)
├── downloads/            # Temp download dirs (gitignored)
├── client/               # Next.js frontend
│   ├── src/
│   │   ├── app/          # Next.js app directory (pages + layout)
│   │   ├── components/   # React components (Icons, Logo, DownloadForm, etc.)
│   │   └── lib/          # Shared hooks (useSocket)
│   └── public/           # Static assets (favicon)
├── doctor.config.json    # React Doctor config (excludes downloads/)
├── Dockerfile            # Multi-stage Docker build
├── docker-compose.yml    # Docker Compose config
└── package.json
```

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE.md](LICENSE.md) for details.
