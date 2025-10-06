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
     - ✅ Creates all required Cloudflare resources (KV, D1, R2)
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

## 📋 Development TODO List

The following TODO items are marked throughout the codebase to guide development:

### Core Monitoring Engine
- [ ] **Implement monitoring workers** (`src/workers/monitor.ts`)
  - HTTP/HTTPS service monitoring
  - TCP port monitoring
  - Response time tracking
  - Error handling and timeouts

- [ ] **Scheduler implementation** (`src/workers/scheduler.ts`)
  - Cron job configuration
  - Service monitoring orchestration
  - Data cleanup routines

### Database & Storage
- [ ] **Complete database schema** (`src/db/schema.ts`)
  - Monitoring results table
  - Incidents tracking
  - Notification settings

- [ ] **Monitoring utilities** (`src/lib/monitoring/`)
  - Database operations (`database.ts`)
  - Notification system (`notifications.ts`)
  - Analytics and statistics (`analytics.ts`)

### Dashboard Features
- [ ] **Services management** (`src/components/dashboard/services-list.tsx`)
  - Add monitoring status columns
  - Real-time status updates
  - Response time display

- [ ] **API enhancements** (`src/app/api/services/route.ts`)
  - Include monitoring data in service responses
  - Start monitoring for new services

### Deployment Pipeline
- [ ] **GitHub Actions** (`.github/workflows/deploy.yml`)
  - Resource creation automation
  - Database migrations
  - Health checks and rollbacks

### Additional Features
- [ ] Email notifications via Cloudflare Email Workers
- [ ] Webhook notifications
- [ ] Incident management system
- [ ] Status page generation
- [ ] Performance analytics and charts

## 🏗️ Architecture

Relay Pulse is built with modern web technologies optimized for edge computing:

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui components
- **Database**: Cloudflare D1 (SQLite) with Drizzle ORM
- **Storage**: Cloudflare KV + R2 for assets
- **Runtime**: Cloudflare Workers (Edge Runtime)
- **Monitoring**: Scheduled Workers with Cron Triggers

## 🔧 Features in Development

### ✅ Completed
- Service CRUD operations
- Basic dashboard UI
- Database schema foundation
- Authentication system setup

### 🚧 In Progress
- Core monitoring engine
- Real-time status tracking
- Notification system
- Incident management

### 📅 Planned
- Advanced analytics
- Multi-region monitoring
- Custom status pages
- API rate limiting
- Performance optimizations

## 🤝 Contributing

TODO: Add contribution guidelines

## 📄 License

TODO: Add license information