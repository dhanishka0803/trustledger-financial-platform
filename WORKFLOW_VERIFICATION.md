# 🏦 TRUSTLEDGER - Manual Workflow Verification

## ✅ Quick Verification Checklist

### 1. **Backend Startup** 
```bash
cd trustledger-backend
python main_pathway.py
```
**Expected**: Server starts on http://localhost:8000
**Check**: Visit http://localhost:8000/docs for API documentation

### 2. **Frontend Startup**
```bash
cd trustledger-frontend  
npm run dev
```
**Expected**: Frontend starts on http://localhost:3000
**Check**: Landing page loads with TRUSTLEDGER branding

### 3. **Authentication Flow**
- Visit http://localhost:3000/login
- Login with: `user` / `user123`
- **Expected**: Redirects to dashboard
- **Check**: User info appears in header

### 4. **Dashboard Features**
- **Balance Display**: Shows account balance
- **Transaction History**: Lists recent transactions
- **Fraud Alerts**: Shows risk scores
- **Charts**: Spending and fraud risk visualizations

### 5. **Core Features Test**

#### Fraud Detection:
- Go to Transactions page
- Create new transaction with large amount (>₹50,000)
- **Expected**: High fraud risk score (>70)

#### AI Assistant:
- Go to Assistant page  
- Ask: "What are KYC requirements?"
- **Expected**: Detailed response about documents needed

#### Market Analytics:
- Go to Market page
- **Expected**: Live market data for NIFTY, SENSEX, etc.
- **Check**: Price changes and trend indicators

#### Compliance:
- Go to Compliance page
- **Expected**: KYC/AML status with scores

### 6. **Accessibility Features**
- **Voice Mode**: Click voice icon, test speech
- **High Contrast**: Toggle contrast mode
- **Large Text**: Toggle text size
- **Screen Reader**: Test with screen reader

### 7. **Admin Features**
- Logout and login as: `admin` / `admin123`
- Go to Admin page
- **Expected**: User management, fraud cases, system logs

### 8. **API Endpoints Test**
Visit http://localhost:8000/docs and test:
- `POST /api/auth/login` - Authentication
- `POST /api/transactions/analyze` - Fraud detection
- `POST /api/ai/chat` - RAG assistant
- `GET /api/market/live` - Market data

## 🎯 Success Criteria

✅ **All pages load without errors**  
✅ **Authentication works for both user types**  
✅ **Fraud detection shows risk scores**  
✅ **AI assistant provides relevant answers**  
✅ **Market data displays live information**  
✅ **Accessibility features function properly**  
✅ **Admin panel shows management features**  
✅ **API endpoints return expected data**  

## 🚨 Common Issues & Fixes

**Backend won't start**: 
```bash
pip install -r requirements.txt
```

**Frontend won't start**:
```bash
npm install
```

**Database errors**:
- Delete `trustledger.db` file
- Restart backend (will recreate database)

**API connection errors**:
- Check backend is running on port 8000
- Verify CORS settings in main_pathway.py

## 🏆 Final Verification

If all items pass ✅, the application is **fully functional** and ready for:
- Hackathon demonstration
- Production deployment  
- User testing
- Feature expansion