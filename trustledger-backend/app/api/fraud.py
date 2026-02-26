from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
import json
import random

from app.core.database import get_db
from app.models.models import User, Transaction, FraudScore, Notification
from app.api.auth import get_current_user

router = APIRouter()


class FraudAnalysisRequest(BaseModel):
    transaction_id: Optional[str] = None
    merchant: Optional[str] = ""
    amount: Optional[float] = 0
    location: Optional[str] = ""
    category: Optional[str] = ""


@router.post("/analyze")
async def analyze_transaction(
    request: FraudAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze a transaction for fraud risk"""

    # If transaction_id provided, look it up
    if request.transaction_id:
        transaction = db.query(Transaction).filter(
            Transaction.transaction_id == request.transaction_id
        ).first()
        if transaction:
            fraud = db.query(FraudScore).filter(
                FraudScore.transaction_id == transaction.id
            ).first()
            if fraud:
                return {
                    "transaction_id": request.transaction_id,
                    "risk_score": fraud.risk_score,
                    "risk_level": fraud.risk_level,
                    "reasons": _parse_reasons(fraud.reasons),
                    "geo_risk": fraud.geo_risk,
                    "impossible_travel": fraud.impossible_travel,
                    "behavioral_anomaly": fraud.behavioral_anomaly,
                    "timestamp": fraud.created_at.isoformat()
                }

    # Run fresh analysis
    risk_score = _calculate_risk(request.amount, request.merchant, request.location)
    risk_level = _get_risk_level(risk_score)
    reasons = _generate_reasons(request.amount, request.merchant, request.location, risk_score)

    return {
        "transaction_id": request.transaction_id or "LIVE_ANALYSIS",
        "risk_score": risk_score,
        "risk_level": risk_level,
        "reasons": reasons,
        "geo_risk": risk_score > 60,
        "impossible_travel": risk_score > 80,
        "behavioral_anomaly": risk_score > 50,
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/alerts")
async def get_fraud_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get fraud alerts for the current user"""

    fraud_scores = db.query(FraudScore).filter(
        FraudScore.user_id == current_user.id,
        FraudScore.risk_score >= 40
    ).order_by(FraudScore.created_at.desc()).limit(20).all()

    alerts = []
    for score in fraud_scores:
        transaction = db.query(Transaction).filter(
            Transaction.id == score.transaction_id
        ).first()

        alerts.append({
            "id": score.id,
            "transaction_id": transaction.transaction_id if transaction else "Unknown",
            "merchant": transaction.merchant if transaction else "Unknown",
            "amount": transaction.amount if transaction else 0,
            "risk_score": score.risk_score,
            "risk_level": score.risk_level,
            "reasons": _parse_reasons(score.reasons),
            "geo_risk": score.geo_risk,
            "impossible_travel": score.impossible_travel,
            "behavioral_anomaly": score.behavioral_anomaly,
            "status": score.status,
            "timestamp": score.created_at.isoformat()
        })

    return alerts


@router.get("/cases")
async def get_fraud_cases(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get high-risk fraud cases"""

    fraud_scores = db.query(FraudScore).filter(
        FraudScore.user_id == current_user.id,
        FraudScore.risk_score >= 70
    ).order_by(FraudScore.created_at.desc()).all()

    cases = []
    for score in fraud_scores:
        transaction = db.query(Transaction).filter(
            Transaction.id == score.transaction_id
        ).first()

        cases.append({
            "id": score.id,
            "transaction_id": transaction.transaction_id if transaction else "Unknown",
            "merchant": transaction.merchant if transaction else "Unknown",
            "amount": transaction.amount if transaction else 0,
            "risk_score": score.risk_score,
            "risk_level": score.risk_level,
            "reasons": _parse_reasons(score.reasons),
            "status": score.status,
            "created_at": score.created_at.isoformat()
        })

    return cases


@router.post("/report")
async def report_fraud(
    request: FraudAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Report a transaction as fraudulent"""

    if not request.transaction_id:
        raise HTTPException(status_code=400, detail="Transaction ID required")

    transaction = db.query(Transaction).filter(
        Transaction.transaction_id == request.transaction_id,
        Transaction.user_id == current_user.id
    ).first()

    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Update or create fraud score
    fraud_score = db.query(FraudScore).filter(
        FraudScore.transaction_id == transaction.id
    ).first()

    if fraud_score:
        fraud_score.risk_score = 100
        fraud_score.risk_level = "critical"
        fraud_score.status = "reported"
        reasons = _parse_reasons(fraud_score.reasons)
        reasons.append("User reported as fraud")
        fraud_score.reasons = str(reasons)
    else:
        fraud_score = FraudScore(
            transaction_id=transaction.id,
            user_id=current_user.id,
            risk_score=100,
            risk_level="critical",
            reasons=str(["User reported as fraud"]),
            status="reported"
        )
        db.add(fraud_score)

    # Create notification
    notification = Notification(
        user_id=current_user.id,
        title="Fraud Report Submitted",
        message=f"Your fraud report for transaction {request.transaction_id} has been submitted and is under review.",
        type="fraud",
        severity="high"
    )
    db.add(notification)
    db.commit()

    return {"message": "Fraud report submitted successfully", "status": "reported"}


@router.get("/stats")
async def get_fraud_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get fraud statistics"""

    total_transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).count()

    all_fraud = db.query(FraudScore).filter(
        FraudScore.user_id == current_user.id
    ).all()

    high_risk = [f for f in all_fraud if f.risk_score >= 70]
    medium_risk = [f for f in all_fraud if 40 <= f.risk_score < 70]
    low_risk = [f for f in all_fraud if f.risk_score < 40]

    avg_score = sum(f.risk_score for f in all_fraud) / len(all_fraud) if all_fraud else 0

    # Fraud trend data (last 7 days)
    trend_data = []
    for i in range(7):
        date = datetime.utcnow() - timedelta(days=6 - i)
        day_fraud = [f for f in all_fraud if f.created_at.date() == date.date()]
        trend_data.append({
            "date": date.strftime("%Y-%m-%d"),
            "count": len(day_fraud),
            "avg_score": sum(f.risk_score for f in day_fraud) / len(day_fraud) if day_fraud else 0
        })

    # Fraud types breakdown
    fraud_types = {
        "Geo Risk": len([f for f in all_fraud if f.geo_risk]),
        "Impossible Travel": len([f for f in all_fraud if f.impossible_travel]),
        "Behavioral Anomaly": len([f for f in all_fraud if f.behavioral_anomaly]),
        "High Amount": len([f for f in all_fraud if f.risk_score >= 70]),
    }

    return {
        "total_transactions": total_transactions,
        "total_analyzed": len(all_fraud),
        "high_risk_count": len(high_risk),
        "medium_risk_count": len(medium_risk),
        "low_risk_count": len(low_risk),
        "average_risk_score": round(avg_score, 2),
        "fraud_rate": round(len(high_risk) / total_transactions * 100, 2) if total_transactions > 0 else 0,
        "trend_data": trend_data,
        "fraud_types": fraud_types
    }


def _calculate_risk(amount: float, merchant: str, location: str) -> float:
    score = random.randint(5, 25)
    if abs(amount) > 100000:
        score += 30
    elif abs(amount) > 50000:
        score += 20
    elif abs(amount) > 20000:
        score += 10

    risky = ["crypto", "unknown", "offshore", "cash"]
    if any(kw in (merchant or "").lower() for kw in risky):
        score += 20
    if any(kw in (location or "").lower() for kw in ["unknown", "foreign"]):
        score += 15

    return min(score, 100)


def _get_risk_level(score: float) -> str:
    if score >= 90:
        return "critical"
    elif score >= 70:
        return "high"
    elif score >= 40:
        return "medium"
    return "low"


def _generate_reasons(amount, merchant, location, score):
    reasons = []
    if abs(amount) > 50000:
        reasons.append(f"Large transaction amount: ₹{abs(amount):,.2f}")
    if any(kw in (merchant or "").lower() for kw in ["crypto", "unknown"]):
        reasons.append("Potentially risky merchant type")
    if any(kw in (location or "").lower() for kw in ["unknown", "foreign"]):
        reasons.append("Transaction from suspicious location")
    if score > 70:
        reasons.append("AI model flagged as high risk")
    if score < 30:
        reasons.append("Transaction appears normal")
    if not reasons:
        reasons.append("Moderate risk - monitoring recommended")
    return reasons


def _parse_reasons(reasons_str):
    try:
        if isinstance(reasons_str, list):
            return reasons_str
        return eval(reasons_str) if reasons_str else []
    except Exception:
        return [reasons_str] if reasons_str else []
