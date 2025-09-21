"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DollarSign,
  FileText,
  Users,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Upload,
  UserPlus,
  Loader2,
  Plus,
} from "lucide-react"

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts"

import { useAnalyticsSummary, useDashboardAnalytics, useRevenueTrend, useCustomers, useInvoices } from "@/lib/api/hooks"
import { formatCurrency, cn } from "@/lib/utils"
import { useMemo, useState } from "react"
import CreateInvoiceDialog from "@/components/CreateInvoiceDialog"
import UploadInvoiceDialog from "@/components/UploadInvoiceDialog"
import NewCustomerDialog from "@/components/NewCustomerDialog"

// Helper function to format revenue trend data for charts
function formatRevenueData(trendData: any[]) {
  return trendData.map(item => ({
    month: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
    revenue: item.revenue
  }))
}


export default function DashboardPage() {
  // State for dialogs
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [createInvoiceDialogOpen, setCreateInvoiceDialogOpen] = useState(false)

  // API hooks for data fetching
  const { data: summary, loading: summaryLoading, error: summaryError } = useAnalyticsSummary()
  const { data: dashboardData, loading: dashboardLoading } = useDashboardAnalytics(30)
  const { data: revenueData, loading: revenueLoading } = useRevenueTrend({ period: 'monthly', months: 6 })
  const { data: customersData, loading: customersLoading } = useCustomers({ limit: 10 })
  const { data: invoicesData, loading: invoicesLoading } = useInvoices({ limit: 100 })

  // Compute derived data
  const chartRevenueData = useMemo(() => {
    if (!revenueData?.trend_data) return []
    return formatRevenueData(revenueData.trend_data)
  }, [revenueData])

  const invoiceStatusData = useMemo(() => {
    if (!dashboardData?.invoice_metrics) return []
    const metrics = dashboardData.invoice_metrics
    const total = metrics.total_invoices || 1
    return [
      { name: "Paid", value: Math.round((metrics.paid_invoices / total) * 100), color: "#22c55e" },
      { name: "Pending", value: Math.round((metrics.pending_invoices / total) * 100), color: "#f59e0b" },
      { name: "Overdue", value: Math.round((metrics.overdue_invoices / total) * 100), color: "#ef4444" },
      { name: "Draft", value: Math.round(((total - metrics.paid_invoices - metrics.pending_invoices - metrics.overdue_invoices) / total) * 100), color: "#6b7280" },
    ]
  }, [dashboardData])

  const riskDistributionData = useMemo(() => {
    if (!dashboardData?.risk_metrics) return []
    const risk = dashboardData.risk_metrics
    return [
      { level: "Low", count: risk.low_risk_customers, color: "#22c55e" },
      { level: "Medium", count: risk.medium_risk_customers, color: "#f59e0b" },
      { level: "High", count: risk.high_risk_customers, color: "#ef4444" },
      { level: "Critical", count: risk.critical_risk_customers, color: "#991b1b" },
    ]
  }, [dashboardData])

  const topCustomers = useMemo(() => {
    if (!customersData?.customers) return []
    return customersData.customers
      .filter(customer => customer.outstanding_amount > 0)
      .sort((a, b) => b.outstanding_amount - a.outstanding_amount)
      .slice(0, 4)
  }, [customersData])

  // Calculate growth rates
  const revenueGrowthRate = useMemo(() => {
    if (!dashboardData?.revenue_metrics) return 0
    const { current_month, previous_month } = dashboardData.revenue_metrics
    if (previous_month === 0) return 0
    return Math.round(((current_month - previous_month) / previous_month) * 100)
  }, [dashboardData])

  const collectionRate = useMemo(() => {
    if (!dashboardData?.invoice_metrics) return 0
    const { paid_invoices, total_invoices } = dashboardData.invoice_metrics
    if (total_invoices === 0) return 0
    return Math.round((paid_invoices / total_invoices) * 100)
  }, [dashboardData])

  // Calculate actual outstanding balance from dashboard analytics
  const totalOutstanding = useMemo(() => {
    return dashboardData?.revenue_metrics?.outstanding_revenue || 0
  }, [dashboardData])

  // Loading state (only show if all are loading and no errors)
  if ((summaryLoading || dashboardLoading || invoicesLoading) && !summaryError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    )
  }

  // Show dashboard with error banner if there are API errors
  const hasApiError = summaryError || (!summary && !summaryLoading)

  return (
    <div className="p-6 space-y-6">
      {/* API Error Banner */}
      {hasApiError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">API Connection Issue</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Unable to connect to the backend API. Please ensure the server is running on http://localhost:8001
              </p>
              <p className="text-xs text-yellow-600 mt-1">Showing demo data below.</p>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your billing overview.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button variant="outline" onClick={() => setUploadDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Invoice
          </Button>
          <Button onClick={() => setCreateInvoiceDialogOpen(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Outstanding
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalOutstanding || 0)}
            </div>
            <div className="flex items-center mt-2">
              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-xs text-red-500 font-medium">-</span>
              <span className="text-xs text-gray-500 ml-1">vs last month</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">{summary?.pending_invoices || 0} pending invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              This Month Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.revenue_metrics ? formatCurrency(dashboardData.revenue_metrics.current_month) : '$0'}
            </div>
            <div className="flex items-center mt-2">
              {revenueGrowthRate >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={cn("text-xs font-medium", revenueGrowthRate >= 0 ? "text-green-500" : "text-red-500")}>
                {Math.abs(revenueGrowthRate)}%
              </span>
              <span className="text-xs text-gray-500 ml-1">from last month</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">{summary?.total_payments || 0} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Collection Rate
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collectionRate}%</div>
            <div className="flex items-center mt-2">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-xs text-green-500 font-medium">-</span>
              <span className="text-xs text-gray-500 ml-1">improvement</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Avg payment time: {dashboardData?.invoice_metrics?.average_payment_time || 0} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              High Risk Customers
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(dashboardData?.risk_metrics?.high_risk_customers || 0) + (dashboardData?.risk_metrics?.critical_risk_customers || 0)}
            </div>
            <div className="flex items-center mt-2">
              <ArrowUpRight className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-xs text-red-500 font-medium">-</span>
              <span className="text-xs text-gray-500 ml-1">this week</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Total customers: {summary?.total_customers || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-md">
              <Button variant="outline" className="h-auto py-6 flex-col" onClick={() => setCreateInvoiceDialogOpen(true)}>
                <FileText className="h-8 w-8 mb-3" />
                <span className="text-sm font-medium">Create Invoice</span>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex-col" onClick={() => setUploadDialogOpen(true)}>
                <Upload className="h-8 w-8 mb-3" />
                <span className="text-sm font-medium">Upload Invoice</span>
              </Button>
              <NewCustomerDialog
                triggerButton={
                  <Button variant="outline" className="h-auto py-6 flex-col w-full">
                    <UserPlus className="h-8 w-8 mb-3" />
                    <span className="text-sm font-medium">Add Customer</span>
                  </Button>
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading revenue data...</span>
              </div>
            ) : chartRevenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    fill="#93bbfc"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No revenue data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoice Status */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Status Breakdown</CardTitle>
            <CardDescription>Current status of all invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={invoiceStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {invoiceStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>


      {/* Risk Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Risk Level Distribution</CardTitle>
            <CardDescription>Customer risk assessment breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={riskDistributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="level" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8">
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Customers by Amount */}
        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
            <CardDescription>By outstanding amount</CardDescription>
          </CardHeader>
          <CardContent>
            {customersLoading ? (
              <div className="flex items-center justify-center h-[200px]">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="ml-2">Loading customers...</span>
              </div>
            ) : topCustomers.length > 0 ? (
              <div className="space-y-3">
                {topCustomers.map((customer, index) => {
                  const colors = ['blue', 'purple', 'green', 'orange']
                  const color = colors[index % colors.length]
                  return (
                    <div key={customer.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center",
                          color === 'blue' && "bg-blue-100",
                          color === 'purple' && "bg-purple-100",
                          color === 'green' && "bg-green-100",
                          color === 'orange' && "bg-orange-100"
                        )}>
                          <span className="text-xs font-medium">
                            {customer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </span>
                        </div>
                        <span className="text-sm font-medium">{customer.name}</span>
                      </div>
                      <span className="text-sm font-semibold">
                        {formatCurrency(customer.outstanding_amount)}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No customers with outstanding amounts
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Invoice Dialog */}
      <CreateInvoiceDialog
        open={createInvoiceDialogOpen}
        onOpenChange={setCreateInvoiceDialogOpen}
        onInvoiceCreated={() => {
          setCreateInvoiceDialogOpen(false)
          // You could add a refetch here if needed
        }}
      />

      {/* Upload Invoice Dialog */}
      <UploadInvoiceDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onInvoiceUploaded={() => {
          setUploadDialogOpen(false)
          // You could add a refetch here if needed
        }}
      />
    </div>
  )
}

