from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.models import User, Transaction, FraudScore, SystemLog, Notification
from app.api.auth import get_current_user

router = APIRouter()


def verify_admin(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.get("/stats")
async def get_admin_stats(
    admin_user: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Get admin dashboard statistics"""

    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_transactions = db.query(Transaction).count()
    fraud_cases = db.query(FraudScore).filter(FraudScore.risk_score >= 70).count()
    total_fraud_analyzed = db.query(FraudScore).count()

    # Recent activity
    today = datetime.utcnow().date()
    today_transactions = db.query(Transaction).filter(
        Transaction.timestamp >= datetime(today.year, today.month, today.day)
    ).count()

    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_transactions": total_transactions,
        "today_transactions": today_transactions,
        "fraud_cases": fraud_cases,
        "total_fraud_analyzed": total_fraud_analyzed,
        "system_health": "healthy",
        "uptime": "99.9%",
        "api_response_time": "45ms"
    }


@router.get("/fraud-cases")
async def get_fraud_cases(
    status: str = None,
    admin_user: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Get all fraud cases for admin review"""

    query = db.query(FraudScore).filter(FraudScore.risk_score >= 50)

    if status:
        query = query.filter(FraudScore.status == status)

    fraud_scores = query.order_by(FraudScore.created_at.desc()).limit(100).all()

    cases = []
    for score in fraud_scores:
        user = db.query(User).filter(User.id == score.user_id).first()
        transaction = db.query(Transaction).filter(Transaction.id == score.transaction_id).first()

        cases.append({
            "id": score.id,
            "user_id": score.user_id,
            "username": user.username if user else "Unknown",
            "user_email": user.email if user else "Unknown",
            "transaction_id": transaction.transaction_id if transaction else "Unknown",
            "merchant": transaction.merchant if transaction else "Unknown",
            "amount": transaction.amount if transaction else 0,
            "risk_score": score.risk_score,
            "risk_level": score.risk_level,
            "status": score.status,
            "geo_risk": score.geo_risk,
            "impossible_travel": score.impossible_travel,
            "created_at": score.created_at.isoformat()
        })

    return cases


@router.put("/fraud-cases/{case_id}/status")
async def update_fraud_case_status(
    case_id: int,
    status: str = "investigating",
    notes: str = None,
    admin_user: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Update fraud case status"""

    fraud_score = db.query(FraudScore).filter(FraudScore.id == case_id).first()

    if not fraud_score:
        raise HTTPException(status_code=404, detail="Fraud case not found")

    fraud_score.status = status

    # Log the action
    log_entry = SystemLog(
        level="INFO",
        message=f"Fraud case {case_id} status updated to '{status}' by admin {admin_user.username}",
        source="admin_panel",
        user_id=admin_user.id,
        extra_data=f'{{"case_id": {case_id}, "status": "{status}", "notes": "{notes or ""}"}}'
    )
    db.add(log_entry)

    # Notify the user
    notification = Notification(
        user_id=fraud_score.user_id,
        title=f"Fraud Case Update",
        message=f"Your fraud case #{case_id} has been updated to: {status}",
        type="fraud",
        severity="medium"
    )
    db.add(notification)

    db.commit()

    return {"message": f"Fraud case {case_id} status updated to '{status}'"}


@router.get("/users")
async def get_users(
    skip: int = 0,
    limit: int = 100,
    admin_user: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Get all users for admin management"""

    users = db.query(User).offset(skip).limit(limit).all()

    return [{
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "phone": user.phone,
        "is_active": user.is_active,
        "is_admin": user.is_admin,
        "account_frozen": user.account_frozen,
        "transaction_count": db.query(Transaction).filter(Transaction.user_id == user.id).count(),
        "fraud_alerts": db.query(FraudScore).filter(FraudScore.user_id == user.id, FraudScore.risk_score >= 70).count(),
        "created_at": user.created_at.isoformat()
    } for user in users]


@router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: int,
    is_active: bool = True,
    admin_user: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Update user active status"""

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = is_active
    db.commit()

    log_entry = SystemLog(
        level="INFO",
        message=f"User {user_id} ({user.username}) status updated to {'active' if is_active else 'inactive'} by admin {admin_user.username}",
        source="admin_panel",
        user_id=admin_user.id
    )
    db.add(log_entry)
    db.commit()

    return {"message": f"User {user.username} status updated to {'active' if is_active else 'inactive'}"}


@router.get("/logs")
async def get_system_logs(
    level: str = None,
    limit: int = 100,
    admin_user: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Get system logs"""

    query = db.query(SystemLog)

    if level:
        query = query.filter(SystemLog.level == level.upper())

    logs = query.order_by(SystemLog.timestamp.desc()).limit(limit).all()

    return [{
        "id": log.id,
        "level": log.level,
        "message": log.message,
        "source": log.source or "system",
        "user_id": log.user_id,
        "timestamp": log.timestamp.isoformat()
    } for log in logs]


@router.get("/analytics")
async def get_analytics(
    days: int = 30,
    admin_user: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Get system analytics"""

    start_date = datetime.utcnow() - timedelta(days=days)

    transactions = db.query(Transaction).filter(
        Transaction.timestamp >= start_date
    ).all()

    fraud_cases = db.query(FraudScore).filter(
        FraudScore.created_at >= start_date,
        FraudScore.risk_score >= 70
    ).all()

    new_users = db.query(User).filter(
        User.created_at >= start_date
    ).count()

    # Daily transaction trend
    daily_data = {}
    for t in transactions:
        day = t.timestamp.strftime("%Y-%m-%d")
        if day not in daily_data:
            daily_data[day] = {"count": 0, "amount": 0}
        daily_data[day]["count"] += 1
        daily_data[day]["amount"] += abs(t.amount)

    daily_trend = [{"date": k, **v} for k, v in sorted(daily_data.items())]

    return {
        "period_days": days,
        "transactions": {
            "total": len(transactions),
            "total_amount": round(sum(abs(t.amount) for t in transactions), 2),
            "avg_amount": round(sum(abs(t.amount) for t in transactions) / len(transactions), 2) if transactions else 0,
            "daily_trend": daily_trend[-30:]
        },
        "fraud": {
            "total_cases": len(fraud_cases),
            "avg_risk_score": round(sum(f.risk_score for f in fraud_cases) / len(fraud_cases), 2) if fraud_cases else 0,
            "fraud_rate": round(len(fraud_cases) / len(transactions) * 100, 2) if transactions else 0
        },
        "users": {
            "new_registrations": new_users,
            "total_active": db.query(User).filter(User.is_active == True).count()
        }
    }


@router.post("/alerts/broadcast")
async def broadcast_alert(
    title: str = "System Alert",
    message: str = "Important system notification",
    severity: str = "info",
    admin_user: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Broadcast alert to all users"""

    users = db.query(User).filter(User.is_active == True).all()

    for user in users:
        notification = Notification(
            user_id=user.id,
            title=title,
            message=message,
            type="system",
            severity=severity
        )
        db.add(notification)

    log_entry = SystemLog(
        level="INFO",
        message=f"Admin broadcast: {title} - {message} (to {len(users)} users)",
        source="admin_broadcast",
        user_id=admin_user.id
    )
    db.add(log_entry)
    db.commit()

    return {"message": f"Alert broadcasted to {len(users)} users"}
