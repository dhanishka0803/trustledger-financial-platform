from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import asyncio
import json
from datetime import datetime, timedelta
import random

from app.api import auth, transactions, fraud, market, ai, compliance, admin
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.models.models import User, Transaction, FraudScore, MarketData, ComplianceCheck, SystemLog, Notification
from app.services.websocket_manager import WebSocketManager
from app.api.auth import get_password_hash

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TRUSTLEDGER API",
    description="Real-Time Financial Intelligence Platform - Complete Working Backend",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware - allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket manager
websocket_manager = WebSocketManager()

# Include API routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(transactions.router, prefix="/api/transactions", tags=["Transactions"])
app.include_router(fraud.router, prefix="/api/fraud", tags=["Fraud Detection"])
app.include_router(market.router, prefix="/api/market", tags=["Market Analytics"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI Assistant"])
app.include_router(compliance.router, prefix="/api/compliance", tags=["Compliance"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])


def seed_database():
    """Seed the database with initial data"""
    db = SessionLocal()
    try:
        # Check if already seeded
        existing_users = db.query(User).count()
        if existing_users > 0:
            print("Database already seeded. Skipping...")
            return

        print("Seeding database with initial data...")

        # Create admin user
        admin_user = User(
            username="admin",
            email="admin@trustledger.com",
            hashed_password=get_password_hash("admin123"),
            full_name="System Administrator",
            phone="+91-9999999999",
            is_admin=True,
            is_active=True
        )
        db.add(admin_user)

        # Create demo user
        demo_user = User(
            username="user",
            email="user@trustledger.com",
            hashed_password=get_password_hash("user123"),
            full_name="Demo User",
            phone="+91-9876543210",
            is_admin=False,
            is_active=True
        )
        db.add(demo_user)

        # Create additional test users (without transactions/notifications)
        test_users = [
            User(
                username="rahul",
                email="rahul@example.com",
                hashed_password=get_password_hash("rahul123"),
                full_name="Rahul Sharma",
                phone="+91-9876543211"
            ),
            User(
                username="priya",
                email="priya@example.com",
                hashed_password=get_password_hash("priya123"),
                full_name="Priya Patel",
                phone="+91-9876543212"
            ),
        ]
        for u in test_users:
            db.add(u)

        db.commit()
        db.refresh(demo_user)

        # Only create transactions and notifications for demo user
        # New users (rahul, priya) will have zero transactions and notifications

        # Create sample transactions for demo user
        merchants = [
            ("Amazon India", "Shopping", "Mumbai"),
            ("Swiggy", "Food & Dining", "Mumbai"),
            ("Uber", "Transport", "Mumbai"),
            ("Netflix", "Entertainment", "Online"),
            ("Reliance Fresh", "Groceries", "Mumbai"),
            ("HDFC Mutual Fund", "Investment", "Online"),
            ("Airtel", "Utilities", "Online"),
            ("Flipkart", "Shopping", "Delhi"),
            ("Zomato", "Food & Dining", "Mumbai"),
            ("Indian Oil", "Fuel", "Mumbai"),
            ("BigBasket", "Groceries", "Bangalore"),
            ("BookMyShow", "Entertainment", "Mumbai"),
            ("PhonePe Transfer", "Transfer", "Online"),
            ("SBI Life Insurance", "Insurance", "Online"),
            ("Apollo Pharmacy", "Healthcare", "Mumbai"),
            ("Starbucks", "Food & Dining", "Mumbai"),
            ("Myntra", "Shopping", "Online"),
            ("Ola", "Transport", "Delhi"),
            ("Jio Recharge", "Utilities", "Online"),
            ("DMart", "Groceries", "Mumbai"),
        ]

        categories_amounts = {
            "Shopping": (-2000, -15000),
            "Food & Dining": (-200, -3000),
            "Transport": (-100, -2000),
            "Entertainment": (-200, -1500),
            "Groceries": (-500, -5000),
            "Investment": (-5000, -50000),
            "Utilities": (-200, -2000),
            "Fuel": (-500, -3000),
            "Transfer": (-1000, -20000),
            "Insurance": (-2000, -10000),
            "Healthcare": (-500, -5000),
        }

        # Add income transactions
        income_transactions = [
            ("Salary Credit - TCS", 85000, "Income", "Company credited salary", "Mumbai"),
            ("Freelance Payment", 15000, "Income", "Web development project", "Online"),
            ("Dividend - HDFC", 2500, "Income", "Quarterly dividend", "Online"),
            ("Interest - SBI FD", 1800, "Income", "Fixed deposit interest", "Online"),
            ("Cashback - Amazon", 450, "Income", "Shopping cashback", "Online"),
        ]

        all_transactions = []

        # Create income transactions
        for i, (merchant, amount, category, desc, location) in enumerate(income_transactions):
            days_ago = random.randint(1, 28)
            txn = Transaction(
                transaction_id=f"TXN{datetime.utcnow().strftime('%Y%m%d')}{1000 + i}",
                user_id=demo_user.id,
                merchant=merchant,
                amount=amount,
                category=category,
                description=desc,
                location=location,
                timestamp=datetime.utcnow() - timedelta(days=days_ago, hours=random.randint(0, 23))
            )
            db.add(txn)
            all_transactions.append(txn)

        # Create expense transactions
        for i, (merchant, category, location) in enumerate(merchants):
            amount_range = categories_amounts.get(category, (-500, -5000))
            amount = round(random.uniform(amount_range[0], amount_range[1]), 2)
            days_ago = random.randint(0, 28)

            txn = Transaction(
                transaction_id=f"TXN{datetime.utcnow().strftime('%Y%m%d')}{2000 + i}",
                user_id=demo_user.id,
                merchant=merchant,
                amount=amount,
                category=category,
                description=f"Payment to {merchant}",
                location=location,
                timestamp=datetime.utcnow() - timedelta(days=days_ago, hours=random.randint(0, 23))
            )
            db.add(txn)
            all_transactions.append(txn)

        db.commit()

        # Create fraud scores for transactions
        for txn in all_transactions:
            db.refresh(txn)
            risk_score = random.uniform(5, 45)  # Most are low risk

            # Make a few high risk
            if txn.merchant in ["PhonePe Transfer", "Flipkart"] or abs(txn.amount) > 30000:
                risk_score = random.uniform(60, 95)

            risk_level = "low"
            if risk_score >= 90:
                risk_level = "critical"
            elif risk_score >= 70:
                risk_level = "high"
            elif risk_score >= 40:
                risk_level = "medium"

            reasons = []
            if risk_score >= 70:
                reasons.append("Unusual transaction pattern detected")
                reasons.append("Amount exceeds normal spending range")
            elif risk_score >= 40:
                reasons.append("Moderate risk - monitoring recommended")
            else:
                reasons.append("Transaction appears normal")

            fraud_score = FraudScore(
                transaction_id=txn.id,
                user_id=demo_user.id,
                risk_score=round(risk_score, 2),
                risk_level=risk_level,
                reasons=str(reasons),
                geo_risk=risk_score > 60,
                impossible_travel=risk_score > 80,
                behavioral_anomaly=risk_score > 50,
                created_at=txn.timestamp
            )
            db.add(fraud_score)

        # Create compliance checks
        for check_type, score in [("KYC", 92), ("AML", 95), ("Transaction Monitoring", 88), ("FATCA/CRS", 100)]:
            check = ComplianceCheck(
                user_id=demo_user.id,
                check_type=check_type,
                status="passed",
                score=score,
                details=json.dumps({"status": "verified", "last_check": datetime.utcnow().isoformat()})
            )
            db.add(check)

        # Create system logs
        log_messages = [
            ("INFO", "System started successfully", "system"),
            ("INFO", "Database initialized", "database"),
            ("INFO", "Fraud detection engine loaded", "fraud_engine"),
            ("INFO", "AI models initialized", "ai_service"),
            ("WARNING", "High API response time detected", "api_monitor"),
            ("INFO", "Market data feed connected", "market_service"),
            ("INFO", "Compliance check completed for all users", "compliance"),
        ]

        for level, message, source in log_messages:
            log = SystemLog(
                level=level,
                message=message,
                source=source,
                user_id=admin_user.id
            )
            db.add(log)

        # Create notifications for demo user
        notifications = [
            ("Welcome to TrustLedger!", "Your account has been set up successfully. Explore all features.", "info", "low"),
            ("Security Alert", "New login detected from Mumbai, India. If this wasn't you, please contact support.", "security", "medium"),
            ("Monthly Report Ready", "Your January 2025 financial report is ready for download.", "info", "low"),
            ("Fraud Alert", "Suspicious transaction detected on your account. Please review.", "fraud", "high"),
        ]

        for title, message, ntype, severity in notifications:
            notif = Notification(
                user_id=demo_user.id,
                title=title,
                message=message,
                type=ntype,
                severity=severity
            )
            db.add(notif)

        db.commit()
        print(f"Database seeded successfully!")
        print(f"  - Users: 4 (admin/admin123, user/user123, rahul/rahul123, priya/priya123)")
        print(f"  - Transactions: {len(all_transactions)}")
        print(f"  - Fraud scores: {len(all_transactions)}")
        print(f"  - Compliance checks: 4")
        print(f"  - System logs: {len(log_messages)}")
        print(f"  - Notifications: {len(notifications)}")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    print("\n" + "=" * 60)
    print("TRUSTLEDGER - Real-Time Financial Intelligence Platform")
    print("=" * 60)
    seed_database()
    print("\nAll systems ready!")
    print(f"API Docs: http://localhost:8000/docs")
    print(f"API Base: http://localhost:8000/api")
    print("=" * 60 + "\n")


@app.get("/")
async def root():
    return {
        "message": "TRUSTLEDGER API - Real-Time Financial Intelligence Platform",
        "version": "2.0.0",
        "status": "active",
        "timestamp": datetime.now().isoformat(),
        "endpoints": {
            "docs": "/docs",
            "auth": "/api/auth",
            "transactions": "/api/transactions",
            "fraud": "/api/fraud",
            "market": "/api/market",
            "ai": "/api/ai",
            "compliance": "/api/compliance",
            "admin": "/api/admin"
        }
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "database": "connected",
            "fraud_engine": "active",
            "ai_models": "loaded",
            "market_feed": "connected"
        }
    }


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket_manager.connect(websocket, client_id)
    try:
        while True:
            await asyncio.sleep(10)

            # Send periodic fraud alerts
            fraud_alert = {
                "type": "fraud_alert",
                "data": {
                    "transaction_id": f"TXN{datetime.now().strftime('%Y%m%d%H%M%S')}",
                    "risk_score": random.randint(30, 90),
                    "reason": random.choice([
                        "Unusual spending pattern detected",
                        "Transaction from new location",
                        "High-value transaction alert",
                        "Rapid successive transactions"
                    ]),
                    "timestamp": datetime.now().isoformat()
                }
            }
            await websocket_manager.send_personal_message(json.dumps(fraud_alert), client_id)

    except WebSocketDisconnect:
        websocket_manager.disconnect(client_id)


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
