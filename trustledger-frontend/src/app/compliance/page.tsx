'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, CheckCircle, AlertTriangle, FileText, Upload, Brain, Loader2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { complianceAPI } from '@/lib/api'

export default function Compliance() {
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadSuccess(false)
    
    try {
      await complianceAPI.uploadDocument(file)
      setUploadSuccess(true)
      alert('Document uploaded successfully! Our team will review it shortly.')
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload document. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Compliance</h1>
                <p className="text-gray-600 dark:text-gray-400">AML/KYC compliance and regulatory documents</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden md:block">
                  <img 
                    src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=200&h=120&fit=crop&crop=center" 
                    alt="Legal compliance and documentation" 
                    className="w-32 h-20 object-cover rounded-lg shadow-md"
                  />
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg">
                  <Shield className="w-5 h-5" />
                  <span className="font-semibold">Verified</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">KYC Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <div className="text-2xl font-bold text-green-600">Verified</div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Completed on 15 Jan 2024</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">AML Checks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <div className="text-2xl font-bold text-green-600">Passed</div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Last checked: Today</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Compliance Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">98/100</div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '98%'}}></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Checks</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { check: 'KYC', status: 100, color: '#10b981' },
                      { check: 'AML', status: 100, color: '#10b981' },
                      { check: 'PEP', status: 100, color: '#10b981' },
                      { check: 'Sanctions', status: 100, color: '#10b981' },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="check" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="status" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Document Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-semibold text-green-900 dark:text-green-200">Aadhaar Card</p>
                          <p className="text-xs text-green-700 dark:text-green-300">Verified</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="dark:bg-gray-700 dark:text-white dark:border-gray-600">View</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-semibold text-green-900 dark:text-green-200">PAN Card</p>
                          <p className="text-xs text-green-700 dark:text-green-300">Verified</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="dark:bg-gray-700 dark:text-white dark:border-gray-600">View</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-semibold text-green-900 dark:text-green-200">Address Proof</p>
                          <p className="text-xs text-green-700 dark:text-green-300">Verified</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="dark:bg-gray-700 dark:text-white dark:border-gray-600">View</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Upload Additional Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Drag and drop files here or click to browse
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileUpload}
                  />
                  <Button 
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                    onClick={handleUploadClick}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Document
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>AI Compliance Insights</CardTitle>
                  <Brain className="w-5 h-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-green-900 dark:text-green-200">Fully Compliant</p>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          All your documents are verified and up to date. Your account meets all regulatory requirements.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-blue-900 dark:text-blue-200">AML Monitoring Active</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          AI continuously monitors your transactions for suspicious activities. No alerts detected.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-yellow-900 dark:text-yellow-200">Document Renewal Reminder</p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                          Your PAN card will expire in 180 days. Please update your documents before expiry.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
