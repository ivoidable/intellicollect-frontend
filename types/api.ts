// API Response Types based on Backend API Guide

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  total: number
  skip: number
  limit: number
}

// Customer Types
export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  company?: string
  industry?: string
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  risk_level?: 'low' | 'medium' | 'high' | 'critical'
  created_at: string
  updated_at: string
  created_date?: string
  total_invoices: number
  outstanding_amount: number
  payment_history?: string
}

export interface CreateCustomerRequest {
  name: string
  email: string
  phone?: string
  address?: string
  company?: string
  industry?: string
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {}

export interface CustomersResponse extends PaginatedResponse<Customer> {
  customers: Customer[]
}

// Invoice Types
export interface Invoice {
  invoice_id: string
  customer_id: string
  invoice_date: string // YYYY-MM-DD
  due_date: string // YYYY-MM-DD
  amount: number
  total_amount: number
  currency: string
  status: 'draft' | 'pending' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  payment_status: 'unpaid' | 'partial' | 'paid' | 'refunded'
  risk_level?: string
  risk_score?: number
  created_timestamp?: string
  paid_amount: number
  outstanding_amount: number
  reminder_count?: number
  last_reminder_date?: string
  payment_date?: string
  payment_reference?: string
}

export interface CreateInvoiceRequest {
  customer_id: string
  invoice_date: string
  due_date: string
  amount: number
  total_amount: number
  currency?: string
  status?: 'draft' | 'pending' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  payment_status?: 'unpaid' | 'partial' | 'paid' | 'refunded'
}

export interface UpdateInvoiceRequest extends Partial<CreateInvoiceRequest> {}

export interface InvoicesResponse extends PaginatedResponse<Invoice> {
  invoices: Invoice[]
}

// Payment Types
export interface Payment {
  id: string
  customer_id: string
  amount: number
  currency: string
  transaction_date: string
  reference_number: string
  status: 'success' | 'pending' | 'failed'
  transaction_type: 'bank_transfer' | 'credit_card' | 'check' | 'cash' | 'other'
  processing_method: 'manual' | 'automatic'
  bank_name?: string
  payer_name?: string
  fees?: number
  created_at: string
  updated_at: string
}

export interface CreatePaymentRequest {
  customer_id: string
  amount: number
  currency: string
  transaction_date: string
  reference_number: string
  status: 'success' | 'pending' | 'failed'
  transaction_type: 'bank_transfer' | 'credit_card' | 'check' | 'cash' | 'other'
  processing_method: 'manual' | 'automatic'
  bank_name?: string
  payer_name?: string
  fees?: number
}

export interface PaymentsResponse extends PaginatedResponse<Payment> {
  payments: Payment[]
}

// Analytics Types
export interface AnalyticsSummary {
  total_customers: number
  total_invoices: number
  total_payments: number
  total_revenue: number
  pending_invoices: number
  last_updated: string
}

export interface DashboardAnalytics {
  summary: AnalyticsSummary
  revenue_metrics: {
    current_month: number
    previous_month: number
    growth_rate: number
    ytd_revenue: number
  }
  customer_metrics: {
    total_customers: number
    new_customers_this_month: number
    active_customers: number
    customer_retention_rate: number
  }
  invoice_metrics: {
    total_invoices: number
    paid_invoices: number
    pending_invoices: number
    overdue_invoices: number
    average_payment_time: number
  }
  risk_metrics: {
    low_risk_customers: number
    medium_risk_customers: number
    high_risk_customers: number
    critical_risk_customers: number
  }
}

export interface RevenueTrend {
  period: string
  revenue: number
  date: string
}

export interface RevenueTrendResponse {
  trend_data: RevenueTrend[]
  period: string
  total_periods: number
}

export interface CustomerAnalytics {
  customer: Customer
  payment_history: Payment[]
  invoice_summary: {
    total_invoices: number
    paid_invoices: number
    pending_invoices: number
    overdue_invoices: number
    total_amount: number
    paid_amount: number
    outstanding_amount: number
  }
  risk_assessment: {
    current_risk_level: string
    risk_factors: string[]
    payment_behavior_score: number
    recommendations: string[]
  }
}

// Communication Types
export interface Communication {
  id: string
  customer_id: string
  type: 'email' | 'sms' | 'whatsapp' | 'call'
  subject?: string
  message: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  sent_at: string
  delivered_at?: string
  read_at?: string
  created_at: string
}

export interface SendCommunicationRequest {
  customer_id: string
  type: 'email' | 'sms' | 'whatsapp'
  subject?: string
  message: string
  send_immediately?: boolean
  scheduled_time?: string
}

export interface CommunicationHistoryResponse extends PaginatedResponse<Communication> {
  communications: Communication[]
}

// Health Check
export interface HealthResponse {
  status: string
  app: string
  version: string
  environment?: string
}

// Error Types
export interface ApiError {
  detail: string | ValidationError[]
}

export interface ValidationError {
  type: string
  loc: (string | number)[]
  msg: string
  input?: any
}