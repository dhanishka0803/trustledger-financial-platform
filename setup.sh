#!/bin/bash

echo "🏦 TRUSTLEDGER - Real-Time Financial Intelligence Platform"
echo "Setting up the complete application..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create environment file for backend
echo "📝 Creating environment configuration..."
cp trustledger-backend/.env.example trustledger-backend/.env

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd trustledger-frontend
npm install
cd ..

# Install backend dependencies (if running locally)
echo "🐍 Setting up Python virtual environment..."
cd trustledger-backend
python -m venv venv

# Activate virtual environment and install dependencies
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

pip install -r requirements.txt
cd ..

# Start services with Docker Compose
echo "🚀 Starting all services..."
docker-compose up -d

echo "✅ TRUSTLEDGER is now running!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo ""
echo "Default admin credentials:"
echo "Username: admin"
echo "Password: admin123"
echo ""
echo "To stop the application: docker-compose down"