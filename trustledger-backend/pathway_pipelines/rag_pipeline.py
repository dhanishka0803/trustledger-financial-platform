import pathway as pw
from typing import List, Dict, Any
import json
from datetime import datetime

@pw.transformer
class PathwayRAGProcessor:
    """Complete Pathway RAG implementation for financial documents"""
    
    def __init__(self):
        # Financial knowledge base
        self.knowledge_base = {
            "kyc": {
                "content": "KYC (Know Your Customer) requires: 1) Aadhaar card, 2) PAN card, 3) Address proof (utility bill/bank statement), 4) Recent photograph. Verification takes 24-48 hours. Documents must be clear and valid.",
                "keywords": ["kyc", "know your customer", "verification", "documents", "aadhaar", "pan"]
            },
            "aml": {
                "content": "AML (Anti-Money Laundering) compliance includes: 1) Transaction monitoring, 2) Suspicious activity reporting, 3) Customer due diligence, 4) Record keeping for 5 years. High-value transactions (>₹10 lakh) require additional verification.",
                "keywords": ["aml", "anti money laundering", "suspicious", "compliance", "monitoring"]
            },
            "fraud_detection": {
                "content": "Our fraud detection system uses ML models to analyze: 1) Transaction patterns, 2) Spending behavior, 3) Location anomalies, 4) Time-based risks. Risk scores range 0-100. Scores >70 trigger alerts.",
                "keywords": ["fraud", "detection", "risk", "score", "alert", "suspicious", "transaction"]
            },
            "market_analytics": {
                "content": "Market analytics provide real-time insights on: 1) Stock prices (NSE/BSE), 2) Forex rates, 3) Commodity prices, 4) Market trends. Data updated every 15 seconds during market hours.",
                "keywords": ["market", "analytics", "stock", "forex", "commodity", "price", "trend"]
            },
            "account_security": {
                "content": "Account security features: 1) Two-factor authentication, 2) Biometric login, 3) Transaction limits, 4) Device registration, 5) Real-time alerts. Change password every 90 days.",
                "keywords": ["security", "password", "2fa", "biometric", "login", "authentication"]
            },
            "transaction_limits": {
                "content": "Transaction limits: 1) Daily limit: ₹1 lakh, 2) Monthly limit: ₹10 lakh, 3) International: ₹25,000/day, 4) ATM withdrawal: ₹50,000/day. Limits can be increased with additional verification.",
                "keywords": ["limit", "transaction", "daily", "monthly", "withdrawal", "international"]
            },
            "customer_support": {
                "content": "Customer support available: 1) 24/7 helpline: 1800-123-4567, 2) Live chat, 3) Email: support@trustledger.com, 4) Branch visit. Response time: <2 hours for critical issues.",
                "keywords": ["support", "help", "contact", "helpline", "chat", "email", "branch"]
            }
        }
    
    @pw.method
    def search_documents(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Search relevant documents based on query"""
        query_lower = query.lower()
        query_words = query_lower.split()
        
        # Calculate relevance scores
        document_scores = []
        
        for doc_id, doc_data in self.knowledge_base.items():
            score = 0
            content_lower = doc_data["content"].lower()
            keywords = doc_data["keywords"]
            
            # Exact keyword matches (high weight)
            for keyword in keywords:
                if keyword in query_lower:
                    score += 10
            
            # Word overlap in content (medium weight)
            for word in query_words:
                if len(word) > 2 and word in content_lower:
                    score += 5
            
            # Partial matches (low weight)
            for word in query_words:
                for keyword in keywords:
                    if word in keyword or keyword in word:
                        score += 2
            
            if score > 0:
                document_scores.append({
                    "doc_id": doc_id,
                    "content": doc_data["content"],
                    "score": score,
                    "keywords": keywords
                })
        
        # Sort by relevance and return top_k
        document_scores.sort(key=lambda x: x["score"], reverse=True)
        return document_scores[:top_k]
    
    @pw.method
    def generate_answer(self, query: str, relevant_docs: List[Dict]) -> Dict[str, Any]:
        """Generate answer based on relevant documents"""
        
        if not relevant_docs:
            return {
                "answer": "I don't have specific information about that topic. Please contact our customer support at 1800-123-4567 for assistance.",
                "confidence": 0.1,
                "sources": [],
                "doc_count": 0
            }
        
        # Combine relevant content
        combined_content = []
        source_docs = []
        
        for doc in relevant_docs:
            combined_content.append(doc["content"])
            source_docs.append(doc["doc_id"])
        
        # Generate contextual answer
        context = " ".join(combined_content)
        
        # Simple answer generation based on query type
        query_lower = query.lower()
        
        if any(word in query_lower for word in ["how", "what", "explain"]):
            answer_prefix = "Based on our documentation: "
        elif any(word in query_lower for word in ["can i", "am i allowed", "is it possible"]):
            answer_prefix = "According to our policies: "
        elif any(word in query_lower for word in ["when", "how long", "time"]):
            answer_prefix = "Regarding timing: "
        else:
            answer_prefix = "Here's what I found: "
        
        # Extract most relevant sentence
        sentences = context.split(". ")
        best_sentence = sentences[0] if sentences else context
        
        # Find sentence most relevant to query
        for sentence in sentences:
            if any(word in sentence.lower() for word in query_lower.split()):
                best_sentence = sentence
                break
        
        answer = f"{answer_prefix}{best_sentence}"
        
        # Calculate confidence based on relevance scores
        max_score = max(doc["score"] for doc in relevant_docs)
        confidence = min(max_score / 20.0, 1.0)  # Normalize to 0-1
        
        return {
            "answer": answer,
            "confidence": round(confidence, 2),
            "sources": source_docs,
            "doc_count": len(relevant_docs),
            "full_context": context[:200] + "..." if len(context) > 200 else context
        }
    
    @pw.method
    def process_query(self, query: str) -> Dict[str, Any]:
        """Main RAG processing method"""
        
        # Search for relevant documents
        relevant_docs = self.search_documents(query, top_k=3)
        
        # Generate answer
        result = self.generate_answer(query, relevant_docs)
        
        # Add metadata
        result.update({
            "query": query,
            "timestamp": datetime.utcnow().isoformat(),
            "processing_time_ms": 50,  # Simulated processing time
            "model": "pathway_rag_v1"
        })
        
        return result
    
    @pw.method
    def batch_process_queries(self, queries: List[str]) -> List[Dict[str, Any]]:
        """Process multiple queries in batch"""
        results = []
        for query in queries:
            result = self.process_query(query)
            results.append(result)
        return results
    
    @pw.method
    def add_document(self, doc_id: str, content: str, keywords: List[str]) -> bool:
        """Add new document to knowledge base"""
        try:
            self.knowledge_base[doc_id] = {
                "content": content,
                "keywords": keywords
            }
            return True
        except Exception:
            return False
    
    @pw.method
    def get_available_topics(self) -> List[str]:
        """Get list of available topics"""
        return list(self.knowledge_base.keys())

# Create RAG pipeline
def create_rag_pipeline():
    """Create Pathway RAG pipeline for document processing"""
    
    # Create query stream
    query_stream = pw.Table.empty(
        query_id=pw.column(pw.string),
        user_id=pw.column(pw.int64),
        query_text=pw.column(pw.string),
        timestamp=pw.column(pw.datetime)
    )
    
    # Initialize RAG processor
    rag_processor = PathwayRAGProcessor()
    
    # Process queries through RAG
    rag_results = query_stream.select(
        query_id=pw.this.query_id,
        user_id=pw.this.user_id,
        query_text=pw.this.query_text,
        timestamp=pw.this.timestamp,
        rag_response=rag_processor.process_query(pw.this.query_text)
    )
    
    return rag_results

# Initialize RAG pipeline
rag_pipeline = create_rag_pipeline()

# Export for use in main application
__all__ = ['PathwayRAGProcessor', 'rag_pipeline']