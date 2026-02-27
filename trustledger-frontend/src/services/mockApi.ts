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
    const responses: Record<string, string> = {
      'kyc': 'KYC (Know Your Customer) is a mandatory process for financial institutions to verify customer identity and assess risk.',
      'aml': 'AML (Anti-Money Laundering) regulations help prevent financial crimes by monitoring suspicious transactions.',
      'fraud': 'Our AI system analyzes transaction patterns, amounts, merchants, and locations to detect potential fraud in real-time.'
    };
    
    const key = Object.keys(responses).find(k => query.toLowerCase().includes(k));
    return { answer: key ? responses[key] : 'I can help with KYC, AML, fraud detection, and compliance questions.' };
  }
}