@echo off
echo 🏦 TRUSTLEDGER - Real-Time Financial Intelligence Platform
echo Setting up the complete application...

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Create environment file for backend
echo 📝 Creating environment configuration...
copy trustledger-backend\.env.example trustledger-backend\.env

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd trustledger-frontend
call npm install
cd ..

REM Install backend dependencies (if running locally)
echo 🐍 Setting up Python virtual environment...
cd trustledger-backend
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
cd ..

REM Start services with Docker Compose
echo 🚀 Starting all services...
docker-compose up -d

echo ✅ TRUSTLEDGER is now running!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:8000
echo 📚 API Documentation: http://localhost:8000/docs
echo.
echo Default admin credentials:
echo Username: admin
echo Password: admin123
echo.
echo To stop the application: docker-compose down
pause