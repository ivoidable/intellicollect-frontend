import {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomersResponse,
  Invoice,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  InvoicesResponse,
  Payment,
  CreatePaymentRequest,
  PaymentsResponse,
  AnalyticsSummary,
  DashboardAnalytics,
  RevenueTrendResponse,
  CustomerAnalytics,
  Communication,
  SendCommunicationRequest,
  CommunicationHistoryResponse,
  HealthResponse,
} from '@/types/api'

import { mockStorage } from './storage'
import {
  mockAnalyticsSummary,
  mockDashboardAnalytics,
  mockRevenueTrend,
  generateId
} from './data'

// Mock API Client that simulates API responses using local storage
class MockApiClient {
  private delay = 300 // Simulate network delay

  private async mockDelay<T>(result: T): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, this.delay))
    return result
  }

  // Health & Info
  async getHealth(): Promise<HealthResponse> {
    return this.mockDelay({
      status: 'healthy',
      app: 'IntelliCollect Mock API',
      version: '1.0.0-mock',
      environment: 'development'
    })
  }

  async getInfo(): Promise<HealthResponse> {
    return this.getHealth()
  }

  // Customers API
  async getCustomers(params?: {
    skip?: number
    limit?: number
    search?: string
  }): Promise<CustomersResponse> {
    let customers = mockStorage.getCustomers()

    // Apply search filter
    if (params?.search) {
      const searchLower = params.search.toLowerCase()
      customers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower) ||
        customer.company?.toLowerCase().includes(searchLower)
      )
    }

    // Apply pagination
    const skip = params?.skip || 0
    const limit = params?.limit || 10
    const paginatedCustomers = customers.slice(skip, skip + limit)

    return this.mockDelay({
      customers: paginatedCustomers,
      total: customers.length,
      skip,
      limit
    })
  }

  async getCustomer(customerId: string): Promise<Customer> {
    const customer = mockStorage.getCustomer(customerId)
    if (!customer) {
      throw new Error('Customer not found')
    }
    return this.mockDelay(customer)
  }

  async createCustomer(data: CreateCustomerRequest): Promise<Customer> {
    const customer = mockStorage.createCustomer(data)
    return this.mockDelay(customer)
  }

  async updateCustomer(customerId: string, data: UpdateCustomerRequest): Promise<Customer> {
    const customer = mockStorage.updateCustomer(customerId, data)
    if (!customer) {
      throw new Error('Customer not found')
    }
    return this.mockDelay(customer)
  }

  async deleteCustomer(customerId: string): Promise<void> {
    const deleted = mockStorage.deleteCustomer(customerId)
    if (!deleted) {
      throw new Error('Customer not found')
    }
    return this.mockDelay(undefined)
  }

  async assessCustomerRisk(customerId: string): Promise<Customer> {
    const customer = mockStorage.assessCustomerRisk(customerId)
    if (!customer) {
      throw new Error('Customer not found')
    }
    return this.mockDelay(customer)
  }

  // Invoices API
  async getInvoices(params?: {
    customer_id?: string
    status?: 'draft' | 'pending' | 'sent' | 'paid' | 'overdue' | 'cancelled'
    payment_status?: 'unpaid' | 'partial' | 'paid' | 'refunded'
    skip?: number
    limit?: number
  }): Promise<InvoicesResponse> {
    let invoices = mockStorage.getInvoices()

    // Apply filters
    if (params?.customer_id) {
      invoices = invoices.filter(invoice => invoice.customer_id === params.customer_id)
    }
    if (params?.status) {
      invoices = invoices.filter(invoice => invoice.status === params.status)
    }
    if (params?.payment_status) {
      invoices = invoices.filter(invoice => invoice.payment_status === params.payment_status)
    }

    // Apply pagination
    const skip = params?.skip || 0
    const limit = params?.limit || 10
    const paginatedInvoices = invoices.slice(skip, skip + limit)

    return this.mockDelay({
      invoices: paginatedInvoices,
      total: invoices.length,
      skip,
      limit
    })
  }

  async getInvoice(invoiceId: string): Promise<Invoice> {
    const invoice = mockStorage.getInvoice(invoiceId)
    if (!invoice) {
      throw new Error('Invoice not found')
    }
    return this.mockDelay(invoice)
  }

  async createInvoice(data: CreateInvoiceRequest): Promise<Invoice> {
    const invoice = mockStorage.createInvoice(data)
    return this.mockDelay(invoice)
  }

  async updateInvoice(invoiceId: string, data: UpdateInvoiceRequest): Promise<Invoice> {
    const invoice = mockStorage.updateInvoice(invoiceId, data)
    if (!invoice) {
      throw new Error('Invoice not found')
    }
    return this.mockDelay(invoice)
  }

  async deleteInvoice(invoiceId: string): Promise<void> {
    const deleted = mockStorage.deleteInvoice(invoiceId)
    if (!deleted) {
      throw new Error('Invoice not found')
    }
    return this.mockDelay(undefined)
  }

  // Payments API
  async createPayment(data: CreatePaymentRequest): Promise<Payment> {
    const payment = mockStorage.createPayment(data)
    return this.mockDelay(payment)
  }

  async getInvoicePayments(invoiceId: string): Promise<PaymentsResponse> {
    const payments = mockStorage.getInvoicePayments(invoiceId)
    return this.mockDelay({
      payments,
      total: payments.length,
      skip: 0,
      limit: payments.length
    })
  }

  async uploadReceipt(file: File, invoiceId: string, transactionId?: string): Promise<any> {
    // Mock file upload - just return success
    return this.mockDelay({
      success: true,
      message: 'Receipt uploaded successfully',
      file_id: generateId('file'),
      invoice_id: invoiceId,
      transaction_id: transactionId
    })
  }

  // Analytics API
  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    // Generate real-time analytics from current data
    const customers = mockStorage.getCustomers()
    const invoices = mockStorage.getInvoices()
    const payments = mockStorage.getPayments()

    const summary: AnalyticsSummary = {
      total_customers: customers.length,
      total_invoices: invoices.length,
      total_payments: payments.length,
      total_revenue: payments.reduce((sum, payment) => sum + payment.amount, 0),
      pending_invoices: invoices.filter(i => i.status === 'sent' || i.status === 'pending').length,
      last_updated: new Date().toISOString()
    }

    return this.mockDelay(summary)
  }

  async getDashboardAnalytics(periodDays: number = 30): Promise<DashboardAnalytics> {
    // Generate real-time dashboard analytics
    const customers = mockStorage.getCustomers()
    const invoices = mockStorage.getInvoices()
    const summary = await this.getAnalyticsSummary()

    const analytics: DashboardAnalytics = {
      ...mockDashboardAnalytics,
      summary,
      customer_metrics: {
        ...mockDashboardAnalytics.customer_metrics,
        total_customers: customers.length,
        active_customers: customers.filter(c => c.status === 'active').length
      },
      invoice_metrics: {
        total_invoices: invoices.length,
        paid_invoices: invoices.filter(i => i.payment_status === 'paid').length,
        pending_invoices: invoices.filter(i => i.status === 'sent' || i.status === 'pending').length,
        overdue_invoices: invoices.filter(i => i.status === 'overdue').length,
        average_payment_time: 15
      },
      risk_metrics: {
        low_risk_customers: customers.filter(c => c.risk_level === 'low').length,
        medium_risk_customers: customers.filter(c => c.risk_level === 'medium').length,
        high_risk_customers: customers.filter(c => c.risk_level === 'high').length,
        critical_risk_customers: customers.filter(c => c.risk_level === 'critical').length
      }
    }

    return this.mockDelay(analytics)
  }

  async getRevenueTrend(params?: {
    period?: 'daily' | 'weekly' | 'monthly'
    months?: number
  }): Promise<RevenueTrendResponse> {
    return this.mockDelay({
      trend_data: mockRevenueTrend,
      period: params?.period || 'monthly',
      total_periods: mockRevenueTrend.length
    })
  }

  async getCustomerAnalytics(customerId: string): Promise<CustomerAnalytics> {
    const customer = mockStorage.getCustomer(customerId)
    if (!customer) {
      throw new Error('Customer not found')
    }

    const payments = mockStorage.getPayments().filter(p => p.customer_id === customerId)
    const invoices = mockStorage.getInvoices().filter(i => i.customer_id === customerId)

    const analytics: CustomerAnalytics = {
      customer,
      payment_history: payments,
      invoice_summary: {
        total_invoices: invoices.length,
        paid_invoices: invoices.filter(i => i.payment_status === 'paid').length,
        pending_invoices: invoices.filter(i => i.status === 'sent' || i.status === 'pending').length,
        overdue_invoices: invoices.filter(i => i.status === 'overdue').length,
        total_amount: invoices.reduce((sum, inv) => sum + inv.total_amount, 0),
        paid_amount: invoices.reduce((sum, inv) => sum + inv.paid_amount, 0),
        outstanding_amount: invoices.reduce((sum, inv) => sum + inv.outstanding_amount, 0)
      },
      risk_assessment: {
        current_risk_level: customer.risk_level || 'low',
        risk_factors: this.generateRiskFactors(customer, invoices),
        payment_behavior_score: this.calculatePaymentScore(invoices),
        recommendations: this.generateRecommendations(customer, invoices)
      }
    }

    return this.mockDelay(analytics)
  }

  // Communications API
  async sendCommunication(data: SendCommunicationRequest): Promise<Communication> {
    const communication = mockStorage.sendCommunication(data)
    return this.mockDelay(communication)
  }

  async getCommunicationHistory(
    customerId: string,
    params?: {
      skip?: number
      limit?: number
    }
  ): Promise<CommunicationHistoryResponse> {
    const communications = mockStorage.getCustomerCommunications(customerId)

    const skip = params?.skip || 0
    const limit = params?.limit || 10
    const paginatedComms = communications.slice(skip, skip + limit)

    return this.mockDelay({
      communications: paginatedComms,
      total: communications.length,
      skip,
      limit
    })
  }

  // Helper methods for analytics
  private generateRiskFactors(customer: Customer, invoices: Invoice[]): string[] {
    const factors: string[] = []

    const overdueCount = invoices.filter(i => i.status === 'overdue').length
    if (overdueCount > 0) {
      factors.push(`${overdueCount} overdue invoice${overdueCount > 1 ? 's' : ''}`)
    }

    if (customer.outstanding_amount > 10000) {
      factors.push('High outstanding amount')
    }

    const avgPaymentTime = invoices.filter(i => i.payment_date).length
    if (avgPaymentTime > 30) {
      factors.push('Slow payment history')
    }

    if (factors.length === 0) {
      factors.push('No significant risk factors identified')
    }

    return factors
  }

  private calculatePaymentScore(invoices: Invoice[]): number {
    if (invoices.length === 0) return 100

    const paidOnTime = invoices.filter(i =>
      i.payment_status === 'paid' &&
      i.payment_date &&
      new Date(i.payment_date) <= new Date(i.due_date)
    ).length

    return Math.round((paidOnTime / invoices.length) * 100)
  }

  private generateRecommendations(customer: Customer, invoices: Invoice[]): string[] {
    const recommendations: string[] = []

    const overdueCount = invoices.filter(i => i.status === 'overdue').length
    if (overdueCount > 0) {
      recommendations.push('Send immediate payment reminder')
      recommendations.push('Consider payment plan options')
    }

    if (customer.outstanding_amount > 20000) {
      recommendations.push('Require upfront payment for new orders')
      recommendations.push('Consider credit limit reduction')
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue standard monitoring')
      recommendations.push('Maintain current payment terms')
    }

    return recommendations
  }
}

// Export singleton instance
export const mockApiClient = new MockApiClient()