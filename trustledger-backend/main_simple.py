"""
TRUSTLEDGER - Simple FastAPI Backend
Works without Pathway for demo purposes
"""

from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import bcrypt
from jose import jwt
from datetime import datetime, timedelta
import random
import uvicorn

# Config
SECRET_KEY = "trustledger-secret-key-2024"
ALGORITHM = "HS256"
DATABASE_PATH = "./trustledger.db"

app = FastAPI(title="TRUSTLEDGER API", version="1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Models
class LoginReq(BaseModel):
    username: str
    password: str

class RegisterReq(BaseModel):
    username: str
    email: str
    password: str
    full_name: str = ""

class TransactionReq(BaseModel):
    merchant: str
    amount: float
    category: str = "Other"
    description: str = ""
    location: str = ""

class ChatReq(BaseModel):
    message: str

# Database
def get_db():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        username TEXT UNIQUE, email TEXT UNIQUE,
        hashed_password TEXT, full_name TEXT,
        is_admin INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""")
    
    cursor.execute("""CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY, transaction_id TEXT UNIQUE,
        user_id INTEGER, merchant TEXT, amount REAL,
        category TEXT, description TEXT, location TEXT,
        status TEXT DEFAULT 'completed',
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""")
    
    cursor.execute("""CREATE TABLE IF NOT EXISTS fraud_scores (
        id INTEGER PRIMARY KEY, transaction_id INTEGER,
        user_id INTEGER, risk_score REAL, risk_level TEXT,
        reasons TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""")
    
    conn.commit()
    conn.close()

# Auth helpers
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))
    except:
        return False

def create_token(data: dict):
    expire = datetime.utcnow() + timedelta(minutes=30)
    data.update({"exp": expire})
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM]).get("sub")
    except:
        return None

def get_user(auth: str = ""):
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(401)
    username = decode_token(auth.replace("Bearer ", ""))
    if not username:
        raise HTTPException(401)
    
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
    conn.close()
    
    if not user:
        raise HTTPException(401)
    return dict(user)

# Fraud detection (simple version)
def calculate_fraud_score(amount: float, merchant: str, location: str):
    score = random.randint(5, 25)
    
    if abs(amount) > 100000:
        score += 30
    elif abs(amount) > 50000:
        score += 20
    elif abs(amount) > 20000:
        score += 10
    
    risky_merchants = ["crypto", "unknown", "offshore", "cash", "gambling"]
    if any(kw in (merchant or "").lower() for kw in risky_merchants):
        score += 25
    
    score = min(score, 100)
    
    if score >= 70:
        level = "high"
    elif score >= 40:
        level = "medium"
    else:
        level = "low"
    
    reasons = []
    if abs(amount) > 50000:
        reasons.append(f"Large transaction: ₹{abs(amount):,.0f}")
    if score > 50:
        reasons.append("AI flagged as suspicious")
    
    return {"score": score, "level": level, "reasons": reasons}

# API Endpoints
@app.post("/api/auth/register")
async def register(req: RegisterReq):
    conn = get_db()
    cursor = conn.cursor()
    
    if cursor.execute("SELECT id FROM users WHERE email = ?", (req.email,)).fetchone():
        raise HTTPException(400, "Email already registered")
    
    if cursor.execute("SELECT id FROM users WHERE username = ?", (req.username,)).fetchone():
        raise HTTPException(400, "Username taken")
    
    hashed = hash_password(req.password)
    cursor.execute("""
        INSERT INTO users (username, email, hashed_password, full_name)
        VALUES (?, ?, ?, ?)
    """, (req.username, req.email, hashed, req.full_name))
    
    user_id = cursor.lastrowid
    
    # Demo transactions
    for i, (cat, merch, amt) in enumerate([("Income", "Salary", 75000), ("Shopping", "Amazon", -3500)]):
        txn_id = f"TXN{user_id}{i}"
        cursor.execute("""
            INSERT INTO transactions (transaction_id, user_id, merchant, amount, category, status)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (txn_id, user_id, merch, amt, cat, "completed"))
        
        fraud_result = calculate_fraud_score(amt, merch, "")
        cursor.execute("""
            INSERT INTO fraud_scores (transaction_id, user_id, risk_score, risk_level, reasons)
            VALUES (?, ?, ?, ?, ?)
        """, (cursor.lastrowid, user_id, fraud_result["score"], fraud_result["level"], str(fraud_result["reasons"])))
    
    conn.commit()
    conn.close()
    
    return {"access_token": create_token({"sub": req.username}), "user": {"username": req.username}}

@app.post("/api/auth/login")
async def login(req: LoginReq):
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE username = ?", (req.username,)).fetchone()
    
    if not user or not verify_password(req.password, user["hashed_password"]):
        raise HTTPException(401, "Invalid credentials")
    
    conn.close()
    return {"access_token": create_token({"sub": user["username"]}), "user": {"username": user["username"]}}

@app.post("/api/transactions/")
async def create_transaction(req: TransactionReq, authorization: str = Header(None)):
    user = get_user(authorization)
    
    conn = get_db()
    cursor = conn.cursor()
    
    txn_id = f"TXN{datetime.now().strftime('%Y%m%d%H%M%S')}{random.randint(100,999)}"
    
    cursor.execute("""
        INSERT INTO transactions (transaction_id, user_id, merchant, amount, category, description, location, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (txn_id, user["id"], req.merchant, req.amount, req.category, req.description, req.location, "completed"))
    
    txn_db_id = cursor.lastrowid
    
    fraud_result = calculate_fraud_score(req.amount, req.merchant, req.location)
    
    cursor.execute("""
        INSERT INTO fraud_scores (transaction_id, user_id, risk_score, risk_level, reasons)
        VALUES (?, ?, ?, ?, ?)
    """, (txn_db_id, user["id"], fraud_result["score"], fraud_result["level"], str(fraud_result["reasons"])))
    
    conn.commit()
    conn.close()
    
    return {
        "transaction_id": txn_id,
        "fraud_score": fraud_result["score"],
        "risk_level": fraud_result["level"]
    }

@app.get("/api/transactions/")
async def get_transactions(authorization: str = Header(None)):
    user = get_user(authorization)
    conn = get_db()
    txns = conn.execute("""
        SELECT t.*, f.risk_score, f.risk_level 
        FROM transactions t LEFT JOIN fraud_scores f ON t.id = f.transaction_id
        WHERE t.user_id = ? ORDER BY t.timestamp DESC LIMIT 50
    """, (user["id"],)).fetchall()
    conn.close()
    return [{"id": t["id"], "merchant": t["merchant"], "amount": t["amount"], 
             "fraud_score": t["risk_score"] or 0} for t in txns]

@app.post("/api/ai/chat")
async def chat(req: ChatReq, authorization: str = Header(None)):
    user = get_user(authorization)
    msg = req.message.lower()
    
    if "hello" in msg:
        response = f"Hello {user['full_name'] or user['username']}! 👋"
    elif "fraud" in msg:
        response = "🔒 Your transactions are monitored for fraud detection."
    elif "market" in msg:
        response = "📈 Market data analysis is available in the dashboard."
    else:
        response = f"I understand: '{req.message}'. How can I help you?"
    
    return {"response": response}

@app.get("/api/market/live")
async def get_market():
    symbols = ["NIFTY50", "SENSEX", "BANKNIFTY"]
    base_prices = {"NIFTY50": 22450, "SENSEX": 73850, "BANKNIFTY": 47200}
    data = []
    
    for symbol in symbols:
        base = base_prices[symbol]
        price = base + random.uniform(-base*0.02, base*0.02)
        change = price - base
        change_pct = (change / base) * 100
        
        data.append({
            "symbol": symbol,
            "price": round(price, 2),
            "change": round(change, 2),
            "change_percent": round(change_pct, 2),
            "trend": "bullish" if change_pct > 0 else "bearish"
        })
    
    return {"data": data}

@app.get("/")
async def root():
    return {"message": "TRUSTLEDGER API", "status": "running"}

def seed_data():
    conn = get_db()
    cursor = conn.cursor()
    
    if not cursor.execute("SELECT id FROM users WHERE username = 'admin'").fetchone():
        cursor.execute("INSERT INTO users (username, email, hashed_password, full_name, is_admin) VALUES (?, ?, ?, ?, ?)", 
                     ("admin", "admin@tl.com", hash_password("admin123"), "Admin", 1))
    
    if not cursor.execute("SELECT id FROM users WHERE username = 'user'").fetchone():
        cursor.execute("INSERT INTO users (username, email, hashed_password, full_name, is_admin) VALUES (?, ?, ?, ?, ?)", 
                     ("user", "user@tl.com", hash_password("user123"), "User", 0))
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    print("🚀 TRUSTLEDGER - Simple Backend")
    print("=" * 40)
    
    init_db()
    seed_data()
    
    print("✅ Database Ready")
    print("✅ Demo users: admin/admin123, user/user123")
    print("=" * 40)
    
    uvicorn.run(app, host="0.0.0.0", port=8000)