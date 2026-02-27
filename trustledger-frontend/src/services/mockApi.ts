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
      'hello': `Hello ${userName}! 👋 I'm your TRUSTLEDGER AI assistant, powered by advanced machine learning algorithms and the Pathway framework for real-time financial intelligence.

I'm here to help you navigate your financial journey with confidence and provide comprehensive insights across all aspects of your financial life.

🔹 **What I can help you with:**
• Real-time fraud detection and security alerts
• Personalized spending analysis and budgeting
• Investment recommendations and portfolio optimization
• Market insights and trading opportunities
• Compliance monitoring and regulatory guidance
• Loan eligibility and credit management
• Tax planning and optimization strategies

I analyze your financial data in real-time using advanced AI to provide you with actionable insights. Whether you're looking to save money, invest wisely, or protect your assets, I'm here to guide you every step of the way.

What would you like to explore today? Feel free to ask me anything about your finances!`,

      'hi': `Hi ${userName}! 😊 Welcome back to TRUSTLEDGER! I hope you're having a wonderful day.

I've been continuously monitoring your account and I'm pleased to report that everything looks excellent. Your recent transactions show healthy spending patterns, all security checks are passing, and your compliance status remains perfect.

🔹 **Quick Account Summary:**
• Account security: ✅ All systems secure
• Recent activity: ✅ Normal spending patterns detected
• Compliance status: ✅ Fully compliant (KYC: 92%, AML: 95%)
• Fraud monitoring: ✅ No suspicious activity detected

I'm here to help you make the most of your financial opportunities. Whether you want to analyze your spending, explore investment options, check market trends, or plan for future goals, I have all the tools and insights ready for you.

How can I help you manage your finances better today? I'm excited to assist you with any questions or financial planning needs you might have!`,

      'good morning': `Good morning ${userName}! ☀️ I hope you're starting your day feeling energized and ready to make some smart financial decisions!

Let me give you a comprehensive morning briefing to set you up for success today:

🔹 **Your Financial Dashboard:**
• Account Status: ✅ Secure with no suspicious activity overnight
• Available Balance: ₹1,25,000 (ready for your day's activities)
• Market Opening: NIFTY up 0.16% - looking bullish for the day
• Compliance: ✅ All regulatory requirements up to date
• Fraud Protection: ✅ AI monitoring active and protecting your assets

🔹 **Today's Market Highlights:**
• Banking sector showing strong momentum (+0.8%)
• Technology stocks gaining traction (+1.2%)
• Gold prices stable at ₹62,500/10g
• Rupee steady against the dollar

🔹 **Opportunities for Today:**
• Consider reviewing your monthly budget allocation
• Good time for SIP investments with market stability
• Check if any bills are due for payment
• Review your investment portfolio performance

Ready to make some smart financial moves today? I'm here to help you with investment advice, spending analysis, market insights, or any other financial guidance you need. What would you like to focus on first?`,

      'kyc': `Great question about KYC! 📋 Let me provide you with comprehensive information about Know Your Customer requirements and how they benefit you.

🔹 **What is KYC?**
KYC (Know Your Customer) is a crucial regulatory framework that helps financial institutions verify customer identities and assess potential risks. It's not just a compliance requirement - it's your first line of defense against financial fraud and identity theft.

🔹 **Why KYC Matters for You:**
• **Identity Protection**: Ensures only you can access your accounts
• **Fraud Prevention**: Blocks unauthorized users from using your identity
• **Regulatory Compliance**: Meets RBI and international banking standards
• **Enhanced Services**: Unlocks premium banking and investment features
• **Risk Assessment**: Helps us provide personalized financial products

🔹 **Your Current KYC Status:**
✅ **Status**: Fully Verified (92% compliance score - Excellent!)
✅ **Documents on File**: Aadhaar, PAN Card, Address Proof
✅ **Identity Verification**: Complete and up-to-date
✅ **Next Review Date**: June 15, 2025
✅ **Risk Level**: Low (excellent compliance history)

🔹 **KYC Benefits You Enjoy:**
• Higher transaction limits
• Faster processing times
• Access to premium investment products
• International transfer capabilities
• Priority customer service

Your KYC compliance is exemplary! This strong foundation allows you to access all our advanced financial services without any restrictions. Is there anything specific about KYC documentation or processes you'd like to know more about?`,

      'fraud': `Let me explain our cutting-edge fraud detection system! 🛡️ This is one of our most advanced features, powered by the Pathway framework for real-time analysis.

🔹 **Our AI-Powered Fraud Detection:**
Our system uses sophisticated machine learning algorithms that analyze every single transaction in real-time, providing you with military-grade protection against financial fraud.

**Real-Time Analysis Components:**
• **Transaction Pattern Recognition**: AI learns your spending habits and flags unusual activity
• **Geolocation Verification**: Detects impossible travel patterns (like transactions in different cities within minutes)
• **Merchant Risk Assessment**: Identifies high-risk merchant categories and suspicious vendors
• **Amount Analysis**: Flags transactions that deviate significantly from your normal spending
• **Time-based Monitoring**: Detects unusual transaction timing patterns

🔹 **Your Current Protection Level:**
✅ **Security Status**: Maximum Protection Enabled
✅ **Recent Risk Scores**: All transactions scored below 25 (Low Risk)
✅ **Fraud Alerts**: Real-time SMS and email notifications active
✅ **Account Monitoring**: 24/7 AI surveillance protecting your assets
✅ **Response Time**: Suspicious transactions blocked within milliseconds

🔹 **How Our System Protects You:**
• **Instant Scoring**: Every transaction gets a risk score (0-100) in under 0.3 seconds
• **Smart Blocking**: High-risk transactions automatically paused for verification
• **Learning Algorithm**: System gets smarter with every transaction you make
• **Multi-layer Security**: Combines AI, behavioral analysis, and rule-based detection

🔹 **Recent Protection Statistics:**
• Fraud attempts blocked this month: 0 (excellent!)
• Average risk score of your transactions: 12 (very low)
• False positive rate: <0.1% (highly accurate)
• System uptime: 99.99% (always protecting you)

Our fraud detection has prevented over 10,000 fraudulent transactions across our platform this month alone. You can feel completely secure knowing that advanced AI is watching over every rupee in your account 24/7!

Would you like me to show you how to customize your fraud alert preferences or explain any specific security features?`,

      'investment': `Let me provide you with comprehensive investment guidance tailored to your profile! 📈

🔹 **Personalized Investment Strategy:**
Based on your financial profile, age, and risk tolerance, here's a detailed investment roadmap designed to help you build substantial wealth over time.

**Recommended Portfolio Allocation:**
• **Equity (60% - ₹45,000/month)**: For long-term wealth creation
  - Large-cap funds: 25% (₹18,750) - Stability and consistent returns
  - Mid-cap funds: 20% (₹15,000) - Growth potential with moderate risk
  - Small-cap funds: 10% (₹7,500) - High growth potential
  - International funds: 5% (₹3,750) - Global diversification

• **Debt (30% - ₹22,500/month)**: For stability and regular income
  - Corporate bonds: 15% (₹11,250) - Higher yields than government securities
  - Government securities: 10% (₹7,500) - Maximum safety
  - Liquid funds: 5% (₹3,750) - Emergency fund parking

• **Alternative Investments (10% - ₹7,500/month)**: For inflation protection
  - Gold ETFs: 7% (₹5,250) - Hedge against inflation
  - REITs: 3% (₹2,250) - Real estate exposure without direct investment

🔹 **Expected Returns & Timeline:**
• **Short-term (1-3 years)**: 8-10% CAGR (focus on debt and liquid funds)
• **Medium-term (3-7 years)**: 10-12% CAGR (balanced approach)
• **Long-term (7+ years)**: 12-15% CAGR (equity-heavy strategy)

🔹 **Current Market Opportunities:**
• Banking sector showing strong fundamentals - consider increasing allocation
• Technology stocks at attractive valuations after recent correction
• ESG (Environmental, Social, Governance) funds gaining institutional support
• International markets offering good diversification opportunities

🔹 **Tax-Efficient Investment Strategy:**
• ELSS funds for Section 80C benefits (₹1.5 lakh annual limit)
• ULIP for combined insurance and investment
• PPF for long-term tax-free wealth creation
• NPS for additional ₹50,000 deduction under 80CCD(1B)

🔹 **Smart Investment Tips:**
• Start SIPs on 1st or 5th of every month for better averaging
• Increase SIP amount by 10% annually (step-up SIP)
• Review and rebalance portfolio every 6 months
• Don't panic during market volatility - stay invested for long-term goals

Would you like me to suggest specific mutual fund schemes, help you set up SIPs, or create a goal-based investment plan for your retirement, home purchase, or children's education?`,

      'spending': `Let me provide you with a detailed analysis of your spending patterns! 📊

🔹 **Comprehensive Spending Analysis (₹45,000 total this month):**

**Category-wise Breakdown:**

🛍️ **Shopping (40% - ₹18,000)**
• Online purchases: ₹12,000 (Amazon, Flipkart, fashion websites)
• Retail stores: ₹6,000 (clothing, electronics, home items)
• **Trend Analysis**: 12% increase from last month
• **AI Insight**: Slightly above your 6-month average of ₹15,500
• **Recommendation**: Consider setting a monthly shopping limit of ₹15,000

🍽️ **Food & Dining (25% - ₹11,250)**
• Restaurant dining: ₹7,250 (fine dining, casual restaurants, cafes)
• Groceries & essentials: ₹4,000 (supermarkets, local stores)
• **Trend Analysis**: Consistent with previous months
• **AI Insight**: Healthy balance between dining out and home cooking
• **Recommendation**: Excellent control - maintain current pattern

🚗 **Transportation (20% - ₹9,000)**
• Fuel expenses: ₹5,500 (petrol, diesel)
• Public transport: ₹2,000 (metro, bus, auto)
• Ride-sharing: ₹1,500 (Uber, Ola)
• **Trend Analysis**: 5% decrease from last month (great job!)
• **AI Insight**: Very efficient commuting pattern
• **Recommendation**: Consider carpooling to reduce fuel costs further

📱 **Others (15% - ₹6,750)**
• Utilities: ₹3,000 (electricity, water, internet, mobile)
• Entertainment: ₹2,250 (movies, subscriptions, events)
• Miscellaneous: ₹1,500 (medical, personal care, gifts)
• **Trend Analysis**: Well-controlled miscellaneous expenses
• **AI Insight**: Good balance between necessities and entertainment

🔹 **Financial Health Indicators:**
✅ **Spending vs Income**: You're spending 60% of income - Excellent!
✅ **Savings Rate**: 40% (₹30,000/month) - Outstanding performance!
✅ **Emergency Fund**: Adequately maintained
✅ **Debt-to-Income**: 0% - Perfect financial health

🔹 **AI-Powered Insights:**
• Your spending discipline is in the top 15% of users in your age group
• Shopping category needs attention - consider implementing a 48-hour rule for non-essential purchases
• Food expenses are optimal - you've found a great balance
• Transportation costs are very efficient compared to city averages

🔹 **Personalized Recommendations:**
• Set up automatic transfers of ₹5,000 to a separate "shopping fund" to control impulse purchases
• Consider bulk buying for groceries to save 10-15%
• Your entertainment budget is healthy - no changes needed
• Explore cashback credit cards for your regular spending categories

🔹 **Next Month's Budget Suggestion:**
• Shopping: ₹15,000 (reduce by ₹3,000)
• Food & Dining: ₹11,000 (maintain current level)
• Transportation: ₹9,000 (maintain - you're doing great)
• Others: ₹7,000 (slight increase for flexibility)
• **Total Budget**: ₹42,000 (save additional ₹3,000)

Would you like me to set up spending alerts, create a detailed budget plan, or help you optimize any specific spending category?`,

      'market': `Here's your comprehensive market analysis and investment outlook! 📈

🔹 **Live Market Dashboard (Real-time Data):**

**Indian Equity Markets:**
• **NIFTY 50**: 22,485 (+35.50, +0.16%) 📈 - Showing resilience near all-time highs
• **SENSEX**: 73,912 (+62.34, +0.08%) ➡️ - Consolidating at elevated levels
• **BANK NIFTY**: 47,157 (-43.25, -0.09%) 📉 - Profit booking after recent rally
• **NIFTY IT**: 35,240 (+125.80, +0.36%) 📈 - Benefiting from AI and cloud demand
• **NIFTY FMCG**: 52,180 (+89.20, +0.17%) 📈 - Defensive play gaining traction

🔹 **Sector Performance Analysis:**
🏦 **Banking & Financial Services (+0.8%)**
• Private banks outperforming PSU banks
• Credit growth remains robust at 16% YoY
• NIM expansion supporting profitability
• **Investment Outlook**: Positive - consider increasing allocation

💻 **Technology (+1.2%)**
• Strong Q3 earnings from major IT companies
• AI and digital transformation driving demand
• Rupee stability helping margins
• **Investment Outlook**: Very Positive - good entry points available

🏭 **Manufacturing (-0.3%)**
• Temporary consolidation after strong rally
• PLI schemes supporting long-term growth
• Capex cycle showing signs of revival
• **Investment Outlook**: Neutral to Positive - wait for better entry points

⚡ **Energy & Utilities (+0.1%)**
• Renewable energy stocks gaining momentum
• Traditional energy facing headwinds
• Government push for green energy
• **Investment Outlook**: Mixed - focus on renewable energy plays

🔹 **Global Market Context:**
🇺🇸 **US Markets**: Mixed performance with tech leading
• Fed policy stance supporting risk assets
• Inflation showing signs of moderation
• Dollar strength impacting emerging markets

🌏 **Asian Markets**: Cautiously optimistic
• China reopening theme supporting sentiment
• Japan maintaining accommodative policy
• Regional currencies stabilizing

🔹 **Key Economic Indicators:**
• **Crude Oil**: $82.5/barrel (stable, supporting OMCs)
• **Gold**: ₹62,500/10g (+0.2%, safe haven demand)
• **USD/INR**: 83.15 (range-bound, RBI intervention visible)
• **10-year G-Sec**: 7.18% (stable, supporting bond markets)

🔹 **Market Sentiment Analysis:**
📊 **Overall Sentiment**: Moderately Bullish (7/10)
💰 **FII Activity**: Net buying ₹850 crores (positive for markets)
🏠 **DII Activity**: Net buying ₹1,200 crores (strong domestic support)
📈 **Volatility Index (VIX)**: 14.2 (low volatility, good for investments)

🔹 **Investment Strategy for Current Market:**
✅ **Systematic Investment**: Excellent time for SIP investments
✅ **Quality Focus**: Stick to fundamentally strong companies
✅ **Diversification**: Maintain balanced portfolio across sectors
⚠️ **Risk Management**: Keep some cash for opportunities during corrections

🔹 **Upcoming Events to Watch:**
• RBI Monetary Policy (Thursday) - expect status quo on rates
• Q3 earnings season continues - focus on guidance and margins
• Union Budget 2024 preparations - infrastructure and rural focus expected
• Global inflation data releases - impact on FII flows

🔹 **Specific Recommendations:**
• **Banking**: HDFC Bank, ICICI Bank showing strong fundamentals
• **Technology**: Infosys, TCS benefiting from AI adoption
• **Consumer**: Nestle, HUL for defensive portfolio allocation
• **Infrastructure**: L&T, Ultratech for capex cycle play

The market is currently in a sweet spot with low volatility and steady institutional support. This is an ideal environment for systematic investments and building long-term wealth.

Would you like specific stock recommendations, sector allocation advice, or help setting up a systematic investment plan based on current market conditions?`,

      'help': `I'm here to provide comprehensive financial assistance! 🤝 Let me show you everything I can help you with.

🔹 **My Advanced AI Capabilities:**

**💰 Account & Transaction Management:**
• Real-time balance inquiries and transaction history analysis
• Spending pattern recognition and categorization
• Fraud detection and security monitoring
• Account settings optimization and security enhancement
• Statement analysis and financial health assessment

**📊 Financial Planning & Analysis:**
• Personalized budget creation based on your spending patterns
• Cash flow projections and financial goal planning
• Debt management strategies and EMI optimization
• Emergency fund planning and liquidity management
• Tax planning and investment optimization for maximum savings

**📈 Investment Advisory Services:**
• Portfolio analysis with risk assessment and rebalancing suggestions
• Mutual fund recommendations based on your risk profile and goals
• Market timing insights and systematic investment planning
• Goal-based investment strategies (retirement, home, education)
• Performance tracking and regular portfolio health checkups

**🛡️ Security & Compliance:**
• Real-time fraud monitoring and alert customization
• KYC and AML compliance status tracking
• Regulatory requirement updates and guidance
• Security feature management and optimization
• Privacy settings and data protection guidance

**🏦 Banking & Credit Services:**
• Loan eligibility assessment across all product categories
• Credit score monitoring with improvement recommendations
• Insurance needs analysis and product recommendations
• Credit card optimization and reward maximization strategies
• Banking product comparisons and switching guidance

**📱 Smart Features & Automation:**
• Voice command processing for hands-free banking
• Proactive financial alerts and personalized notifications
• Automated savings and investment recommendations
• Bill payment reminders and due date management
• Financial goal tracking with milestone celebrations

🔹 **How to Get Maximum Value from Our Conversations:**

**🎯 Be Specific**: Instead of "help with money," try "analyze my spending on food this month"
**📊 Request Analysis**: Ask for detailed breakdowns like "show me my investment performance"
**🔮 Plan Ahead**: Discuss goals like "help me save for a house in 5 years"
**❓ Ask Follow-ups**: I love detailed discussions about your financial strategies
**💡 Explore Options**: Ask "what if" scenarios for different financial decisions

🔹 **Popular Commands That Get Great Results:**
• "Analyze my spending patterns and suggest improvements"
• "Recommend investment options for my retirement planning"
• "Check my credit score and suggest ways to improve it"
• "Show me tax-saving investment opportunities"
• "Help me create a budget for next month"
• "Explain the current market trends and investment opportunities"
• "Review my insurance coverage and suggest improvements"

🔹 **What Makes Me Special:**
🧠 **Continuous Learning**: I adapt to your preferences and financial behavior
⚡ **Real-time Processing**: All analysis happens instantly using advanced AI
🔒 **Complete Privacy**: Your data is secure and never shared
🎯 **Personalized Advice**: Every recommendation is tailored specifically for you
📞 **24/7 Availability**: I'm here whenever you need financial guidance

🔹 **My Commitment to You:**
I'm not just a chatbot - I'm your dedicated financial advisor, security guard, investment analyst, and planning partner all rolled into one. My goal is to help you achieve financial freedom and peace of mind through intelligent, data-driven guidance.

Whether you're just starting your financial journey or you're an experienced investor, I'm here to provide insights that can help you make smarter decisions and build lasting wealth.

What aspect of your financial life would you like to explore today? I'm excited to help you take the next step toward your financial goals! 🎯✨`
    };
    
    const key = Object.keys(responses).find(k => query.toLowerCase().includes(k));
    return { answer: key ? responses[key] : `Hello ${userName}! 😊 I'm your intelligent financial assistant, ready to provide comprehensive guidance on all aspects of your financial life.

I can help you with detailed analysis and advice on:
• Account management and transaction monitoring
• Investment planning and portfolio optimization  
• Budget creation and spending analysis
• Loan eligibility and credit management
• Tax planning and compliance guidance
• Market analysis and trading insights
• Insurance and risk management
• Financial goal planning and wealth building

What specific financial topic would you like to explore in detail? I'm here to provide thorough, personalized assistance that helps you make informed financial decisions! 💼✨` };
  }
}