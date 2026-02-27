// Mock API service for Vercel deployment
export class MockAPIService {
  private static instance: MockAPIService;
  private mockUsers = [
    { id: 1, username: 'user', password: 'user123', full_name: 'Demo User', is_admin: false },
    { id: 2, username: 'admin', password: 'admin123', full_name: 'Admin User', is_admin: true }
  ];

  static getInstance(): MockAPIService {
    if (!MockAPIService.instance) {
      MockAPIService.instance = new MockAPIService();
    }
    return MockAPIService.instance;
  }

  async login(username: string, password: string) {
    const user = this.mockUsers.find(u => u.username === username && u.password === password);
    if (user) {
      return {
        access_token: 'mock-jwt-token',
        token_type: 'bearer',
        user: { id: user.id, username: user.username, full_name: user.full_name, is_admin: user.is_admin }
      };
    }
    throw new Error('Invalid credentials');
  }

  async getTransactions() {
    return [
      {
        id: 1,
        transaction_id: 'TXN001',
        merchant: 'Amazon India',
        amount: -2500,
        category: 'Shopping',
        description: 'Online purchase',
        location: 'Mumbai',
        status: 'completed',
        timestamp: new Date().toISOString(),
        fraud_score: { risk_score: 15, risk_level: 'low', reasons: [] }
      },
      {
        id: 2,
        transaction_id: 'TXN002',
        merchant: 'Crypto Exchange',
        amount: -50000,
        category: 'Investment',
        description: 'Cryptocurrency purchase',
        location: 'Unknown',
        status: 'flagged',
        timestamp: new Date().toISOString(),
        fraud_score: { risk_score: 85, risk_level: 'high', reasons: ['Large transaction: ₹50,000', 'High-risk merchant'] }
      }
    ];
  }

  async getMarketData() {
    return [
      { symbol: 'NIFTY50', price: 22485.50, change: 35.50, change_percent: 0.16, trend: 'bullish' },
      { symbol: 'SENSEX', price: 73912.34, change: 62.34, change_percent: 0.08, trend: 'neutral' },
      { symbol: 'BANKNIFTY', price: 47156.75, change: -43.25, change_percent: -0.09, trend: 'bearish' }
    ];
  }

  async askAI(query: string) {
    const userName = typeof window !== 'undefined' ? localStorage.getItem('userName') || 'there' : 'there';
    const responses: Record<string, string> = {
      'hello': `Hello ${userName}! I'm your TRUSTLEDGER AI assistant. How can I help you with your finances today?`,
      'hi': `Hi ${userName}! Welcome back to TRUSTLEDGER. What financial assistance do you need?`,
      'good morning': `Good morning ${userName}! Ready to manage your finances today?`,
      'good afternoon': `Good afternoon ${userName}! How can I assist with your financial needs?`,
      'good evening': `Good evening ${userName}! What financial insights can I provide?`,
      'kyc': 'KYC (Know Your Customer) is a mandatory process for financial institutions to verify customer identity and assess risk.',
      'aml': 'AML (Anti-Money Laundering) regulations help prevent financial crimes by monitoring suspicious transactions.',
      'fraud': 'Our AI system analyzes transaction patterns, amounts, merchants, and locations to detect potential fraud in real-time.',
      'transaction': 'Transactions are processed through our Pathway-powered fraud detection system with real-time risk scoring.',
      'account': 'Your account includes features like fraud protection, spending analytics, and compliance monitoring.',
      'balance': 'Your current account balance is ₹1,25,000 with recent transactions showing normal spending patterns.',
      'spending': 'Your spending analysis shows ₹45,000 this month across categories: Shopping (40%), Food (25%), Transport (20%), Others (15%).',
      'budget': 'Based on your spending patterns, I recommend setting a monthly budget of ₹50,000 with alerts at 80% usage.',
      'investment': 'Consider diversifying your portfolio with 60% equity, 30% debt, and 10% gold for balanced growth.',
      'loan': 'You are eligible for personal loans up to ₹5,00,000 at 12% interest rate based on your credit score.',
      'credit': 'Your credit score is 750 (Excellent). Keep maintaining timely payments to improve it further.',
      'insurance': 'I recommend health insurance of ₹10 lakhs and term life insurance of ₹1 crore based on your profile.',
      'tax': 'You can save up to ₹1.5 lakhs under Section 80C through ELSS, PPF, or life insurance premiums.',
      'market': 'Current market trends show NIFTY at 22,485 (+0.16%), SENSEX at 73,912 (+0.08%). Markets are moderately bullish.',
      'risk': 'Your portfolio risk is moderate with a diversification score of 7.5/10. Consider adding international funds.',
      'goal': 'For your retirement goal of ₹2 crores in 25 years, invest ₹15,000 monthly in equity mutual funds.',
      'emergency': 'Maintain an emergency fund of ₹3-6 months expenses (₹1.5-3 lakhs) in liquid funds or savings account.',
      'compliance': 'Your account is fully compliant with KYC (92% score) and AML (95% score) regulations.',
      'security': 'Your account has multi-factor authentication, transaction alerts, and real-time fraud monitoring enabled.',
      'help': 'I can assist with: Account queries, Transaction analysis, Investment advice, Loan eligibility, Tax planning, Market updates, Fraud alerts, and Compliance checks.'
    };
    
    const key = Object.keys(responses).find(k => query.toLowerCase().includes(k));
    return { answer: key ? responses[key] : `Hello ${userName}! I can help with account management, transactions, investments, loans, insurance, tax planning, market analysis, and security. What would you like to know?` };
  }
}