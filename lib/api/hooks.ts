'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from './client'
import {
  Customer,
  CustomersResponse,
  Invoice,
  InvoicesResponse,
  AnalyticsSummary,
  DashboardAnalytics,
  RevenueTrendResponse,
  CreateCustomerRequest,
  CreateInvoiceRequest,
  UpdateCustomerRequest,
  UpdateInvoiceRequest,
} from '@/types/api'

// Generic hook for API calls
export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiCall()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('API Error:', err)
    } finally {
      setLoading(false)
    }
  }, dependencies)

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Customers hooks
export function useCustomers(params?: {
  skip?: number
  limit?: number
  search?: string
}) {
  return useApi(
    () => apiClient.getCustomers(params),
    [params?.skip, params?.limit, params?.search]
  )
}

export function useCustomer(customerId: string | null) {
  return useApi(
    () => customerId ? apiClient.getCustomer(customerId) : Promise.resolve(null),
    [customerId]
  )
}

export function useCreateCustomer() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createCustomer = async (data: CreateCustomerRequest): Promise<Customer | null> => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiClient.createCustomer(data)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create customer'
      setError(errorMessage)
      console.error('Create customer error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { createCustomer, loading, error }
}

export function useUpdateCustomer() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateCustomer = async (
    customerId: string,
    data: UpdateCustomerRequest
  ): Promise<Customer | null> => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiClient.updateCustomer(customerId, data)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update customer'
      setError(errorMessage)
      console.error('Update customer error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { updateCustomer, loading, error }
}

export function useDeleteCustomer() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteCustomer = async (customerId: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      await apiClient.deleteCustomer(customerId)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete customer'
      setError(errorMessage)
      console.error('Delete customer error:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  return { deleteCustomer, loading, error }
}

export function useAssessCustomerRisk() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const assessRisk = async (customerId: string): Promise<Customer | null> => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiClient.assessCustomerRisk(customerId)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assess customer risk'
      setError(errorMessage)
      console.error('Assess customer risk error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { assessRisk, loading, error }
}

// Invoices hooks
export function useInvoices(params?: {
  customer_id?: string
  status?: 'draft' | 'pending' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  payment_status?: 'unpaid' | 'partial' | 'paid' | 'refunded'
  skip?: number
  limit?: number
}) {
  return useApi(
    () => apiClient.getInvoices(params),
    [
      params?.customer_id,
      params?.status,
      params?.payment_status,
      params?.skip,
      params?.limit,
    ]
  )
}

export function useInvoice(invoiceId: string | null) {
  return useApi(
    () => invoiceId ? apiClient.getInvoice(invoiceId) : Promise.resolve(null),
    [invoiceId]
  )
}

export function useCreateInvoice() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createInvoice = async (data: CreateInvoiceRequest): Promise<Invoice | null> => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiClient.createInvoice(data)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create invoice'
      setError(errorMessage)
      console.error('Create invoice error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { createInvoice, loading, error }
}

export function useUpdateInvoice() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateInvoice = async (
    invoiceId: string,
    data: UpdateInvoiceRequest
  ): Promise<Invoice | null> => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiClient.updateInvoice(invoiceId, data)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update invoice'
      setError(errorMessage)
      console.error('Update invoice error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { updateInvoice, loading, error }
}

export function useDeleteInvoice() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteInvoice = async (invoiceId: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      await apiClient.deleteInvoice(invoiceId)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete invoice'
      setError(errorMessage)
      console.error('Delete invoice error:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  return { deleteInvoice, loading, error }
}

// Analytics hooks
export function useAnalyticsSummary() {
  return useApi(() => apiClient.getAnalyticsSummary())
}

export function useDashboardAnalytics(periodDays: number = 30) {
  return useApi(
    () => apiClient.getDashboardAnalytics(periodDays),
    [periodDays]
  )
}

export function useRevenueTrend(params?: {
  period?: 'daily' | 'weekly' | 'monthly'
  months?: number
}) {
  return useApi(
    () => apiClient.getRevenueTrend(params),
    [params?.period, params?.months]
  )
}

// File upload hook
export function useUploadReceipt() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadReceipt = async (
    file: File,
    invoiceId: string,
    transactionId?: string
  ): Promise<any> => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiClient.uploadReceipt(file, invoiceId, transactionId)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload receipt'
      setError(errorMessage)
      console.error('Upload receipt error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { uploadReceipt, loading, error }
}

// Health check hook
export function useHealthCheck() {
  return useApi(() => apiClient.getHealth())
}

// Custom hook for paginated data
export function usePaginatedData<T>(
  apiCall: (params: { skip: number; limit: number }) => Promise<{ data?: T[]; total: number }>,
  pageSize: number = 20
) {
  const [page, setPage] = useState(0)
  const [allData, setAllData] = useState<T[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return

    try {
      setLoading(true)
      setError(null)
      const result = await apiCall({ skip: page * pageSize, limit: pageSize })
      const newData = result.data || []

      setAllData(prev => [...prev, ...newData])
      setHasMore(newData.length === pageSize)
      setPage(prev => prev + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Load more error:', err)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, hasMore, loading])

  const reset = useCallback(() => {
    setPage(0)
    setAllData([])
    setHasMore(true)
    setError(null)
  }, [])

  useEffect(() => {
    if (allData.length === 0 && hasMore) {
      loadMore()
    }
  }, [])

  return {
    data: allData,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
  }
}