from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
import random

from app.core.database import get_db
from app.models.models import User, Transaction, FraudScore
from app.api.auth import get_current_user

router = APIRouter()


class TransactionCreate(BaseModel):
    merchant: str
    amount: float
    category: Optional[str] = "Other"
    description: Optional[str] = ""
    location: Optional[str] = ""


@router.post("/")
async def create_transaction(
    transaction: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new transaction and auto-analyze for fraud"""

    # Generate transaction ID
    transaction_id = f"TXN{datetime.now().strftime('%Y%m%d%H%M%S')}{random.randint(100, 999)}"

    db_transaction = Transaction(
        transaction_id=transaction_id,
        user_id=current_user.id,
        merchant=transaction.merchant,
        amount=transaction.amount,
        category=transaction.category or "Other",
        description=transaction.description or "",
        location=transaction.location or "",
        status="completed"
    )

    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)

    # Auto-analyze for fraud
    risk_score = _calculate_fraud_score(transaction.amount, transaction.merchant, transaction.location)
    risk_level = "low"
    if risk_score >= 90:
        risk_level = "critical"
    elif risk_score >= 70:
        risk_level = "high"
    elif risk_score >= 40:
        risk_level = "medium"

    reasons = []
    if transaction.amount > 50000:
        reasons.append("Large transaction amount")
    if transaction.amount > 100000:
        reasons.append("Very high value transaction - requires review")
    if any(kw in (transaction.merchant or "").lower() for kw in ["crypto", "unknown", "offshore"]):
        reasons.append("Potentially risky merchant")
    if risk_score < 30:
        reasons.append("Transaction appears normal")

    fraud = FraudScore(
        transaction_id=db_transaction.id,
        user_id=current_user.id,
        risk_score=risk_score,
        risk_level=risk_level,
        reasons=str(reasons),
        geo_risk=risk_score > 60,
        impossible_travel=risk_score > 80,
        behavioral_anomaly=risk_score > 50
    )
    db.add(fraud)
    db.commit()

    return {
        "id": db_transaction.id,
        "transaction_id": db_transaction.transaction_id,
        "merchant": db_transaction.merchant,
        "amount": db_transaction.amount,
        "category": db_transaction.category,
        "description": db_transaction.description,
        "location": db_transaction.location,
        "status": db_transaction.status,
        "timestamp": db_transaction.timestamp.isoformat(),
        "fraud_score": risk_score,
        "risk_level": risk_level
    }


@router.get("/")
async def get_transactions(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's transactions"""

    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)

    if category:
        query = query.filter(Transaction.category == category)

    transactions = query.order_by(Transaction.timestamp.desc()).offset(skip).limit(limit).all()

    result = []
    for t in transactions:
        fraud = db.query(FraudScore).filter(FraudScore.transaction_id == t.id).first()
        result.append({
            "id": t.id,
            "transaction_id": t.transaction_id,
            "merchant": t.merchant,
            "amount": t.amount,
            "category": t.category,
            "description": t.description,
            "location": t.location,
            "status": t.status,
            "timestamp": t.timestamp.isoformat(),
            "fraud_score": fraud.risk_score if fraud else 0,
            "risk_level": fraud.risk_level if fraud else "low"
        })

    return result


@router.get("/stats")
async def get_transaction_stats(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get transaction statistics"""

    start_date = datetime.utcnow() - timedelta(days=days)

    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.timestamp >= start_date
    ).all()

    if not transactions:
        return {
            "total_transactions": 0,
            "total_income": 0,
            "total_expenses": 0,
            "net_balance": 0,
            "avg_transaction": 0,
            "categories": {},
            "daily_spending": [],
            "monthly_trend": []
        }

    total_income = sum(t.amount for t in transactions if t.amount > 0)
    total_expenses = sum(abs(t.amount) for t in transactions if t.amount < 0)
    net_balance = total_income - total_expenses

    # Category breakdown
    categories = {}
    for t in transactions:
        cat = t.category or "Other"
        categories[cat] = categories.get(cat, 0) + abs(t.amount)

    # Daily spending for chart
    daily_spending = {}
    for t in transactions:
        day = t.timestamp.strftime("%Y-%m-%d")
        daily_spending[day] = daily_spending.get(day, 0) + abs(t.amount)

    daily_list = [{"date": k, "amount": round(v, 2)} for k, v in sorted(daily_spending.items())]

    return {
        "total_transactions": len(transactions),
        "total_income": round(total_income, 2),
        "total_expenses": round(total_expenses, 2),
        "net_balance": round(net_balance, 2),
        "avg_transaction": round(sum(abs(t.amount) for t in transactions) / len(transactions), 2),
        "categories": categories,
        "daily_spending": daily_list[-30:],  # Last 30 days
    }


@router.get("/categories")
async def get_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all transaction categories"""

    categories = db.query(Transaction.category).filter(
        Transaction.user_id == current_user.id,
        Transaction.category.isnot(None)
    ).distinct().all()

    return [c[0] for c in categories if c[0]]


@router.delete("/{transaction_id}")
async def delete_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a transaction"""
    
    transaction = db.query(Transaction).filter(
        Transaction.transaction_id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Delete associated fraud scores
    db.query(FraudScore).filter(
        FraudScore.transaction_id == transaction.id
    ).delete()
    
    db.delete(transaction)
    db.commit()
    
    return {"message": "Transaction deleted successfully"}


@router.get("/{transaction_id}")
async def get_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific transaction"""

    transaction = db.query(Transaction).filter(
        Transaction.transaction_id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()

    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    fraud = db.query(FraudScore).filter(FraudScore.transaction_id == transaction.id).first()

    return {
        "id": transaction.id,
        "transaction_id": transaction.transaction_id,
        "merchant": transaction.merchant,
        "amount": transaction.amount,
        "category": transaction.category,
        "description": transaction.description,
        "location": transaction.location,
        "status": transaction.status,
        "timestamp": transaction.timestamp.isoformat(),
        "fraud_score": fraud.risk_score if fraud else 0,
        "risk_level": fraud.risk_level if fraud else "low"
    }


def _calculate_fraud_score(amount: float, merchant: str, location: str) -> float:
    """Simple fraud scoring algorithm"""
    score = 0

    # Amount-based scoring
    if abs(amount) > 100000:
        score += 30
    elif abs(amount) > 50000:
        score += 20
    elif abs(amount) > 20000:
        score += 10

    # Round number check
    if abs(amount) % 1000 == 0 and abs(amount) >= 10000:
        score += 5

    # Merchant risk
    risky_merchants = ["crypto", "unknown", "offshore", "cash", "atm"]
    if any(kw in (merchant or "").lower() for kw in risky_merchants):
        score += 20

    # Location risk
    risky_locations = ["unknown", "foreign", "international", "offshore"]
    if any(kw in (location or "").lower() for kw in risky_locations):
        score += 15

    # Add some randomness for realism
    score += random.randint(0, 15)

    return min(score, 100)
