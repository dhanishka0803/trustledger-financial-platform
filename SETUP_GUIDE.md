# 🏦 TRUSTLEDGER - Complete Setup Guide

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed
- Node.js 18+ installed
- Python 3.11+ installed
- Git installed

### One-Click Setup

**Windows:**
```bash
setup.bat
```

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

## 📁 Project Structure

```
trustledger/
├── trustledger-frontend/          # Next.js Frontend
│   ├── src/
│   │   ├── app/                   # App Router pages
│   │   ├── components/            # React components
│   │   └── lib/                   # Utilities
│   ├── package.json
│   └── Dockerfile
├── trustledger-backend/           # FastAPI Backend
│   ├── app/
│   │   ├── api/                   # API endpoints
│   │   ├── core/                  # Configuration
│   │   ├── models/                # Database models
│   │   └── services/              # Business logic
│   ├── pathway_pipelines/         # Real-time processing
│   ├── ml_models/                 # ML models
│   ├── main.py                    # FastAPI app
│   └── requirements.txt
├── docker-compose.yml             # Full stack deployment
├── README.md                      # Project documentation
└── setup.sh / setup.bat          # Setup scripts
```

## 🌐 Access Points

After setup, access the application at:

- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Database**: PostgreSQL on port 5432
- **Redis Cache**: Redis on port 6379
- **Kafka**: Message broker on port 9092

## 🔑 Default Credentials

**Admin User:**
- Username: `admin`
- Password: `admin123`

**Regular User:**
- Username: `user`
- Password: `user123`

## 🛠️ Manual Setup (Alternative)

### 1. Backend Setup
```bash
cd trustledger-backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```

### 2. Frontend Setup
```bash
cd trustledger-frontend
npm install
npm run dev
```

### 3. Database Setup
```bash
docker run -d \
  --name trustledger-postgres \
  -e POSTGRES_DB=trustledger \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:15
```

## 🔧 Configuration

### Environment Variables (.env)
```env
DATABASE_URL=postgresql://user:password@localhost/trustledger
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key
OPENAI_API_KEY=your-openai-key
TWILIO_ACCOUNT_SID=your-twilio-sid
SENDGRID_API_KEY=your-sendgrid-key
```

## 📊 Features Implemented

### ✅ Core Features (15/15)
1. ✅ Real-time fraud risk score (0–100)
2. ✅ Explainable AI fraud reasoning
3. ✅ Geo-location fraud detection
4. ✅ Impossible travel detection
5. ✅ Behavioral spending pattern learning
6. ✅ Automatic transaction categorization
7. ✅ Live spending analytics dashboard
8. ✅ Market risk and volatility dashboard
9. ✅ Real-time log monitoring and anomaly detection
10. ✅ Fraud + log correlation engine
11. ✅ Rule-based compliance checker (AML/KYC)
12. ✅ Regulatory document RAG chatbot
13. ✅ Monthly AI-generated financial report (PDF)
14. ✅ Instant alerts via SMS/Email/WhatsApp/In-app
15. ✅ Admin fraud case management system

### ✅ Accessibility Features (10/10)
1. ✅ Voice assistant mode
2. ✅ Speech-to-text input
3. ✅ Text-to-speech fraud alerts
4. ✅ Screen reader compatibility
5. ✅ Large text mode toggle
6. ✅ High contrast mode toggle
7. ✅ Simple UI mode for elderly/cognitive disability
8. ✅ One-hand navigation mode
9. ✅ Multi-language support
10. ✅ Multi-format alerts

### ✅ Premium Add-ons (10/10)
1. ✅ Emergency "Freeze Account" button
2. ✅ Guardian/Family monitoring mode
3. ✅ Scam call and scam SMS detection
4. ✅ Biometric authentication
5. ✅ Transaction simulation mode
6. ✅ AI auto-generated fraud complaint draft
7. ✅ Carbon footprint tracker
8. ✅ Smart savings goal planner
9. ✅ Merchant reputation / trust score system
10. ✅ Offline / low-internet mode with sync later

## 🎯 Problem Statements Solved

### 1. Real-Time Market Analytics and Risk Management
- ✅ Live market data ingestion via Pathway streams
- ✅ Real-time volatility tracking and portfolio risk assessment
- ✅ WebSocket updates to dashboard

### 2. Real-Time Fraud Detection
- ✅ ML-powered fraud scoring with explainable AI
- ✅ Behavioral pattern analysis and geo-location validation
- ✅ Real-time risk scores (0-100)

### 3. Streaming Log Analysis and Anomaly Detection
- ✅ Real-time log monitoring with correlation engine
- ✅ System log analysis and fraud-log correlation
- ✅ Automated alerts

### 4. RAG-Driven Personal Finance Assistant
- ✅ AI chatbot with document retrieval capabilities
- ✅ Transaction queries and budget planning
- ✅ Pathway RAG with vector embeddings

### 5. Regulatory Compliance and Document Analysis
- ✅ Automated compliance checking with document RAG
- ✅ AML/KYC validation and regulatory document analysis
- ✅ Compliance scoring and reports

## 🌱 Green Bharat Integration

- ✅ Carbon footprint tracking based on spending
- ✅ Eco-friendly spending suggestions
- ✅ Green lifestyle finance insights dashboard
- ✅ Environmental impact monitoring

## 🔄 Real-Time Architecture

```
Data Sources → Pathway Engine → AI/ML Layer → Frontend UI
     ↓              ↓              ↓           ↓
  Database ← FastAPI Core ← WebSockets ← Real-time Updates
```

## 🚀 Deployment Options

### Local Development
```bash
docker-compose up -d
```

### Production Deployment

**Render.com:**
1. Connect GitHub repository
2. Deploy backend as Web Service
3. Deploy frontend as Static Site
4. Configure environment variables

**Vercel + Railway:**
1. Deploy frontend to Vercel
2. Deploy backend to Railway
3. Configure database and Redis

## 📱 Mobile Responsiveness

- ✅ Responsive design for all screen sizes
- ✅ Touch-friendly interface
- ✅ Mobile-first approach
- ✅ PWA capabilities

## 🔒 Security Features

- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ CORS protection
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ XSS protection

## 📈 Performance Optimizations

- ✅ Redis caching
- ✅ Database indexing
- ✅ Lazy loading
- ✅ Code splitting
- ✅ Image optimization

## 🧪 Testing

```bash
# Backend tests
cd trustledger-backend
pytest

# Frontend tests
cd trustledger-frontend
npm test
```

## 📞 Support

For issues or questions:
1. Check the API documentation at `/docs`
2. Review the logs: `docker-compose logs`
3. Restart services: `docker-compose restart`

## 🏆 Hackathon Submission

This project demonstrates:
- ✅ Complete Pathway Track implementation
- ✅ All 5 problem statements solved
- ✅ 35 advanced features implemented
- ✅ Accessibility and inclusion focus
- ✅ Green Bharat sustainability integration
- ✅ Production-ready architecture
- ✅ Comprehensive documentation

**TRUSTLEDGER - Revolutionizing Financial Intelligence with AI and Real-Time Processing!** 🚀