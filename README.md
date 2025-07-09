# Relay Pulse

A modern uptime monitoring solution designed for Cloudflare Workers. Built with ease of deployment in mind, Relay Pulse leverages Cloudflare's KV and D1 for efficient data storage and management.

## Overview

Relay Pulse is currently under active development, with no features implemented at this stage. The goal is to provide a seamless way to monitor services with support for pinging and pulsing over TCP, HTTP, and HTTPS. The project will feature a sleek dashboard built with Next.js, styled with Tailwind CSS, and enhanced by Shadcn UI components. Integration with Cloudflare will be simplified using OpenNext/Cloudflare bindings.

Relay Pulse will allow configuration directly from a cloud dashboard, removing the need to handle local config files.

## Getting Started

To check it locally, follow these steps:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/mortezaom/relay-pulse.git
   cd relay-pulse
   ```

2. **Install Dependencies**:
   ```bash
   pnpm install
   ```

3. **Run Locally**:
   ```bash
   pnpm run dev
   ```

Stay tuned for updates as development continues.

## Features in Development
- Support for TCP, HTTP, and HTTPS monitoring.
- Cloud-based dashboard for easy configuration.
- Seamless deployment on Cloudflare Workers with KV and D1 integration.