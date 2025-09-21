'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { apiClient } from '@/lib/api/client'

export default function TestApiPage() {
  const [testResults, setTestResults] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setLoading(prev => ({ ...prev, [testName]: true }))
    try {
      const result = await testFn()
      setTestResults(prev => ({ ...prev, [testName]: { success: true, data: result } }))
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testName]: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }))
    } finally {
      setLoading(prev => ({ ...prev, [testName]: false }))
    }
  }

  const tests = [
    {
      name: 'Health Check',
      key: 'health',
      testFn: () => apiClient.getHealth(),
      description: 'Test basic server connectivity'
    },
    {
      name: 'Analytics Summary',
      key: 'analytics',
      testFn: () => apiClient.getAnalyticsSummary(),
      description: 'Test analytics API endpoint'
    },
    {
      name: 'Get Customers',
      key: 'customers',
      testFn: () => apiClient.getCustomers({ limit: 5 }),
      description: 'Test customers API endpoint'
    },
    {
      name: 'Get Invoices',
      key: 'invoices',
      testFn: () => apiClient.getInvoices({ limit: 5 }),
      description: 'Test invoices API endpoint'
    },
    {
      name: 'Revenue Trend',
      key: 'revenue',
      testFn: () => apiClient.getRevenueTrend({ period: 'monthly', months: 3 }),
      description: 'Test revenue trend API endpoint'
    }
  ]

  const runAllTests = async () => {
    for (const test of tests) {
      await runTest(test.key, test.testFn)
    }
  }

  const getStatusIcon = (key: string) => {
    const result = testResults[key]
    const isLoading = loading[key]

    if (isLoading) return <Loader2 className="h-4 w-4 animate-spin" />
    if (!result) return <AlertTriangle className="h-4 w-4 text-gray-400" />
    if (result.success) return <CheckCircle className="h-4 w-4 text-green-600" />
    return <XCircle className="h-4 w-4 text-red-600" />
  }

  const getStatusBadge = (key: string) => {
    const result = testResults[key]
    const isLoading = loading[key]

    if (isLoading) return <Badge className="bg-blue-100 text-blue-800">Testing...</Badge>
    if (!result) return <Badge variant="outline">Not tested</Badge>
    if (result.success) return <Badge className="bg-green-100 text-green-800">Success</Badge>
    return <Badge className="bg-red-100 text-red-800">Failed</Badge>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Integration Test</h1>
          <p className="text-gray-600 mt-1">Test the connection between frontend and backend</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={runAllTests} disabled={Object.values(loading).some(Boolean)}>
            {Object.values(loading).some(Boolean) ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              'Run All Tests'
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tests.map((test) => (
          <Card key={test.key}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{test.name}</CardTitle>
                {getStatusIcon(test.key)}
              </div>
              <CardDescription>{test.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  {getStatusBadge(test.key)}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => runTest(test.key, test.testFn)}
                  disabled={loading[test.key]}
                  className="w-full"
                >
                  {loading[test.key] ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    'Run Test'
                  )}
                </Button>

                {testResults[test.key] && (
                  <div className="mt-3 p-2 bg-gray-50 rounded border">
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap break-words">
                      {JSON.stringify(testResults[test.key], null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backend Configuration</CardTitle>
          <CardDescription>Current API configuration settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">API Base URL:</span>
              <p className="text-gray-600">{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1'}</p>
            </div>
            <div>
              <span className="font-medium">Backend Base URL:</span>
              <p className="text-gray-600">{process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8001'}</p>
            </div>
            <div>
              <span className="font-medium">Frontend URL:</span>
              <p className="text-gray-600">http://localhost:3001</p>
            </div>
            <div>
              <span className="font-medium">Environment:</span>
              <p className="text-gray-600">{process.env.NODE_ENV || 'development'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-gray-600">
            1. Make sure your backend server is running on <code className="bg-gray-100 px-1 rounded">http://localhost:8001</code>
          </p>
          <p className="text-sm text-gray-600">
            2. Run individual tests or all tests to verify API connectivity
          </p>
          <p className="text-sm text-gray-600">
            3. Check the response data below each test to see the actual API responses
          </p>
          <p className="text-sm text-gray-600">
            4. If tests fail, check the browser's Network tab for detailed error information
          </p>
        </CardContent>
      </Card>
    </div>
  )
}