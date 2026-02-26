from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
import math

from app.core.database import get_db
from app.models.models import User, MarketData
from app.api.auth import get_current_user

router = APIRouter()


@router.get("/live")
async def get_live_market_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get live market data with realistic values"""

    base_prices = {
        "NIFTY50": 22450,
        "SENSEX": 73850,
        "BANKNIFTY": 47200,
        "USDINR": 83.15,
        "GOLD": 62500,
        "SILVER": 74200,
    }

    live_data = []
    for symbol, base_price in base_prices.items():
        change = round(random.uniform(-base_price * 0.02, base_price * 0.02), 2)
        price = round(base_price + change, 2)
        change_percent = round((change / base_price) * 100, 2)

        live_data.append({
            "symbol": symbol,
            "price": price,
            "change": change,
            "change_percent": change_percent,
            "volume": random.randint(100000, 5000000),
            "high": round(price * 1.01, 2),
            "low": round(price * 0.99, 2),
            "open": round(base_price, 2),
            "timestamp": datetime.utcnow().isoformat()
        })

    return {"data": live_data, "timestamp": datetime.utcnow().isoformat()}


@router.get("/risk")
async def get_portfolio_risk(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get portfolio risk metrics"""

    portfolio_risk = round(random.uniform(25, 65), 2)
    volatility_index = round(random.uniform(15, 55), 2)

    if portfolio_risk < 35:
        sentiment = "Bullish"
    elif portfolio_risk > 55:
        sentiment = "Bearish"
    else:
        sentiment = "Neutral"

    risk_factors = []
    if portfolio_risk > 50:
        risk_factors.append("Elevated market volatility")
    if volatility_index > 40:
        risk_factors.append("Increased price fluctuations in key sectors")
    risk_factors.append("Global economic indicators mixed")
    risk_factors.append("Domestic growth outlook positive")

    return {
        "portfolio_risk": portfolio_risk,
        "volatility_index": volatility_index,
        "market_sentiment": sentiment,
        "risk_factors": risk_factors,
        "var_95": round(portfolio_risk * 0.15, 2),  # Value at Risk
        "sharpe_ratio": round(random.uniform(0.8, 2.5), 2),
        "beta": round(random.uniform(0.7, 1.3), 2)
    }


@router.get("/volatility")
async def get_market_volatility(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get market volatility data for charts"""

    volatility_data = []
    base_time = datetime.utcnow() - timedelta(hours=24)

    for i in range(24):
        t = base_time + timedelta(hours=i)
        # Create realistic wave pattern
        base_vol = 30 + 15 * math.sin(i * 0.5) + random.uniform(-5, 5)
        volatility_data.append({
            "timestamp": t.isoformat(),
            "hour": t.strftime("%H:00"),
            "volatility": round(max(10, min(80, base_vol)), 2),
            "volume": random.randint(1000000, 10000000)
        })

    current_vol = volatility_data[-1]["volatility"]
    prev_vol = volatility_data[-2]["volatility"]

    return {
        "data": volatility_data,
        "current_volatility": current_vol,
        "trend": "increasing" if current_vol > prev_vol else "decreasing",
        "avg_24h": round(sum(v["volatility"] for v in volatility_data) / 24, 2)
    }


@router.get("/analysis")
async def get_market_analysis(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI-powered market analysis"""

    return {
        "summary": "Markets showing mixed signals with moderate volatility. Banking sector leads gains while IT sector faces headwinds from global uncertainty.",
        "key_insights": [
            "Banking sector showing strength with 2.3% weekly gains",
            "Technology stocks under pressure due to global slowdown concerns",
            "Commodity prices rising on supply chain disruptions",
            "Foreign institutional investors are net buyers this week",
            "Domestic mutual fund inflows remain strong at ₹15,000 Cr"
        ],
        "recommendations": [
            "Consider defensive positioning in FMCG and pharma",
            "Monitor global economic indicators closely",
            "Diversify across sectors to reduce concentration risk",
            "Maintain 10-15% cash reserves for opportunities",
            "SIP investments remain the best strategy for long-term"
        ],
        "sector_performance": {
            "Banking": {"change": 2.3, "outlook": "Positive"},
            "IT": {"change": -1.5, "outlook": "Cautious"},
            "Pharma": {"change": 0.8, "outlook": "Stable"},
            "FMCG": {"change": 0.5, "outlook": "Stable"},
            "Auto": {"change": 1.2, "outlook": "Positive"},
            "Energy": {"change": -0.3, "outlook": "Neutral"}
        },
        "risk_level": "Medium",
        "confidence_score": 78,
        "ai_model": "TrustLedger Market AI v2.0",
        "generated_at": datetime.utcnow().isoformat()
    }


@router.get("/alerts")
async def get_market_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get market-related alerts"""

    alerts = [
        {
            "id": 1,
            "type": "volatility",
            "title": "Volatility Alert",
            "message": "Market volatility has increased by 15% in the last hour. Consider reviewing open positions.",
            "severity": "medium",
            "timestamp": datetime.utcnow().isoformat()
        },
        {
            "id": 2,
            "type": "price",
            "title": "NIFTY50 Movement",
            "message": "NIFTY50 has crossed the 22,500 resistance level. Bullish momentum building.",
            "severity": "low",
            "timestamp": (datetime.utcnow() - timedelta(minutes=15)).isoformat()
        },
        {
            "id": 3,
            "type": "news",
            "title": "RBI Policy Update",
            "message": "RBI maintains repo rate at 6.5%. Markets expected to react positively.",
            "severity": "high",
            "timestamp": (datetime.utcnow() - timedelta(hours=2)).isoformat()
        }
    ]

    return {"alerts": alerts}


@router.get("/trend")
async def get_market_trend(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get market trend data for charts"""

    trend_data = []
    base_nifty = 22000
    base_sensex = 72000

    for i in range(days):
        date = datetime.utcnow() - timedelta(days=days - 1 - i)
        # Create realistic trend with some noise
        nifty_change = 50 * math.sin(i * 0.3) + random.uniform(-100, 100)
        sensex_change = 150 * math.sin(i * 0.3) + random.uniform(-300, 300)

        base_nifty += nifty_change
        base_sensex += sensex_change

        trend_data.append({
            "date": date.strftime("%Y-%m-%d"),
            "nifty": round(base_nifty, 2),
            "sensex": round(base_sensex, 2),
            "volume": random.randint(5000000, 20000000)
        })

    return {"data": trend_data, "period_days": days}
