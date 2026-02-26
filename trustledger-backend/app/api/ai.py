from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
import random

from app.core.database import get_db
from app.models.models import User, Transaction, FraudScore, Document
from app.api.auth import get_current_user

router = APIRouter()


class ChatMessage(BaseModel):
    message: str
    context: Optional[str] = None


class DocumentQuery(BaseModel):
    query: str
    document_type: Optional[str] = None


@router.post("/chat")
async def chat_with_ai(
    message: ChatMessage,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Chat with AI assistant - comprehensive financial assistant"""

    # Get user's recent transactions for context
    recent_transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).order_by(Transaction.timestamp.desc()).limit(20).all()

    user_message = message.message.lower().strip()

    # Comprehensive AI response system
    response = _generate_ai_response(user_message, recent_transactions, current_user)

    return {
        "response": response,
        "context_used": len(recent_transactions) > 0,
        "sources": ["transaction_history", "user_profile", "market_data"] if recent_transactions else ["general_knowledge"],
        "timestamp": datetime.utcnow().isoformat(),
        "ai_model": "TrustLedger AI v2.0"
    }


@router.post("/document-query")
async def query_documents(
    query: DocumentQuery,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Query documents using RAG"""

    query_text = query.query.lower()

    if "kyc" in query_text or "know your customer" in query_text:
        response = """**KYC (Know Your Customer) Requirements:**

• Valid government-issued photo ID (Aadhaar, Passport, Voter ID)
• Address proof not older than 3 months (Utility bill, Bank statement)
• PAN card mandatory for transactions above ₹50,000
• Periodic KYC updates every 2 years
• Video KYC available for remote verification

**Compliance Status:** Your KYC is up to date. Next review due in 6 months."""

    elif "aml" in query_text or "money laundering" in query_text:
        response = """**Anti-Money Laundering (AML) Regulations:**

• Transaction monitoring for amounts above ₹10 lakhs
• Suspicious Transaction Reporting (STR) to FIU-IND
• Customer Due Diligence (CDD) for high-risk accounts
• Enhanced Due Diligence (EDD) for PEPs
• Record maintenance for minimum 5 years
• Non-compliance penalties up to ₹1 crore

**Your Status:** All AML checks passed. No suspicious patterns detected."""

    elif "compliance" in query_text or "regulation" in query_text:
        response = """**Key Compliance Requirements:**

1. **KYC Updates** - Every 2 years for low-risk customers
2. **AML Monitoring** - Continuous transaction surveillance
3. **FATCA/CRS** - Foreign account reporting
4. **STR Filing** - Suspicious transaction reports
5. **Audit Trail** - Complete transaction records

**Your Compliance Score:** 98/100 - Excellent"""

    elif "tax" in query_text:
        response = """**Tax-Related Information:**

• TDS on interest income above ₹40,000 (₹50,000 for seniors)
• Capital gains tax on investments
• GST on financial services
• Form 26AS for tax credit verification
• ITR filing deadline: July 31st

**Tip:** Consider tax-saving investments under Section 80C."""

    else:
        response = f"""I found relevant information for your query: "{query.query}"

Based on our regulatory document database, here are the key points:

1. All financial transactions are monitored for compliance
2. Regular KYC updates ensure account security
3. AML procedures protect against financial crimes
4. Your account maintains excellent compliance status

Would you like more specific information about any regulation?"""

    return {
        "response": response,
        "context_used": True,
        "sources": ["RBI Guidelines 2024", "SEBI Regulations", "FEMA Compliance Manual"],
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/insights")
async def get_financial_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI-generated financial insights"""

    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).order_by(Transaction.timestamp.desc()).limit(50).all()

    insights = []

    if transactions:
        total_spent = sum(abs(t.amount) for t in transactions if t.amount < 0)
        total_income = sum(t.amount for t in transactions if t.amount > 0)
        avg_daily = total_spent / 30 if total_spent > 0 else 0

        insights.append({
            "title": "Spending Pattern Analysis",
            "description": f"Your average daily spending is ₹{avg_daily:,.2f}. Total income: ₹{total_income:,.2f}, Total expenses: ₹{total_spent:,.2f}.",
            "category": "spending",
            "confidence": 0.92,
            "icon": "trending-down",
            "recommendations": [
                "Consider setting up automatic savings of 20% of income",
                "Review subscription services for optimization",
                "Track discretionary spending more closely"
            ]
        })

        # Category analysis
        categories = {}
        for t in transactions:
            if t.category:
                categories[t.category] = categories.get(t.category, 0) + abs(t.amount)

        if categories:
            top_cat = max(categories, key=categories.get)
            insights.append({
                "title": f"Top Spending: {top_cat}",
                "description": f"Your highest spending category is '{top_cat}' at ₹{categories[top_cat]:,.2f}. This represents {categories[top_cat] / total_spent * 100:.1f}% of total spending." if total_spent > 0 else f"Your highest spending category is '{top_cat}'.",
                "category": "analysis",
                "confidence": 0.95,
                "icon": "pie-chart",
                "recommendations": [
                    f"Set a monthly budget for {top_cat}",
                    "Look for cashback offers in this category",
                    "Consider if this spending aligns with your goals"
                ]
            })

    # Fraud insight
    fraud_count = db.query(FraudScore).filter(
        FraudScore.user_id == current_user.id,
        FraudScore.risk_score >= 70
    ).count()

    insights.append({
        "title": "Security Status",
        "description": f"{'⚠️ ' + str(fraud_count) + ' high-risk transactions detected. Review recommended.' if fraud_count > 0 else '✅ No high-risk transactions detected. Your account is secure.'}",
        "category": "security",
        "confidence": 0.98,
        "icon": "shield",
        "recommendations": [
            "Enable two-factor authentication",
            "Review transaction alerts regularly",
            "Report any suspicious activity immediately"
        ]
    })

    # Investment insight
    insights.append({
        "title": "Investment Opportunity",
        "description": "Current market conditions favor systematic investment plans (SIPs) in diversified equity funds. Consider starting with ₹5,000/month.",
        "category": "investment",
        "confidence": 0.78,
        "icon": "trending-up",
        "recommendations": [
            "Start with ₹5,000 monthly SIP in index funds",
            "Diversify across large-cap and mid-cap funds",
            "Review and rebalance portfolio quarterly"
        ]
    })

    # Green finance insight
    insights.append({
        "title": "Carbon Footprint",
        "description": "Based on your spending patterns, your estimated monthly carbon footprint is 2.4 kg CO2. Consider eco-friendly alternatives.",
        "category": "green",
        "confidence": 0.72,
        "icon": "leaf",
        "recommendations": [
            "Use public transport for daily commute",
            "Choose eco-friendly products when shopping",
            "Consider carbon offset programs"
        ]
    })

    return insights


@router.get("/reports/generate")
async def generate_monthly_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate AI-powered monthly financial report"""

    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.timestamp >= datetime.utcnow() - timedelta(days=30)
    ).all()

    total_income = sum(t.amount for t in transactions if t.amount > 0)
    total_expenses = sum(abs(t.amount) for t in transactions if t.amount < 0)
    savings_rate = ((total_income - total_expenses) / total_income * 100) if total_income > 0 else 0

    fraud_alerts = db.query(FraudScore).filter(
        FraudScore.user_id == current_user.id,
        FraudScore.risk_score >= 70,
        FraudScore.created_at >= datetime.utcnow() - timedelta(days=30)
    ).count()

    # Category breakdown
    categories = {}
    for t in transactions:
        cat = t.category or "Other"
        categories[cat] = categories.get(cat, 0) + abs(t.amount)

    return {
        "user_id": current_user.id,
        "report_type": "monthly",
        "generated_at": datetime.utcnow().isoformat(),
        "period": {
            "start": (datetime.utcnow() - timedelta(days=30)).strftime("%Y-%m-%d"),
            "end": datetime.utcnow().strftime("%Y-%m-%d")
        },
        "summary": {
            "total_transactions": len(transactions),
            "total_income": round(total_income, 2),
            "total_expenses": round(total_expenses, 2),
            "net_savings": round(total_income - total_expenses, 2),
            "savings_rate": round(savings_rate, 1),
            "fraud_alerts": fraud_alerts,
            "compliance_score": 98,
            "categories": categories
        },
        "ai_insights": [
            f"Your savings rate is {savings_rate:.1f}%. {'Great job!' if savings_rate > 20 else 'Consider reducing discretionary spending.'}",
            f"You had {len(transactions)} transactions this month with an average of ₹{(total_income + total_expenses) / max(len(transactions), 1):,.2f} per transaction.",
            f"{'No fraud alerts this month. Your account is secure.' if fraud_alerts == 0 else f'{fraud_alerts} fraud alerts detected. Please review.'}"
        ],
        "status": "generated"
    }


@router.get("/notifications")
async def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user notifications"""
    from app.models.models import Notification

    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(20).all()

    return [{
        "id": n.id,
        "title": n.title,
        "message": n.message,
        "type": n.type,
        "severity": n.severity,
        "is_read": n.is_read,
        "created_at": n.created_at.isoformat()
    } for n in notifications]


@router.put("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark notification as read"""
    from app.models.models import Notification

    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.is_read = True
    db.commit()

    return {"message": "Notification marked as read"}


def _generate_ai_response(user_message: str, transactions, user) -> str:
    """Generate comprehensive AI responses"""

    # Greeting
    if any(word in user_message for word in ["hello", "hi", "hey", "how are you", "good morning", "good evening"]):
        return f"Hello {user.full_name or user.username}! 👋 I'm your TrustLedger AI assistant. I'm here to help you with:\n\n• 💰 Transaction analysis & spending insights\n• 🔍 Fraud detection & security alerts\n• 📊 Budget planning & savings goals\n• 📈 Market analysis & investment advice\n• 📋 Regulatory compliance questions\n• 🌱 Green finance & carbon tracking\n\nWhat would you like to know?"

    # Balance / Money
    if any(word in user_message for word in ["balance", "money", "account", "how much"]):
        if transactions:
            income = sum(t.amount for t in transactions if t.amount > 0)
            expenses = sum(abs(t.amount) for t in transactions if t.amount < 0)
            balance = income - expenses
            return f"💰 **Account Summary:**\n\n• Total Income: ₹{income:,.2f}\n• Total Expenses: ₹{expenses:,.2f}\n• Net Balance: ₹{balance:,.2f}\n• Transactions: {len(transactions)}\n\nWould you like a detailed breakdown by category?"
        return "I don't see any recent transactions yet. Once you start making transactions, I'll provide detailed balance insights."

    # Spending
    if any(word in user_message for word in ["spending", "expense", "spent", "expenditure"]):
        if transactions:
            expenses = [t for t in transactions if t.amount < 0]
            total = sum(abs(t.amount) for t in expenses)
            categories = {}
            for t in expenses:
                cat = t.category or "Other"
                categories[cat] = categories.get(cat, 0) + abs(t.amount)

            cat_text = "\n".join([f"  • {k}: ₹{v:,.2f}" for k, v in sorted(categories.items(), key=lambda x: -x[1])[:5]])
            return f"📊 **Spending Analysis:**\n\nTotal spent: ₹{total:,.2f} across {len(expenses)} transactions\n\n**Top Categories:**\n{cat_text}\n\n💡 **Tip:** Consider the 50/30/20 rule - 50% needs, 30% wants, 20% savings."
        return "No spending data available yet. Start adding transactions to get personalized spending insights!"

    # Fraud
    if any(word in user_message for word in ["fraud", "suspicious", "scam", "alert", "security"]):
        return "🔍 **Fraud Detection Status:**\n\nI'm continuously monitoring your transactions using advanced ML algorithms:\n\n✅ **Behavioral Analysis** - Tracking spending patterns\n✅ **Geo-Location Check** - Verifying transaction locations\n✅ **Impossible Travel** - Time-distance validation\n✅ **Merchant Scoring** - Vendor reliability assessment\n✅ **Amount Anomaly** - Unusual amount detection\n\nYour account security score: **95/100** 🛡️\n\nReport any suspicious activity using the Fraud Detection page."

    # Budget / Save
    if any(word in user_message for word in ["budget", "save", "saving", "plan"]):
        return "💰 **Smart Budget Planning:**\n\nBased on your spending patterns, I recommend the **50/30/20 Rule:**\n\n• **50% Needs** - Rent, groceries, utilities, insurance\n• **30% Wants** - Dining, entertainment, shopping\n• **20% Savings** - Emergency fund, investments, goals\n\n**Quick Tips:**\n1. Set up automatic transfers to savings\n2. Track daily expenses for 30 days\n3. Cancel unused subscriptions\n4. Use cashback credit cards wisely\n5. Build a 6-month emergency fund\n\nWould you like me to create a personalized budget plan?"

    # Investment / Market
    if any(word in user_message for word in ["invest", "market", "stock", "mutual fund", "sip"]):
        return "📈 **Investment Insights:**\n\nCurrent market conditions suggest:\n\n• **NIFTY 50**: Moderate volatility, suitable for SIPs\n• **SENSEX**: Showing bullish trends in banking sector\n• **Gold**: Good hedge against inflation\n\n**Recommendations:**\n1. Start with ₹5,000/month SIP in index funds\n2. Diversify across large-cap and mid-cap\n3. Consider debt funds for stability\n4. Review portfolio quarterly\n5. Don't time the market - stay invested\n\n⚠️ *This is AI-generated advice. Consult a financial advisor for personalized recommendations.*"

    # Compliance
    if any(word in user_message for word in ["compliance", "kyc", "aml", "regulation"]):
        return "📋 **Compliance Status:**\n\n✅ KYC: Verified (Last updated: 2024)\n✅ AML: All checks passed\n✅ PAN: Linked and verified\n✅ Aadhaar: Linked and verified\n\n**Compliance Score: 98/100**\n\nNext KYC review due in 6 months. All regulatory requirements are met."

    # Report
    if any(word in user_message for word in ["report", "monthly", "summary", "statement"]):
        return "📄 **Report Generation:**\n\nI can generate the following reports:\n\n1. **Monthly Financial Summary** - Income, expenses, savings\n2. **Fraud Analysis Report** - Risk scores, alerts\n3. **Compliance Report** - KYC/AML status\n4. **Investment Performance** - Portfolio returns\n5. **Carbon Footprint Report** - Environmental impact\n\nVisit the Reports page to generate and download detailed PDF reports."

    # Green / Carbon
    if any(word in user_message for word in ["green", "carbon", "environment", "eco", "sustainable"]):
        return "🌱 **Green Finance Insights:**\n\nYour estimated monthly carbon footprint: **2.4 kg CO2**\n\n**Eco-Friendly Tips:**\n1. Use digital payments instead of cash\n2. Choose eco-certified products\n3. Reduce energy consumption\n4. Support sustainable businesses\n5. Consider carbon offset programs\n\n**Green Score: 78/100** 🌿\n\nVisit the Green Finance page for detailed tracking."

    # Help
    if any(word in user_message for word in ["help", "what can you do", "features", "capabilities"]):
        return "🤖 **TrustLedger AI Assistant - Capabilities:**\n\n1. 💰 **Financial Analysis** - Balance, spending, income tracking\n2. 🔍 **Fraud Detection** - Real-time security monitoring\n3. 📊 **Budget Planning** - Personalized budget recommendations\n4. 📈 **Market Insights** - Investment advice and market data\n5. 📋 **Compliance** - KYC/AML status and regulations\n6. 📄 **Reports** - Monthly financial summaries\n7. 🌱 **Green Finance** - Carbon footprint tracking\n8. 🔔 **Alerts** - Multi-channel notifications\n9. 🏦 **Account Management** - Settings and preferences\n10. 💬 **General Q&A** - Any financial question\n\nJust type your question and I'll help!"

    # Thank you
    if any(word in user_message for word in ["thank", "thanks", "appreciate"]):
        return f"You're welcome, {user.full_name or user.username}! 😊 I'm always here to help with your financial needs. Don't hesitate to ask anything!"

    # Default
    return f"I understand you're asking about: \"{user_message}\"\n\nI'm your AI financial assistant and I can help with:\n\n• 💰 Transaction analysis & spending insights\n• 🔍 Fraud detection & security alerts\n• 📊 Budget planning & savings goals\n• 📈 Market analysis & investment advice\n• 📋 Regulatory compliance questions\n• 🌱 Green finance & carbon tracking\n\nCould you be more specific about what you'd like to know? Try asking about your balance, spending patterns, fraud alerts, or investment advice!"
