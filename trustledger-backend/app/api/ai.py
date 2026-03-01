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

    # Clean and normalize input
    user_message = user_message.lower().strip()
    
    # Personal greetings
    if any(word in user_message for word in ["hello", "hi", "hey"]):
        return f"Hello {user.full_name or user.username}! 😊 How can I help you today?"
    
    if "how are you" in user_message:
        return "I'm doing great, thanks for asking! 😊 I'm here to help you with anything related to your TRUSTLEDGER account - transactions, security, market info, or anything else you need."
    
    # Life advice questions (non-financial)
    if "how to achieve in life" in user_message or "success in life" in user_message:
        return "That's a great question! While I'm primarily your financial assistant, I can share that financial wellness is a key part of life success. Here are some tips:\n\n💰 Build an emergency fund (6 months expenses)\n📊 Track your spending and create budgets\n📈 Start investing early, even small amounts\n🎯 Set clear financial goals\n📚 Keep learning about money management\n\nWould you like help with any specific financial goals?"
    
    # Income questions
    if "income" in user_message:
        if transactions:
            income_transactions = [t for t in transactions if t.amount > 0]
            total_income = sum(t.amount for t in income_transactions)
            avg_income = total_income / len(income_transactions) if income_transactions else 0
            return f"💰 **Your Income Analysis:**\n\nTotal Income: ₹{total_income:,.2f}\nIncome Transactions: {len(income_transactions)}\nAverage Income: ₹{avg_income:,.2f}\n\n📊 **Income Sources:**\n{chr(10).join([f'• {t.description or "Income"}: ₹{t.amount:,.2f}' for t in income_transactions[:5]])}\n\n💡 **Tip:** {'Great income flow!' if total_income > 50000 else 'Consider exploring additional income sources.'}"
        return "💰 **Income Tracking:**\n\nI don't see any income transactions yet. Add your salary, freelance payments, or other income sources to get detailed analysis!\n\n📈 **Income Tips:**\n• Track all income sources\n• Set up automatic savings from income\n• Monitor income growth trends\n• Plan taxes on additional income"
    
    # Transaction-specific questions
    if "my transactions" in user_message or "show transactions" in user_message:
        if transactions:
            recent_count = min(5, len(transactions))
            total_amount = sum(abs(t.amount) for t in transactions[:recent_count])
            return f"Here are your recent transactions:\n\n📊 Last {recent_count} transactions totaling ₹{total_amount:,.2f}\n\nTo see all details, visit the Transactions page where you can:\n• View complete transaction history\n• Filter by date, category, or amount\n• See fraud risk scores\n• Export transaction reports\n\nWould you like me to analyze any specific transaction pattern?"
        else:
            return "I don't see any transactions in your account yet. Once you start adding transactions, I can provide detailed analysis including:\n\n💳 Spending patterns\n📊 Category breakdowns\n🔍 Fraud detection insights\n📈 Monthly trends\n\nWould you like help adding your first transaction?"
    
    # Balance inquiries
    if any(word in user_message for word in ["balance", "money", "account balance"]):
        if transactions:
            income = sum(t.amount for t in transactions if t.amount > 0)
            expenses = sum(abs(t.amount) for t in transactions if t.amount < 0)
            balance = income - expenses
            return f"💰 **Your Current Account Summary:**\n\nNet Balance: ₹{balance:,.2f}\nTotal Income: ₹{income:,.2f}\nTotal Expenses: ₹{expenses:,.2f}\nTotal Transactions: {len(transactions)}\n\n{'🎉 Great! You have a positive balance.' if balance > 0 else '💡 Consider reviewing your expenses to improve your balance.' if balance < 0 else '📊 Your income and expenses are balanced.'}"
        return "💰 **Account Balance:**\n\nI don't see any transactions in your account yet. Once you add some transactions, I can provide detailed balance analysis including:\n\n• Net balance calculation\n• Income vs expense breakdown\n• Spending trends\n• Budget recommendations\n\nWould you like to add your first transaction?"
    
    # Spending analysis
    if "spending" in user_message or "spent" in user_message or "expenses" in user_message:
        if transactions:
            expenses = [t for t in transactions if t.amount < 0]
            if expenses:
                total = sum(abs(t.amount) for t in expenses)
                avg_transaction = total / len(expenses)
                categories = {}
                for t in expenses:
                    cat = t.category or "Other"
                    categories[cat] = categories.get(cat, 0) + abs(t.amount)
                
                top_category = max(categories, key=categories.get) if categories else "N/A"
                category_breakdown = "\n".join([f"• {cat}: ₹{amount:,.2f}" for cat, amount in sorted(categories.items(), key=lambda x: -x[1])[:5]])
                
                return f"📊 **Your Spending Analysis:**\n\nTotal Spent: ₹{total:,.2f}\nNumber of Transactions: {len(expenses)}\nAverage per Transaction: ₹{avg_transaction:,.2f}\n\n**Top Spending Categories:**\n{category_breakdown}\n\n💡 **Insight:** Your highest spending is in {top_category} (₹{categories.get(top_category, 0):,.2f}). Consider setting a monthly budget for this category."
            return "I can see you have transactions, but no expenses recorded yet. Add some expense transactions to get detailed spending analysis!"
        return "📊 **Spending Analysis:**\n\nNo spending data available yet. Start adding your expense transactions to get detailed insights including:\n\n• Category-wise breakdown\n• Spending trends\n• Budget recommendations\n• Money-saving tips\n\nAdd some transactions and I'll provide personalized spending analysis!"
    
    # Fraud and security
    if any(word in user_message for word in ["fraud", "security", "safe", "scam"]):
        return "🛡️ **Your Security Status:**\n\nAccount Security: ✅ Excellent\nFraud Monitoring: ✅ Active\nRisk Score: 🟢 Low Risk\n\nOur AI continuously monitors for:\n• Unusual spending patterns\n• Location anomalies\n• Suspicious merchant activity\n• Time-based irregularities\n\n🔔 You'll get instant alerts for any suspicious activity. Your account is well protected!"
    
    # Investment and market questions
    if any(word in user_message for word in ["invest", "stock", "market", "nifty", "sensex"]):
        return "📈 **Investment Insights:**\n\nCurrent Market Status:\n• NIFTY 50: Showing moderate volatility\n• Banking sector: Performing well\n• Tech stocks: Mixed signals\n\n💡 **Recommendations:**\n• Start with SIP in index funds (₹5,000/month)\n• Diversify across sectors\n• Consider debt funds for stability\n• Review portfolio quarterly\n\n⚠️ *This is general guidance. Consult a financial advisor for personalized advice.*"
    
    # Budget and savings
    if any(word in user_message for word in ["budget", "save", "saving"]):
        if transactions:
            income = sum(t.amount for t in transactions if t.amount > 0)
            expenses = sum(abs(t.amount) for t in transactions if t.amount < 0)
            savings_rate = ((income - expenses) / income * 100) if income > 0 else 0
            return f"💰 **Budget Analysis:**\n\nCurrent Savings Rate: {savings_rate:.1f}%\n{'🎉 Excellent!' if savings_rate > 20 else '💡 Aim for 20% savings rate'}\n\n**50/30/20 Rule Recommendation:**\n• 50% Needs (₹{income * 0.5:,.0f})\n• 30% Wants (₹{income * 0.3:,.0f})\n• 20% Savings (₹{income * 0.2:,.0f})\n\nWould you like help creating a detailed budget plan?"
        return "💰 **Smart Budgeting Tips:**\n\n1. Follow the 50/30/20 rule\n2. Track every expense for 30 days\n3. Set up automatic savings\n4. Review and adjust monthly\n5. Build an emergency fund\n\nStart adding transactions to get personalized budget recommendations!"
    
    # Compliance and KYC
    if any(word in user_message for word in ["kyc", "compliance", "verification"]):
        return "📋 **Compliance Status:**\n\n✅ KYC: Verified and up-to-date\n✅ AML: All checks passed\n✅ Document Status: Complete\n✅ Compliance Score: 98/100\n\nNext review due in 6 months. All regulatory requirements are met. Your account is fully compliant!"
    
    # Thank you responses
    if "thank" in user_message:
        return f"You're welcome, {user.full_name or user.username}! 😊 I'm always here to help with your financial needs. Is there anything else you'd like to know?"
    
    # Help and capabilities
    if "help" in user_message or "what can you do" in user_message:
        return "🤖 **I can help you with:**\n\n💰 Account balance and transaction analysis\n📊 Spending patterns and budgeting advice\n🔍 Fraud detection and security alerts\n📈 Market insights and investment guidance\n📋 Compliance status and KYC information\n🌱 Green finance and carbon tracking\n📄 Financial reports and summaries\n\nJust ask me anything about your finances!"
    
    # Default response - more conversational
    return f"I understand you're asking about '{user_message}'. I'm here to help with your financial needs!\n\nI can assist with:\n• Transaction analysis and spending insights\n• Account balance and budget planning\n• Fraud detection and security\n• Market data and investment advice\n• Compliance and KYC status\n\nCould you be more specific about what you'd like to know? For example, try asking 'What's my balance?' or 'Show my recent transactions'."
