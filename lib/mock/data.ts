import {
  Customer,
  Invoice,
  Payment,
  AnalyticsSummary,
  DashboardAnalytics,
  RevenueTrend,
  Communication,
} from '@/types/api'

// Mock Customers Data
export const mockCustomers: Customer[] = [
  {
    id: 'cust-001',
    name: 'Acme Corporation',
    email: 'billing@acme.com',
    phone: '+1-555-0123',
    address: '123 Business Ave, Suite 100, New York, NY 10001',
    company: 'Acme Corporation',
    industry: 'Technology',
    status: 'active',
    risk_level: 'low',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-09-20T14:30:00Z',
    created_date: '2024-01-15',
    total_invoices: 12,
    outstanding_amount: 25000,
    payment_history: 'Excellent - always pays on time'
  },
  {
    id: 'cust-002',
    name: 'Tech Solutions Inc',
    email: 'finance@techsolutions.com',
    phone: '+1-555-0456',
    address: '456 Innovation Dr, San Francisco, CA 94105',
    company: 'Tech Solutions Inc',
    industry: 'Software',
    status: 'active',
    risk_level: 'medium',
    created_at: '2024-02-20T09:15:00Z',
    updated_at: '2024-09-18T11:45:00Z',
    created_date: '2024-02-20',
    total_invoices: 8,
    outstanding_amount: 15000,
    payment_history: 'Good - occasional delays but pays eventually'
  },
  {
    id: 'cust-003',
    name: 'Global Manufacturing',
    email: 'accounts@globalmanuf.com',
    phone: '+1-555-0789',
    address: '789 Industrial Blvd, Detroit, MI 48201',
    company: 'Global Manufacturing',
    industry: 'Manufacturing',
    status: 'active',
    risk_level: 'high',
    created_at: '2024-03-10T13:20:00Z',
    updated_at: '2024-09-21T16:10:00Z',
    created_date: '2024-03-10',
    total_invoices: 15,
    outstanding_amount: 45000,
    payment_history: 'Poor - frequently late payments'
  },
  {
    id: 'cust-004',
    name: 'StartupCo',
    email: 'ceo@startupco.com',
    phone: '+1-555-0321',
    address: '321 Startup Lane, Austin, TX 78701',
    company: 'StartupCo',
    industry: 'Technology',
    status: 'active',
    risk_level: 'critical',
    created_at: '2024-06-01T08:30:00Z',
    updated_at: '2024-09-22T09:00:00Z',
    created_date: '2024-06-01',
    total_invoices: 5,
    outstanding_amount: 8500,
    payment_history: 'Very poor - multiple missed payments'
  },
  {
    id: 'cust-005',
    name: 'Retail Chain Ltd',
    email: 'procurement@retailchain.com',
    phone: '+1-555-0654',
    address: '654 Commerce St, Chicago, IL 60601',
    company: 'Retail Chain Ltd',
    industry: 'Retail',
    status: 'active',
    risk_level: 'low',
    created_at: '2024-01-30T12:00:00Z',
    updated_at: '2024-09-19T10:20:00Z',
    created_date: '2024-01-30',
    total_invoices: 20,
    outstanding_amount: 0,
    payment_history: 'Excellent - early payments'
  }
]

// Mock Invoices Data
export const mockInvoices: Invoice[] = [
  {
    invoice_id: 'inv-001',
    customer_id: 'cust-001',
    invoice_date: '2024-09-01',
    due_date: '2024-09-30',
    amount: 12500,
    total_amount: 12500,
    currency: 'USD',
    status: 'sent',
    payment_status: 'unpaid',
    risk_level: 'low',
    risk_score: 15,
    created_timestamp: '2024-09-01T09:00:00Z',
    paid_amount: 0,
    outstanding_amount: 12500,
    reminder_count: 1,
    last_reminder_date: '2024-09-15',
  },
  {
    invoice_id: 'inv-002',
    customer_id: 'cust-002',
    invoice_date: '2024-08-15',
    due_date: '2024-09-15',
    amount: 8000,
    total_amount: 8000,
    currency: 'USD',
    status: 'overdue',
    payment_status: 'unpaid',
    risk_level: 'medium',
    risk_score: 45,
    created_timestamp: '2024-08-15T10:30:00Z',
    paid_amount: 0,
    outstanding_amount: 8000,
    reminder_count: 3,
    last_reminder_date: '2024-09-20',
  },
  {
    invoice_id: 'inv-003',
    customer_id: 'cust-003',
    invoice_date: '2024-07-01',
    due_date: '2024-07-31',
    amount: 25000,
    total_amount: 25000,
    currency: 'USD',
    status: 'overdue',
    payment_status: 'partial',
    risk_level: 'high',
    risk_score: 75,
    created_timestamp: '2024-07-01T14:00:00Z',
    paid_amount: 10000,
    outstanding_amount: 15000,
    reminder_count: 5,
    last_reminder_date: '2024-09-18',
  },
  {
    invoice_id: 'inv-004',
    customer_id: 'cust-005',
    invoice_date: '2024-09-10',
    due_date: '2024-10-10',
    amount: 5000,
    total_amount: 5000,
    currency: 'USD',
    status: 'paid',
    payment_status: 'paid',
    risk_level: 'low',
    risk_score: 5,
    created_timestamp: '2024-09-10T11:15:00Z',
    paid_amount: 5000,
    outstanding_amount: 0,
    reminder_count: 0,
    payment_date: '2024-09-15',
    payment_reference: 'PAY-004-2024',
  },
  {
    invoice_id: 'inv-005',
    customer_id: 'cust-004',
    invoice_date: '2024-08-01',
    due_date: '2024-08-31',
    amount: 3500,
    total_amount: 3500,
    currency: 'USD',
    status: 'overdue',
    payment_status: 'unpaid',
    risk_level: 'critical',
    risk_score: 90,
    created_timestamp: '2024-08-01T15:45:00Z',
    paid_amount: 0,
    outstanding_amount: 3500,
    reminder_count: 6,
    last_reminder_date: '2024-09-21',
  }
]

