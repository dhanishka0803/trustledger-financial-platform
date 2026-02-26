import pathway as pw
import pandas as pd
import numpy as np
from datetime import datetime
import json
from typing import Dict, Any

@pw.transformer
class PathwayFraudDetection:
    """Complete Pathway-based fraud detection pipeline"""
    
    def __init__(self):
        self.risk_threshold = 70
        self.transaction_history = {}
        
    @pw.method
    def detect_fraud(self, transaction_data: Dict) -> Dict[str, Any]:
        """Main fraud detection method using Pathway"""
        
        risk_score = 0
        reasons = []
        
        # Amount-based risk analysis
        amount = abs(transaction_data.get("amount", 0))
        if amount > 100000:
            risk_score += 30
            reasons.append(f"Very large amount: ₹{amount:,.0f}")
        elif amount > 50000:
            risk_score += 20
            reasons.append(f"Large amount: ₹{amount:,.0f}")
        
        # Merchant risk analysis
        merchant = transaction_data.get("merchant", "").lower()
        risky_keywords = ["unknown", "crypto", "gambling", "offshore", "cash"]
        if any(keyword in merchant for keyword in risky_keywords):
            risk_score += 25
            reasons.append("High-risk merchant category")
        
        # Location risk analysis
        location = transaction_data.get("location", "").lower()
        if "unknown" in location or "foreign" in location:
            risk_score += 20
            reasons.append("Suspicious location")
        
        # Time-based analysis
        timestamp = transaction_data.get("timestamp", datetime.utcnow())
        if isinstance(timestamp, str):
            timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        
        hour = timestamp.hour
        if hour < 6 or hour > 22:
            risk_score += 15
            reasons.append(f"Unusual time: {hour:02d}:00")
        
        # Cap at 100
        risk_score = min(risk_score, 100)
        
        # Determine risk level
        if risk_score >= 90:
            level = "critical"
        elif risk_score >= 70:
            level = "high"
        elif risk_score >= 40:
            level = "medium"
        else:
            level = "low"
        
        return {
            "risk_score": risk_score,
            "risk_level": level,
            "reasons": reasons,
            "geo_risk": "unknown" in location or "foreign" in location,
            "impossible_travel": risk_score > 80,
            "behavioral_anomaly": risk_score > 50,
            "timestamp": timestamp.isoformat()
        }
    
    @pw.method
    def batch_analyze(self, transactions: list) -> list:
        """Batch analysis for multiple transactions"""
        results = []
        for txn in transactions:
            result = self.detect_fraud(txn)
            results.append(result)
        return results

@pw.transformer
class PathwayMarketAnalytics:
    """Pathway-based market analytics"""
    
    @pw.method
    def analyze_market_data(self, symbol: str, price: float, volume: int = 0) -> Dict[str, Any]:
        """Analyze market data using Pathway"""
        
        # Base prices for comparison
        base_prices = {
            "NIFTY50": 22450,
            "SENSEX": 73850,
            "BANKNIFTY": 47200,
            "USDINR": 83.15,
            "GOLD": 62500,
            "SILVER": 75000,
            "CRUDE": 6500
        }
        
        base_price = base_prices.get(symbol, price)
        change = price - base_price
        change_percent = (change / base_price) * 100 if base_price > 0 else 0
        
        # Determine trend
        if change_percent > 1:
            trend = "strongly_bullish"
        elif change_percent > 0.2:
            trend = "bullish"
        elif change_percent < -1:
            trend = "strongly_bearish"
        elif change_percent < -0.2:
            trend = "bearish"
        else:
            trend = "neutral"
        
        # Calculate volatility
        volatility = abs(change_percent) * 1.5
        
        # Generate recommendation
        if change_percent < -2:
            recommendation = "strong_buy"
        elif change_percent < -0.5:
            recommendation = "buy"
        elif change_percent > 2:
            recommendation = "strong_sell"
        elif change_percent > 0.5:
            recommendation = "sell"
        else:
            recommendation = "hold"
        
        return {
            "symbol": symbol,
            "current_price": price,
            "base_price": base_price,
            "change": round(change, 2),
            "change_percent": round(change_percent, 2),
            "trend": trend,
            "volatility": round(volatility, 2),
            "recommendation": recommendation,
            "volume": volume,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    @pw.method
    def portfolio_risk_analysis(self, holdings: list) -> Dict[str, Any]:
        """Analyze portfolio risk"""
        total_value = sum(h.get("value", 0) for h in holdings)
        high_risk_value = sum(h.get("value", 0) for h in holdings if h.get("risk_level") == "high")
        
        risk_percentage = (high_risk_value / total_value * 100) if total_value > 0 else 0
        
        if risk_percentage > 60:
            overall_risk = "high"
        elif risk_percentage > 30:
            overall_risk = "medium"
        else:
            overall_risk = "low"
        
        return {
            "total_portfolio_value": total_value,
            "high_risk_exposure": high_risk_value,
            "risk_percentage": round(risk_percentage, 2),
            "overall_risk": overall_risk,
            "diversification_score": min(len(holdings) * 10, 100),
            "recommendation": "rebalance" if risk_percentage > 50 else "maintain"
        }

# Create streaming pipeline
def create_fraud_pipeline():
    """Create Pathway fraud detection pipeline"""
    
    # Create empty table for streaming transactions
    transaction_stream = pw.Table.empty(
        transaction_id=pw.column(pw.string),
        user_id=pw.column(pw.int64),
        amount=pw.column(pw.float64),
        merchant=pw.column(pw.string),
        location=pw.column(pw.string),
        timestamp=pw.column(pw.datetime)
    )
    
    # Initialize fraud detector
    fraud_detector = PathwayFraudDetection()
    
    # Apply fraud detection to stream
    fraud_results = transaction_stream.select(
        transaction_id=pw.this.transaction_id,
        user_id=pw.this.user_id,
        amount=pw.this.amount,
        merchant=pw.this.merchant,
        location=pw.this.location,
        timestamp=pw.this.timestamp,
        fraud_analysis=fraud_detector.detect_fraud({
            "amount": pw.this.amount,
            "merchant": pw.this.merchant,
            "location": pw.this.location,
            "timestamp": pw.this.timestamp
        })
    )
    
    return fraud_results

def create_market_pipeline():
    """Create Pathway market analytics pipeline"""
    
    # Create market data stream
    market_stream = pw.Table.empty(
        symbol=pw.column(pw.string),
        price=pw.column(pw.float64),
        volume=pw.column(pw.int64),
        timestamp=pw.column(pw.datetime)
    )
    
    # Initialize market analyzer
    market_analyzer = PathwayMarketAnalytics()
    
    # Apply market analysis
    market_results = market_stream.select(
        symbol=pw.this.symbol,
        price=pw.this.price,
        volume=pw.this.volume,
        timestamp=pw.this.timestamp,
        analysis=market_analyzer.analyze_market_data(
            pw.this.symbol,
            pw.this.price,
            pw.this.volume
        )
    )
    
    return market_results

# Initialize pipelines
fraud_pipeline = create_fraud_pipeline()
market_pipeline = create_market_pipeline()

# Export for use in main application
__all__ = ['PathwayFraudDetection', 'PathwayMarketAnalytics', 'fraud_pipeline', 'market_pipeline']