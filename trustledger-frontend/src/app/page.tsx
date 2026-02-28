'use client'

import { Button } from '@/components/ui/button'
import { Shield, Eye, Volume2, Users, Leaf, Star, CheckCircle, ArrowRight, Globe, Lock, Zap } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100">
      {/* Enhanced Header */}
      <header className="bg-white shadow-lg border-b border-teal-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  TRUSTLEDGER
                </h1>
                <p className="text-sm text-gray-600 font-medium">Pathway-Powered Financial Intelligence</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-teal-600 font-medium transition-colors">Features</a>
              <a href="#accessibility" className="text-gray-600 hover:text-teal-600 font-medium transition-colors">Accessibility</a>
              <a href="#security" className="text-gray-600 hover:text-teal-600 font-medium transition-colors">Security</a>
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-lg">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </nav>
            
            {/* Mobile Menu */}
            <div className="md:hidden flex items-center space-x-2">
              <Link href="/login">
                <Button size="sm" variant="outline">Login</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700">Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <main className="container mx-auto px-6">
        <section className="py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-teal-100 text-teal-800 rounded-full text-sm font-medium">
                  <Zap className="w-4 h-4 mr-2" />
                  Powered by Pathway Framework
                </div>
                <h1 className="text-6xl font-bold text-gray-900 leading-tight">
                  Next-Gen
                  <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent block">
                    Financial Security
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Real-time fraud detection, AI-powered market analytics, and complete accessibility features. 
                  Built for everyone, secured by advanced ML algorithms.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button size="lg" className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-lg px-8 py-4 shadow-xl">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-2 border-teal-200 hover:bg-teal-50">
                    Sign In
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Free forever plan
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  No credit card required
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  WCAG 2.1 compliant
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-2xl blur-3xl opacity-20"></div>
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&h=500&fit=crop&crop=center" 
                alt="Advanced financial dashboard with real-time analytics" 
                className="relative rounded-2xl shadow-2xl w-full h-96 object-cover border border-white/20"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-teal-900/30 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </section>

        {/* Enhanced Features Grid */}
        <section id="features" className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Comprehensive Financial Protection</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced AI algorithms and real-time processing ensure your financial security while maintaining complete accessibility
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Real-Time Fraud Detection</h3>
              <p className="text-gray-600 mb-4">AI-powered risk scoring with 95%+ accuracy. Instant alerts and explainable AI reasoning for every transaction.</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Behavioral pattern analysis</li>
                <li>• Geo-location validation</li>
                <li>• Impossible travel detection</li>
              </ul>
            </div>
            
            <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Volume2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Voice-First Navigation</h3>
              <p className="text-gray-600 mb-4">Complete voice control with natural language processing. Navigate, transact, and manage finances hands-free.</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Voice commands</li>
                <li>• Audio feedback</li>
                <li>• Speech recognition</li>
              </ul>
            </div>
            
            <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Universal Accessibility</h3>
              <p className="text-gray-600 mb-4">WCAG 2.1 AA compliant with screen reader support, high contrast modes, and adaptive interfaces.</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Screen reader compatible</li>
                <li>• Keyboard navigation</li>
                <li>• Color blind friendly</li>
              </ul>
            </div>
            
            <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Live Market Analytics</h3>
              <p className="text-gray-600 mb-4">Real-time market data processing with AI-driven insights for NIFTY, SENSEX, forex, and commodities.</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Real-time data streams</li>
                <li>• Trend analysis</li>
                <li>• Risk assessment</li>
              </ul>
            </div>
            
            <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Green Finance Tracking</h3>
              <p className="text-gray-600 mb-4">Carbon footprint monitoring and eco-friendly spending recommendations for sustainable finance.</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Carbon tracking</li>
                <li>• Eco recommendations</li>
                <li>• Sustainability scores</li>
              </ul>
            </div>
            
            <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Enterprise Security</h3>
              <p className="text-gray-600 mb-4">Bank-grade encryption, compliance automation, and comprehensive audit trails for complete security.</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• End-to-end encryption</li>
                <li>• KYC/AML compliance</li>
                <li>• Audit logging</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="py-20">
          <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 rounded-3xl p-12 text-center text-white shadow-2xl">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Financial Security?</h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of users who trust TRUSTLEDGER for comprehensive financial protection with complete accessibility
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="bg-white text-teal-700 hover:bg-gray-100 text-lg px-8 py-4 shadow-lg">
                    Start Your Free Account
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-4">
                    Sign In Now
                  </Button>
                </Link>
              </div>
              <p className="text-sm mt-6 opacity-75">No credit card required • Free forever plan • WCAG 2.1 compliant</p>
            </div>
          </div>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">TRUSTLEDGER</h3>
                  <p className="text-sm text-gray-400">Financial Intelligence</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Next-generation financial security platform powered by Pathway framework, 
                designed for universal accessibility and real-time protection.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Fraud Detection</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Market Analytics</a></li>
                <li><a href="#" className="hover:text-white transition-colors">AI Assistant</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Compliance Tools</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Accessibility</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Screen Reader Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Voice Navigation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">High Contrast Mode</a></li>
                <li><a href="#" className="hover:text-white transition-colors">WCAG Guidelines</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <span>© 2024 TRUSTLEDGER. All rights reserved.</span>
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400">Powered by</span>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-teal-400" />
                  <span className="text-sm font-medium text-teal-400">Pathway Framework</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}