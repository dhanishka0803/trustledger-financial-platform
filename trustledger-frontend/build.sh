#!/bin/bash
# Render build script for TRUSTLEDGER frontend

echo "🚀 Building TRUSTLEDGER for Render..."

# Install dependencies
npm install

# Build the application
npm run build

echo "✅ Build complete!"