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

import { mockApiClient } from '@/lib/mock/api-client'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend.newvisions.pro/api'
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'https://backend.newvisions.pro'
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = endpoint.startsWith('/api')
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
    if (USE_MOCK_DATA) {
      return mockApiClient.getHealth()
    }
    return this.request<HealthResponse>('/health')
  }

  async getInfo(): Promise<HealthResponse> {
    if (USE_MOCK_DATA) {
      return mockApiClient.getInfo()
    }
    return this.request<HealthResponse>('/')
  }

  // Customers API
  async getCustomers(params?: {
    skip?: number
    limit?: number
    search?: string
  }): Promise<CustomersResponse> {
    if (USE_MOCK_DATA) {
      return mockApiClient.getCustomers(params)
    }
    const searchParams = new URLSearchParams()
    if (params?.skip !== undefined) searchParams.set('skip', params.skip.toString())
    if (params?.limit !== undefined) searchParams.set('limit', params.limit.toString())
    if (params?.search) searchParams.set('search', params.search)

    const query = searchParams.toString()
    return this.request<CustomersResponse>(`/customers/${query ? `?${query}` : ''}`)
  }

  async getCustomer(customerId: string): Promise<Customer> {
    if (USE_MOCK_DATA) {
      return mockApiClient.getCustomer(customerId)
    }
    return this.request<Customer>(`/customers/${customerId}`)
  }

  async createCustomer(data: CreateCustomerRequest): Promise<Customer> {
    if (USE_MOCK_DATA) {
      return mockApiClient.createCustomer(data)
    }
    return this.request<Customer>('/customers/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateCustomer(customerId: string, data: UpdateCustomerRequest): Promise<Customer> {
    if (USE_MOCK_DATA) {
      return mockApiClient.updateCustomer(customerId, data)
    }
    return this.request<Customer>(`/customers/${customerId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteCustomer(customerId: string): Promise<void> {
    if (USE_MOCK_DATA) {
      return mockApiClient.deleteCustomer(customerId)
    }
    return this.request<void>(`/customers/${customerId}`, {
      method: 'DELETE',
    })
  }

  async assessCustomerRisk(customerId: string): Promise<Customer> {
    if (USE_MOCK_DATA) {
      return mockApiClient.assessCustomerRisk(customerId)
    }
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
    if (USE_MOCK_DATA) {
      return mockApiClient.getInvoices(params)
    }
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
    if (USE_MOCK_DATA) {
      return mockApiClient.getInvoice(invoiceId)
    }
    return this.request<Invoice>(`/invoices/${invoiceId}`)
  }

  async createInvoice(data: CreateInvoiceRequest): Promise<Invoice> {
    if (USE_MOCK_DATA) {
      return mockApiClient.createInvoice(data)
    }
    return this.request<Invoice>('/invoices/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateInvoice(invoiceId: string, data: UpdateInvoiceRequest): Promise<Invoice> {
    if (USE_MOCK_DATA) {
      return mockApiClient.updateInvoice(invoiceId, data)
    }
    return this.request<Invoice>(`/invoices/${invoiceId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteInvoice(invoiceId: string): Promise<void> {
    if (USE_MOCK_DATA) {
      return mockApiClient.deleteInvoice(invoiceId)
    }
    return this.request<void>(`/invoices/${invoiceId}`, {
      method: 'DELETE',
    })
  }

  // Payments API
  async createPayment(data: CreatePaymentRequest): Promise<Payment> {
    if (USE_MOCK_DATA) {
      return mockApiClient.createPayment(data)
    }
    return this.request<Payment>('/payments/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getInvoicePayments(invoiceId: string): Promise<PaymentsResponse> {
    if (USE_MOCK_DATA) {
      return mockApiClient.getInvoicePayments(invoiceId)
    }
    return this.request<PaymentsResponse>(`/payments/invoice/${invoiceId}/payments`)
  }

  async uploadReceipt(file: File, invoiceId: string, transactionId?: string): Promise<any> {
    if (USE_MOCK_DATA) {
      return mockApiClient.uploadReceipt(file, invoiceId, transactionId)
    }
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
    if (USE_MOCK_DATA) {
      return mockApiClient.getAnalyticsSummary()
    }
    return this.request<AnalyticsSummary>('/analytics/summary')
  }

  async getDashboardAnalytics(periodDays: number = 30): Promise<DashboardAnalytics> {
    if (USE_MOCK_DATA) {
      return mockApiClient.getDashboardAnalytics(periodDays)
    }
    return this.request<DashboardAnalytics>(`/analytics/dashboard?period_days=${periodDays}`)
  }

  async getRevenueTrend(params?: {
    period?: 'daily' | 'weekly' | 'monthly'
    months?: number
  }): Promise<RevenueTrendResponse> {
    if (USE_MOCK_DATA) {
      return mockApiClient.getRevenueTrend(params)
    }
    const searchParams = new URLSearchParams()
    if (params?.period) searchParams.set('period', params.period)
    if (params?.months !== undefined) searchParams.set('months', params.months.toString())

    const query = searchParams.toString()
    return this.request<RevenueTrendResponse>(`/analytics/revenue/trend${query ? `?${query}` : ''}`)
  }

  async getCustomerAnalytics(customerId: string): Promise<CustomerAnalytics> {
    if (USE_MOCK_DATA) {
      return mockApiClient.getCustomerAnalytics(customerId)
    }
    return this.request<CustomerAnalytics>(`/analytics/customer/${customerId}/analytics`)
  }

  // Communications API
  async sendCommunication(data: SendCommunicationRequest): Promise<Communication> {
    if (USE_MOCK_DATA) {
      return mockApiClient.sendCommunication(data)
    }
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
    if (USE_MOCK_DATA) {
      return mockApiClient.getCommunicationHistory(customerId, params)
    }
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
