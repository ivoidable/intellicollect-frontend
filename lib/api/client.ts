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
  ApiError,
} from '@/types/api'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1'
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8001'

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = endpoint.startsWith('/api/v1')
      ? `${BACKEND_BASE_URL}${endpoint}`
      : endpoint.startsWith('/health') || endpoint === '/'
      ? `${BACKEND_BASE_URL}${endpoint}`
      : `${BASE_URL}${endpoint}`

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          detail: `HTTP Error: ${response.status} ${response.statusText}`
        }))
        throw new Error(typeof errorData.detail === 'string' ? errorData.detail : 'API Error')
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return {} as T
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Unknown API error occurred')
    }
  }

  // Health & Info
  async getHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health')
  }

  async getInfo(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/')
  }

  // Customers API
  async getCustomers(params?: {
    skip?: number
    limit?: number
    search?: string
  }): Promise<CustomersResponse> {
    const searchParams = new URLSearchParams()
    if (params?.skip !== undefined) searchParams.set('skip', params.skip.toString())
    if (params?.limit !== undefined) searchParams.set('limit', params.limit.toString())
    if (params?.search) searchParams.set('search', params.search)

    const query = searchParams.toString()
    return this.request<CustomersResponse>(`/customers/${query ? `?${query}` : ''}`)
  }

  async getCustomer(customerId: string): Promise<Customer> {
    return this.request<Customer>(`/customers/${customerId}`)
  }

  async createCustomer(data: CreateCustomerRequest): Promise<Customer> {
    return this.request<Customer>('/customers/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateCustomer(customerId: string, data: UpdateCustomerRequest): Promise<Customer> {
    return this.request<Customer>(`/customers/${customerId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteCustomer(customerId: string): Promise<void> {
    return this.request<void>(`/customers/${customerId}`, {
      method: 'DELETE',
    })
  }

  async assessCustomerRisk(customerId: string): Promise<Customer> {
    return this.request<Customer>(`/customers/${customerId}/risk-assessment`, {
      method: 'POST',
    })
  }

  // Invoices API
  async getInvoices(params?: {
    customer_id?: string
    status?: 'draft' | 'pending' | 'sent' | 'paid' | 'overdue' | 'cancelled'
    payment_status?: 'unpaid' | 'partial' | 'paid' | 'refunded'
    skip?: number
    limit?: number
  }): Promise<InvoicesResponse> {
    const searchParams = new URLSearchParams()
    if (params?.customer_id) searchParams.set('customer_id', params.customer_id)
    if (params?.status) searchParams.set('status', params.status)
    if (params?.payment_status) searchParams.set('payment_status', params.payment_status)
    if (params?.skip !== undefined) searchParams.set('skip', params.skip.toString())
    if (params?.limit !== undefined) searchParams.set('limit', params.limit.toString())

    const query = searchParams.toString()
    return this.request<InvoicesResponse>(`/invoices/${query ? `?${query}` : ''}`)
  }

  async getInvoice(invoiceId: string): Promise<Invoice> {
    return this.request<Invoice>(`/invoices/${invoiceId}`)
  }

  async createInvoice(data: CreateInvoiceRequest): Promise<Invoice> {
    return this.request<Invoice>('/invoices/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateInvoice(invoiceId: string, data: UpdateInvoiceRequest): Promise<Invoice> {
    return this.request<Invoice>(`/invoices/${invoiceId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteInvoice(invoiceId: string): Promise<void> {
    return this.request<void>(`/invoices/${invoiceId}`, {
      method: 'DELETE',
    })
  }

  // Payments API
  async createPayment(data: CreatePaymentRequest): Promise<Payment> {
    return this.request<Payment>('/payments/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getInvoicePayments(invoiceId: string): Promise<PaymentsResponse> {
    return this.request<PaymentsResponse>(`/payments/invoice/${invoiceId}/payments`)
  }

  async uploadReceipt(file: File, invoiceId: string, transactionId?: string): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('invoice_id', invoiceId)
    if (transactionId) formData.append('transaction_id', transactionId)

    return this.request<any>('/payments/upload-receipt', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it with boundary for FormData
      body: formData,
    })
  }

  // Analytics API
  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    return this.request<AnalyticsSummary>('/analytics/summary')
  }

  async getDashboardAnalytics(periodDays: number = 30): Promise<DashboardAnalytics> {
    return this.request<DashboardAnalytics>(`/analytics/dashboard?period_days=${periodDays}`)
  }

  async getRevenueTrend(params?: {
    period?: 'daily' | 'weekly' | 'monthly'
    months?: number
  }): Promise<RevenueTrendResponse> {
    const searchParams = new URLSearchParams()
    if (params?.period) searchParams.set('period', params.period)
    if (params?.months !== undefined) searchParams.set('months', params.months.toString())

    const query = searchParams.toString()
    return this.request<RevenueTrendResponse>(`/analytics/revenue/trend${query ? `?${query}` : ''}`)
  }

  async getCustomerAnalytics(customerId: string): Promise<CustomerAnalytics> {
    return this.request<CustomerAnalytics>(`/analytics/customer/${customerId}/analytics`)
  }

  // Communications API
  async sendCommunication(data: SendCommunicationRequest): Promise<Communication> {
    return this.request<Communication>('/communications/send', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getCommunicationHistory(
    customerId: string,
    params?: {
      skip?: number
      limit?: number
    }
  ): Promise<CommunicationHistoryResponse> {
    const searchParams = new URLSearchParams()
    if (params?.skip !== undefined) searchParams.set('skip', params.skip.toString())
    if (params?.limit !== undefined) searchParams.set('limit', params.limit.toString())

    const query = searchParams.toString()
    return this.request<CommunicationHistoryResponse>(
      `/communications/customer/${customerId}/history${query ? `?${query}` : ''}`
    )
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient()

// Export the class for testing or creating custom instances
export { ApiClient }

// React imports for the hook
import { useState, useEffect } from 'react'

// Convenience hooks and utilities for React components
export const createApiHook = <T>(
  apiCall: () => Promise<T>
) => {
  return () => {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await apiCall()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    useEffect(() => {
      fetchData()
    }, [])

    return { data, loading, error, refetch: fetchData }
  }
}