'use client'

import { Button } from '@/components/ui/button'
import { Shield, Eye, Volume2, Users, Leaf } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">TRUSTLEDGER</h1>
              <p className="text-xs text-gray-600">Real-Time Financial Intelligence</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-teal-600 hover:bg-teal-700">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              AI-Powered Financial Security
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Real-time fraud detection, market analytics, and personalized finance assistance 
              with complete accessibility for all users.
            </p>
            <div className="flex space-x-2">
              <Link href="/signup">
                <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-lg px-8 py-3">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&h=400&fit=crop&crop=center" 
              alt="Banking and financial technology dashboard" 
              className="rounded-lg shadow-2xl w-full h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-teal-600/20 to-transparent rounded-lg"></div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <Shield className="w-12 h-12 text-teal-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Fraud Detection</h3>
            <p className="text-gray-600">Real-time AI-powered fraud scoring with explainable reasoning</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <Eye className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Accessibility First</h3>
            <p className="text-gray-600">Screen reader support, voice navigation, and high contrast modes</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <Volume2 className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Voice Assistant</h3>
            <p className="text-gray-600">Complete voice navigation and audio feedback for all users</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <Leaf className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Green Finance</h3>
            <p className="text-gray-600">Carbon footprint tracking and eco-friendly spending insights</p>
          </div>
        </div>

        {/* Accessibility Features */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Built for Everyone</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">👁️ Visual Accessibility</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Screen reader compatible</li>
                <li>• High contrast mode</li>
                <li>• Large text options</li>
                <li>• Voice guidance</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">🦻 Hearing Accessibility</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Text-based alerts</li>
                <li>• Visual notifications</li>
                <li>• SMS/Email OTP</li>
                <li>• No audio dependency</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">🦽 Motor Accessibility</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Large clickable buttons</li>
                <li>• Voice input support</li>
                <li>• One-hand navigation</li>
                <li>• Keyboard shortcuts</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-teal-600 text-white rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Secure Your Finances?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users protecting their financial future with AI
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3">
              Start Your Free Account
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}