// Mock Payments Data
export const mockPayments: Payment[] = [
  {
    id: 'pay-001',
    customer_id: 'cust-005',
    amount: 5000,
    currency: 'USD',
    transaction_date: '2024-09-15',
    reference_number: 'PAY-004-2024',
    status: 'success',
    transaction_type: 'bank_transfer',
    processing_method: 'manual',
    bank_name: 'Chase Bank',
    payer_name: 'Retail Chain Ltd',
    fees: 25,
    created_at: '2024-09-15T14:30:00Z',
    updated_at: '2024-09-15T14:30:00Z',
  },
  {
    id: 'pay-002',
    customer_id: 'cust-003',
    amount: 10000,
    currency: 'USD',
    transaction_date: '2024-08-15',
    reference_number: 'PAY-003-2024',
    status: 'success',
    transaction_type: 'credit_card',
    processing_method: 'automatic',
    payer_name: 'Global Manufacturing',
    fees: 300,
    created_at: '2024-08-15T11:20:00Z',
    updated_at: '2024-08-15T11:20:00Z',
  }
]

// Mock Analytics Summary
export const mockAnalyticsSummary: AnalyticsSummary = {
  total_customers: 5,
  total_invoices: 5,
  total_payments: 2,
  total_revenue: 15000,
  pending_invoices: 3,
  last_updated: '2024-09-22T09:00:00Z'
}

// Mock Dashboard Analytics
export const mockDashboardAnalytics: DashboardAnalytics = {
  summary: mockAnalyticsSummary,
  revenue_metrics: {
    current_month: 17500,
    previous_month: 12000,
    growth_rate: 45.8,
    ytd_revenue: 125000
  },
  customer_metrics: {
    total_customers: 5,
    new_customers_this_month: 1,
    active_customers: 5,
    customer_retention_rate: 95.2
  },
  invoice_metrics: {
    total_invoices: 5,
    paid_invoices: 1,
    pending_invoices: 1,
    overdue_invoices: 3,
    average_payment_time: 18
  },
  risk_metrics: {
    low_risk_customers: 2,
    medium_risk_customers: 1,
    high_risk_customers: 1,
    critical_risk_customers: 1
  }
}

// Mock Revenue Trend Data
export const mockRevenueTrend: RevenueTrend[] = [
  { period: '2024-04', revenue: 8500, date: '2024-04-30' },
  { period: '2024-05', revenue: 12000, date: '2024-05-31' },
  { period: '2024-06', revenue: 15500, date: '2024-06-30' },
  { period: '2024-07', revenue: 18000, date: '2024-07-31' },
  { period: '2024-08', revenue: 12000, date: '2024-08-31' },
  { period: '2024-09', revenue: 17500, date: '2024-09-30' }
]

// Mock Communications Data
export const mockCommunications: Communication[] = [
  {
    id: 'comm-001',
    customer_id: 'cust-002',
    type: 'email',
    subject: 'Invoice Reminder - Payment Due',
    message: 'This is a friendly reminder that your invoice #inv-002 is now due.',
    status: 'delivered',
    sent_at: '2024-09-20T10:00:00Z',
    delivered_at: '2024-09-20T10:02:00Z',
    created_at: '2024-09-20T10:00:00Z'
  },
  {
    id: 'comm-002',
    customer_id: 'cust-003',
    type: 'sms',
    message: 'Your payment is overdue. Please contact us immediately.',
    status: 'sent',
    sent_at: '2024-09-18T14:30:00Z',
    created_at: '2024-09-18T14:30:00Z'
  },
  {
    id: 'comm-003',
    customer_id: 'cust-004',
    type: 'email',
    subject: 'URGENT - Multiple Overdue Invoices',
    message: 'We have attempted to contact you multiple times regarding your overdue invoices.',
    status: 'read',
    sent_at: '2024-09-21T16:00:00Z',
    delivered_at: '2024-09-21T16:01:00Z',
    read_at: '2024-09-21T18:30:00Z',
    created_at: '2024-09-21T16:00:00Z'
  }
]

// Helper function to generate unique IDs
export const generateId = (prefix: string): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 9)
  return `${prefix}-${timestamp}-${random}`
}

// Helper function to get current date in ISO format
export const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0]
}

// Helper function to add days to date
export const addDays = (date: string, days: number): string => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result.toISOString().split('T')[0]
}