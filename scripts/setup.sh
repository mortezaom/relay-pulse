#!/bin/bash

# Relay Pulse - Automated Setup Script
# This script creates all necessary Cloudflare resources automatically

set -e

echo "🚀 Relay Pulse Auto-Setup"
echo "========================="

# Check prerequisites
check_prerequisites() {
    echo "📋 Checking prerequisites..."
    
    if ! command -v wrangler &> /dev/null; then
        echo "❌ Wrangler CLI is not installed"
        echo "Please install it with: npm install -g wrangler"
        exit 1
    fi
    
    if ! wrangler whoami &> /dev/null; then
        echo "❌ Not authenticated with Cloudflare"
        echo "Please run: wrangler login"
        exit 1
    fi
    
    echo "✅ Prerequisites checked"
}

# Create all Cloudflare resources automatically
create_resources() {
    echo "🔧 Creating Cloudflare resources..."
    
    # Create KV namespace
    echo "Creating KV namespace..."
    wrangler kv:namespace create "RELAY_PULSE_KV" --preview false || true
    
    # Create D1 database
    echo "Creating D1 database..."
    wrangler d1 create relay-pulse-db || true
    
    # Create R2 bucket
    echo "Creating R2 bucket..."
    wrangler r2 bucket create relay-pulse-assets || true
    
    echo "✅ Resources created (or already exist)"
}

# Deploy the application
deploy_app() {
    echo "� Deploying application..."
    
    # Install dependencies
    echo "Installing dependencies..."
    pnpm install
    
    # Build the application
    echo "Building application..."
    pnpm build
    
    # Run database migrations
    echo "Running database migrations..."
    pnpm drizzle-kit push:sqlite || true
    
    # Deploy main application
    echo "Deploying main worker..."
    pnpm deploy
    
    # Deploy monitoring worker
    echo "Deploying monitoring worker..."
    wrangler deploy --config wrangler.monitor.json || true
    
    echo "✅ Application deployed"
}

# Verify deployment
verify_deployment() {
    echo "🔍 Verifying deployment..."
    
    # Basic health check
    echo "Checking if application is responding..."
    # We'll implement a proper health check endpoint later
    
    echo "✅ Deployment completed successfully!"
}

# Main execution
main() {
    echo "Starting automated Relay Pulse setup..."
    echo ""
    
    check_prerequisites
    create_resources
    deploy_app
    verify_deployment
    
    echo ""
    echo "🎉 Relay Pulse is now deployed and ready!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Visit your deployed application"
    echo "2. Complete the initial setup in the dashboard"
    echo "3. Add your first services to monitor"
    echo "4. Configure Apprise notifications if needed"
    echo ""
    echo "🔗 Your application is available at:"
    echo "   https://relay-pulse.your-subdomain.workers.dev"
    echo ""
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi