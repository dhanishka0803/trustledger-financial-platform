#!/bin/bash
# Build script for Render deployment

echo "Installing dependencies..."
npm install

echo "Building Next.js application..."
npm run build

echo "Build complete!"