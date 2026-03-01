#!/bin/bash
# Frontend deployment script

echo "🚀 Deploying TRUSTLEDGER Frontend to Render..."

# Install dependencies
npm install

# Build the application
npm run build

echo "✅ Build complete!"