from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, default="")
    phone = Column(String, default="")
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    account_frozen = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Accessibility settings
    large_text = Column(Boolean, default=False)
    high_contrast = Column(Boolean, default=False)
    voice_mode = Column(Boolean, default=False)
    simple_mode = Column(Boolean, default=False)

    transactions = relationship("Transaction", back_populates="user")
    fraud_scores = relationship("FraudScore", back_populates="user")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String, unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    merchant = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String, default="Other")
    description = Column(Text, default="")
    location = Column(String, default="")
    status = Column(String, default="completed")  # completed, pending, failed
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="transactions")
    fraud_score = relationship("FraudScore", back_populates="transaction", uselist=False)


class FraudScore(Base):
    __tablename__ = "fraud_scores"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    risk_score = Column(Float, nullable=False)  # 0-100
    risk_level = Column(String)  # low, medium, high, critical
    reasons = Column(Text, default="[]")  # JSON string of reasons
    geo_risk = Column(Boolean, default=False)
    impossible_travel = Column(Boolean, default=False)
    behavioral_anomaly = Column(Boolean, default=False)
    status = Column(String, default="open")  # open, investigating, resolved, dismissed
    created_at = Column(DateTime, default=datetime.utcnow)

    transaction = relationship("Transaction", back_populates="fraud_score")
    user = relationship("User", back_populates="fraud_scores")


class MarketData(Base):
    __tablename__ = "market_data"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    change = Column(Float, default=0)
    change_percent = Column(Float, default=0)
    volume = Column(Integer, default=0)
    volatility = Column(Float, default=0)
    risk_score = Column(Float, default=0)
    timestamp = Column(DateTime, default=datetime.utcnow)


class ComplianceCheck(Base):
    __tablename__ = "compliance_checks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    check_type = Column(String)  # AML, KYC, etc.
    status = Column(String)  # passed, failed, pending
    score = Column(Float)
    details = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.utcnow)


class SystemLog(Base):
    __tablename__ = "system_logs"

    id = Column(Integer, primary_key=True, index=True)
    level = Column(String)  # INFO, WARNING, ERROR, CRITICAL
    message = Column(Text, nullable=False)
    source = Column(String, default="system")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    extra_data = Column(Text, default="{}")  # renamed from metadata to avoid conflict
    timestamp = Column(DateTime, default=datetime.utcnow)


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    content = Column(Text, default="")
    document_type = Column(String, default="regulatory")  # regulatory, policy, etc.
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default="info")  # fraud, security, compliance, info
    severity = Column(String, default="low")  # low, medium, high, critical
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
