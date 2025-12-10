# Relay Pulse

A modern uptime monitoring solution designed for Cloudflare Workers. Built with ease of deployment in mind, Relay Pulse leverages Cloudflare's KV and D1 for efficient data storage and management.

## Overview

Relay Pulse is currently under active development, with basic service management implemented. The goal is to provide a seamless way to monitor services with support for pinging and pulsing over TCP, HTTP, and HTTPS. The project features a sleek dashboard built with Next.js, styled with Tailwind CSS, and enhanced by Shadcn UI components. Integration with Cloudflare is simplified using OpenNext/Cloudflare bindings.

Relay Pulse allows configuration directly from a cloud dashboard, removing the need to handle local config files.

## 🚀 One-Click Deployment

Deploy Relay Pulse to your Cloudflare account with **zero configuration** - just add your API credentials!

### Prerequisites
- Cloudflare account (free tier works!)
- GitHub account

### Deployment Steps

1. **Fork this repository** to your GitHub account

2. **Add Cloudflare secrets** to your forked repository:
   - Go to **Settings** → **Secrets and variables** → **Actions**
   - Add these secrets:
     ```
     CLOUDFLARE_API_TOKEN=your_api_token
     CLOUDFLARE_ACCOUNT_ID=your_account_id
     ```

3. **Get your Cloudflare credentials**:
   - **API Token**: [Create here](https://dash.cloudflare.com/profile/api-tokens) with "Custom token" → "Cloudflare Workers:Edit" permissions
   - **Account ID**: Found in the right sidebar of any Cloudflare dashboard page

4. **Deploy automatically**:
   - Push to `main` branch or manually trigger the "Deploy to Cloudflare" workflow
   - The GitHub Action automatically:
     - ✅ Creates all required Cloudflare resources (KV, D1)
     - ✅ Deploys the dashboard application
     - ✅ Deploys monitoring workers with cron triggers
     - ✅ Runs database migrations
     - ✅ No manual configuration needed!

5. **Start monitoring**:
   - Visit `https://relay-pulse.{your-subdomain}.workers.dev`
   - Add your first services through the dashboard
   - Configure notifications using [Apprise](https://github.com/caronc/apprise) (optional)

### That's it! 🎉

Everything else is managed through the web dashboard and stored automatically in Cloudflare KV.

## 🛠️ Local Development

To run Relay Pulse locally:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/mortezaom/relay-pulse.git
   cd relay-pulse
   ```

2. **Install Dependencies**:
   ```bash
   pnpm install
   ```

3. **Setup Environment** (optional):
   ```bash
   cp .env.example .env.local
   # Only add CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID if testing with real resources
   ```

4. **Run Locally**:
   ```bash
   pnpm run dev
   ```

> **Note**: All user settings (monitoring intervals, notifications, etc.) are managed through the dashboard and stored in Cloudflare KV - no local configuration files needed!

## 📋 Features Status

### ✅ Core Monitoring (Completed)
- ✅ **Unified monitoring system** (`src/lib/monitoring/`)
  - HTTP/HTTPS service monitoring with timeout handling
  - TCP port monitoring via external checker
  - Response time tracking
  - Error handling and incident management
  - Automated cron-based scheduling (every 5 minutes)
  - Daily data cleanup (2 AM UTC)

### ✅ Notification System (Completed)
- ✅ **Multi-provider notification system** (`src/lib/notifications/`)
  - Telegram, Discord, Slack
  - Email (via Resend API)
  - Ntfy, Gotify
  - Apprise (legacy support)
  - Channel-based configuration with encryption
  - Per-service notification mappings
  - Alert thresholds and recovery notifications

### ✅ Database & Storage (Completed)
- ✅ **Schema and operations** (`src/db/`)
  - Services table
  - Monitoring results tracking
  - Incidents management
  - KV-based settings storage

### ✅ Dashboard Features (Completed)
- ✅ **Service management**
  - Full CRUD operations
  - Real-time status display
  - Uptime and response time metrics
  - Notification channel configuration

### ✅ Deployment (Completed)
- ✅ **One-click deployment** (GitHub Actions)
  - Automatic resource creation (D1, KV)
  - Database migrations
  - JWT secret management
  - Health checks

### 🚀 Future Enhancements
- [ ] Advanced analytics dashboard with charts
- [ ] Custom public status pages
- [ ] Multi-region monitoring
- [ ] Advanced incident timelines
- [ ] API rate limiting
- [ ] Webhook integrations

## 🏗️ Architecture

Relay Pulse is built with modern web technologies optimized for edge computing:

- **Frontend**: Next.js 15 with TypeScript and React 19
- **Styling**: Tailwind CSS 4 + Shadcn/ui components
- **Database**: Cloudflare D1 (SQLite) with Drizzle ORM
- **Storage**: Cloudflare KV (settings, channels, logo as base64)
- **Runtime**: Cloudflare Workers (Edge Runtime)
- **Monitoring**: Unified worker with cron triggers (every 5 min)
- **Deployment**: OpenNext for Next.js → Cloudflare Workers conversion

### Unified Worker Architecture

```
Single Cloudflare Worker Deployment
├── HTTP Handler (fetch) → Next.js App via OpenNext
│   ├── Dashboard UI (/dashboard/*)
│   ├── API Routes (/api/*)
│   └── Public Status Page (/)
│
└── Cron Handler (scheduled) → Monitoring System
    ├── Every 5 minutes: Service health checks
    ├── Daily at 2 AM: Data cleanup
    └── Uses: src/lib/monitoring/* + src/lib/notifications/*
```

All components share the same Cloudflare resources (D1, KV), eliminating the need for separate worker deployments or complex coordination.

## 🔧 Key Features

### ✅ Monitoring
- **Multi-protocol support**: HTTP, HTTPS, and TCP
- **Configurable intervals**: Per-service monitoring frequency
- **Response tracking**: Status codes, response times, error messages
- **Incident management**: Automatic detection and resolution tracking
- **Data retention**: 90-day history with automatic cleanup

### ✅ Notifications
- **7 notification providers**:
  - 📧 **Email** (via Resend - 100 free/day, 3000/month)
  - 💬 **Telegram** Bot
  - 💬 **Discord** Webhooks
  - 💬 **Slack** Webhooks
  - 🔔 **Ntfy** (self-hosted or public)
  - 🔔 **Gotify** (self-hosted)
  - � **Apprise** (universal gateway)
- **Encrypted credentials**: AES-256-GCM encryption
- **Per-service configuration**: Different channels per service
- **Alert thresholds**: Configurable failure counts
- **Recovery notifications**: Optional "back online" alerts

### ✅ Dashboard
- **Real-time status**: Live service health at a glance
- **Uptime metrics**: 24h, 7d, 30d, 90d calculations
- **Service management**: Add, edit, delete services
- **Notification channels**: Manage and test integrations
- **Settings**: Global configuration, TCP checker URL
- **Branding**: Custom logo, title, and alert messages

### ✅ Deployment
- **One-click setup**: GitHub Actions automation
- **Zero configuration**: Resources auto-created
- **Free tier friendly**: Optimized for Cloudflare free tier
- **Global edge**: Deployed to Cloudflare's network

## 🤝 Contributing

TODO: Add contribution guidelines

## 📄 License

TODO: Add license information