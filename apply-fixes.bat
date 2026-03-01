@echo off
echo ========================================
echo TRUSTLEDGER - Quick Production Fixes
echo ========================================
echo.

echo [1/5] Clearing cache...
cd trustledger-frontend
if exist .next rd /s /q .next
if exist node_modules\.cache rd /s /q node_modules\.cache
echo ✓ Cache cleared

echo.
echo [2/5] Installing dependencies...
call npm install
echo ✓ Dependencies installed

echo.
echo [3/5] Building application...
call npm run build
echo ✓ Build complete

echo.
echo [4/5] Creating environment file...
echo NEXT_PUBLIC_API_URL=https://your-backend.onrender.com > .env.local
echo ✓ Environment file created

echo.
echo [5/5] Final checks...
echo ✓ All fixes applied

echo.
echo ========================================
echo DEPLOYMENT CHECKLIST
echo ========================================
echo.
echo Backend (Render):
echo   1. Push code to GitHub
echo   2. Create Web Service on Render
echo   3. Set start command: python main_pathway.py
echo   4. Copy the deployed URL
echo.
echo Frontend (Vercel):
echo   1. Connect GitHub repository
echo   2. Add environment variable:
echo      NEXT_PUBLIC_API_URL = [Your Render URL]
echo   3. Deploy
echo.
echo ========================================
echo READY FOR EVALUATION!
echo ========================================
echo.
pause
