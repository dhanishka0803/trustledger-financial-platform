import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any
from sqlalchemy.orm import Session
import json
import random

from app.models.models import Transaction, User, FraudScore


class FraudEngine:
    def __init__(self):
        self.risk_thresholds = {
            "low": 30,
            "medium": 60,
            "high": 80,
            "critical": 90
        }

    def analyze_transaction(self, user_id: int, transaction_data: Dict[str, Any], db: Session) -> Dict[str, Any]:
        """Main fraud analysis function"""

        risk_score = 0
        reasons = []
        geo_risk = False
        impossible_travel = False
        behavioral_anomaly = False

        # 1. Amount-based analysis
        amount_risk, amount_reasons = self._analyze_amount(user_id, transaction_data["amount"], db)
        risk_score += amount_risk
        reasons.extend(amount_reasons)

        # 2. Time-based analysis
        time_risk, time_reasons = self._analyze_time_pattern(user_id, transaction_data.get("timestamp", datetime.utcnow()), db)
        risk_score += time_risk
        reasons.extend(time_reasons)

        # 3. Location-based analysis
        if transaction_data.get("location"):
            location_risk, location_reasons, geo_flag, travel_flag = self._analyze_location(
                user_id, transaction_data["location"], transaction_data.get("timestamp", datetime.utcnow()), db
            )
            risk_score += location_risk
            reasons.extend(location_reasons)
            geo_risk = geo_flag
            impossible_travel = travel_flag

        # 4. Merchant analysis
        merchant_risk, merchant_reasons = self._analyze_merchant(
            user_id, transaction_data["merchant"], db
        )
        risk_score += merchant_risk
        reasons.extend(merchant_reasons)

        # Cap risk score at 100
        risk_score = min(risk_score, 100)

        # Determine risk level
        risk_level = self._get_risk_level(risk_score)

        return {
            "risk_score": round(risk_score, 2),
            "risk_level": risk_level,
            "reasons": reasons,
            "geo_risk": geo_risk,
            "impossible_travel": impossible_travel,
            "behavioral_anomaly": behavioral_anomaly
        }

    def _analyze_amount(self, user_id: int, amount: float, db: Session) -> tuple:
        """Analyze transaction amount for anomalies"""
        risk_score = 0
        reasons = []

        recent_transactions = db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.timestamp >= datetime.utcnow() - timedelta(days=30)
        ).all()

        if not recent_transactions:
            return 10, ["New user - limited transaction history"]

        amounts = [abs(t.amount) for t in recent_transactions]
        avg_amount = np.mean(amounts)
        std_amount = np.std(amounts) if len(amounts) > 1 else avg_amount * 0.5

        if abs(amount) > avg_amount + 3 * std_amount:
            risk_score += 25
            reasons.append(f"Amount significantly higher than usual (₹{abs(amount):,.2f} vs avg ₹{avg_amount:,.2f})")

        if abs(amount) % 1000 == 0 and abs(amount) >= 10000:
            risk_score += 10
            reasons.append("Large round number transaction")

        if abs(amount) >= 100000:
            risk_score += 20
            reasons.append("Very large transaction amount")

        return risk_score, reasons

    def _analyze_time_pattern(self, user_id: int, timestamp: datetime, db: Session) -> tuple:
        """Analyze transaction timing patterns"""
        risk_score = 0
        reasons = []

        hour = timestamp.hour

        if hour >= 23 or hour <= 5:
            risk_score += 15
            reasons.append(f"Transaction at unusual hour ({hour:02d}:00)")

        recent_count = db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.timestamp >= timestamp - timedelta(minutes=10)
        ).count()

        if recent_count >= 3:
            risk_score += 20
            reasons.append("Multiple transactions in short time period")

        return risk_score, reasons

    def _analyze_location(self, user_id: int, location: str, timestamp: datetime, db: Session) -> tuple:
        """Analyze transaction location"""
        risk_score = 0
        reasons = []
        geo_risk = False
        impossible_travel = False

        recent_transactions = db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.location.isnot(None),
            Transaction.location != "",
            Transaction.timestamp >= timestamp - timedelta(hours=24)
        ).order_by(Transaction.timestamp.desc()).limit(5).all()

        if not recent_transactions:
            return 5, ["New location - no recent location history"], False, False

        last_transaction = recent_transactions[0]
        time_diff = abs((timestamp - last_transaction.timestamp).total_seconds()) / 3600

        if location != last_transaction.location and time_diff < 2:
            risk_score += 30
            reasons.append("Impossible travel detected - different locations too quickly")
            impossible_travel = True
            geo_risk = True

        suspicious_keywords = ["unknown", "foreign", "international", "offshore"]
        if any(keyword in location.lower() for keyword in suspicious_keywords):
            risk_score += 25
            reasons.append("Transaction from suspicious location")
            geo_risk = True

        return risk_score, reasons, geo_risk, impossible_travel

    def _analyze_merchant(self, user_id: int, merchant: str, db: Session) -> tuple:
        """Analyze merchant patterns"""
        risk_score = 0
        reasons = []

        suspicious_keywords = ["unknown", "cash", "atm", "transfer", "crypto"]
        if any(keyword in merchant.lower() for keyword in suspicious_keywords):
            risk_score += 15
            reasons.append("Transaction with potentially risky merchant type")

        previous = db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.merchant == merchant
        ).count()

        if previous == 0:
            risk_score += 10
            reasons.append("First transaction with this merchant")

        return risk_score, reasons

    def _get_risk_level(self, risk_score: float) -> str:
        if risk_score >= self.risk_thresholds["critical"]:
            return "critical"
        elif risk_score >= self.risk_thresholds["high"]:
            return "high"
        elif risk_score >= self.risk_thresholds["medium"]:
            return "medium"
        else:
            return "low"
