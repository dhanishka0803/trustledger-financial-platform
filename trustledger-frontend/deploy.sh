#!/bin/bash
# Vercel deployment script

echo "🚀 Deploying TRUSTLEDGER to Vercel..."

# Install Vercel CLI if not present
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy to Vercel
echo "Deploying frontend..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your app will be available at: https://trustledger-financial-platform.vercel.app"