#!/bin/bash

# TRUSTLEDGER - Automated Production Fixes
# Run this script to apply all fixes at once

echo "🚀 Applying all production fixes..."

# 1. Update API URL for production
echo "📡 Updating API configuration..."
cat > trustledger-frontend/src/lib/api.ts << 'EOF'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-backend.onrender.com'

export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    return response.json()
  },
  signup: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.json()
  }
}

export const transactionAPI = {
  getAll: async (params?: any) => {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    return response.json()
  },
  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    })
    return response.json()
  },
  getStats: async (days: number) => {
    const response = await fetch(`${API_BASE_URL}/transactions/stats?days=${days}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    return response.json()
  }
}

export const fraudAPI = {
  checkTransaction: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/fraud/check`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    })
    return response.json()
  },
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/fraud/stats`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    return response.json()
  },
  getAlerts: async () => {
    const response = await fetch(`${API_BASE_URL}/fraud/alerts`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    return response.json()
  }
}
EOF

# 2. Add full dark mode CSS
echo "🌙 Adding dark mode styles..."
cat >> trustledger-frontend/src/app/globals.css << 'EOF'

/* Full Dark Mode Support */
.dark {
  background-color: #0f172a;
  color: #f1f5f9;
}

.dark body {
  background-color: #0f172a !important;
  color: #f1f5f9 !important;
}

.dark main {
  background-color: #0f172a !important;
}

.dark .bg-gray-50 {
  background-color: #1e293b !important;
}

.dark .bg-white {
  background-color: #1e293b !important;
  color: #f1f5f9 !important;
}

.dark .text-gray-900 {
  color: #f1f5f9 !important;
}

.dark .text-gray-600 {
  color: #cbd5e1 !important;
}

.dark .text-gray-800 {
  color: #e2e8f0 !important;
}

.dark .border-gray-200 {
  border-color: #334155 !important;
}

.dark .border-gray-300 {
  border-color: #475569 !important;
}

/* Smooth Animations */
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, transform 0.2s ease;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from { 
    opacity: 0; 
    transform: translateY(10px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

.animate-bounce-in {
  animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes bounceIn {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); opacity: 1; }
}

/* Hover Effects */
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* Loading Spinner */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
EOF

# 3. Create environment file template
echo "📝 Creating environment template..."
cat > trustledger-frontend/.env.local.example << 'EOF'
# Backend API URL (Render deployment)
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com

# Add your actual Render URL here after deployment
EOF

# 4. Create Vercel configuration
echo "⚙️ Creating Vercel config..."
cat > trustledger-frontend/vercel.json << 'EOF'
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_URL": "@next_public_api_url"
  }
}
EOF

# 5. Create Render configuration for backend
echo "🔧 Creating Render config..."
cat > trustledger-backend/render.yaml << 'EOF'
services:
  - type: web
    name: trustledger-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: python main_pathway.py
    envVars:
      - key: PYTHON_VERSION
        value: 3.9.0
      - key: PORT
        value: 8000
EOF

echo "✅ All fixes applied successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Update NEXT_PUBLIC_API_URL in Vercel with your Render backend URL"
echo "2. Push changes to GitHub"
echo "3. Deploy backend to Render"
echo "4. Deploy frontend to Vercel"
echo "5. Test all features"
echo ""
echo "🎉 Your application is ready for production!"
