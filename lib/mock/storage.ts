// Local Storage utilities for mock data persistence
import {
  Customer,
  Invoice,
  Payment,
  Communication,
  CreateCustomerRequest,
  CreateInvoiceRequest,
  CreatePaymentRequest,
  SendCommunicationRequest,
  UpdateCustomerRequest,
  UpdateInvoiceRequest
} from '@/types/api'

import {
  mockCustomers,
  mockInvoices,
  mockPayments,
  mockCommunications,
  generateId,
  getCurrentDate,
  addDays
} from './data'

// Storage keys
const STORAGE_KEYS = {
  customers: 'intellicollect_customers',
  invoices: 'intellicollect_invoices',
  payments: 'intellicollect_payments',
  communications: 'intellicollect_communications',
  initialized: 'intellicollect_initialized'
} as const

// Type for storage keys
type StorageKey = keyof typeof STORAGE_KEYS

// Generic storage utilities
class MockStorage {
  private getStorageKey(key: StorageKey): string {
    return STORAGE_KEYS[key]
  }

  private getFromStorage<T>(key: StorageKey): T[] {
    if (typeof window === 'undefined') return []

    try {
      const data = localStorage.getItem(this.getStorageKey(key))
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error)
      return []
    }
  }

  private saveToStorage<T>(key: StorageKey, data: T[]): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(this.getStorageKey(key), JSON.stringify(data))
    } catch (error) {
      console.error(`Error saving to localStorage (${key}):`, error)
    }
  }

  // Initialize storage with mock data if not already done
  initializeStorage(): void {
    if (typeof window === 'undefined') return

    const initialized = localStorage.getItem(this.getStorageKey('initialized'))
    if (!initialized) {
      this.saveToStorage('customers', mockCustomers)
      this.saveToStorage('invoices', mockInvoices)
      this.saveToStorage('payments', mockPayments)
      this.saveToStorage('communications', mockCommunications)
      localStorage.setItem(this.getStorageKey('initialized'), 'true')
    }
  }

  // Clear all mock data
  clearStorage(): void {
    if (typeof window === 'undefined') return

    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  }

  // Customer operations
  getCustomers(): Customer[] {
    return this.getFromStorage<Customer>('customers')
  }

  getCustomer(id: string): Customer | null {
    const customers = this.getCustomers()
    return customers.find(c => c.id === id) || null
  }

  createCustomer(data: CreateCustomerRequest): Customer {
    const customers = this.getCustomers()
    const newCustomer: Customer = {
      id: generateId('cust'),
      ...data,
      status: 'active',
      risk_level: 'low',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_date: getCurrentDate(),
      total_invoices: 0,
      outstanding_amount: 0,
      payment_history: 'New customer - no payment history'
    }

    customers.push(newCustomer)
    this.saveToStorage('customers', customers)
    return newCustomer
  }

  updateCustomer(id: string, data: UpdateCustomerRequest): Customer | null {
    const customers = this.getCustomers()
    const index = customers.findIndex(c => c.id === id)

    if (index === -1) return null

    customers[index] = {
      ...customers[index],
      ...data,
      updated_at: new Date().toISOString()
    }

    this.saveToStorage('customers', customers)
    return customers[index]
  }

  deleteCustomer(id: string): boolean {
    const customers = this.getCustomers()
    const index = customers.findIndex(c => c.id === id)

    if (index === -1) return false

    customers.splice(index, 1)
    this.saveToStorage('customers', customers)
    return true
  }

  // Invoice operations
  getInvoices(): Invoice[] {
    return this.getFromStorage<Invoice>('invoices')
  }

  getInvoice(id: string): Invoice | null {
    const invoices = this.getInvoices()
    return invoices.find(i => i.invoice_id === id) || null
  }

  createInvoice(data: CreateInvoiceRequest): Invoice {
    const invoices = this.getInvoices()
    const newInvoice: Invoice = {
      invoice_id: generateId('inv'),
      ...data,
      currency: data.currency || 'USD',
      status: data.status || 'draft',
      payment_status: data.payment_status || 'unpaid',
      risk_level: 'low',
      risk_score: 10,
      created_timestamp: new Date().toISOString(),
      paid_amount: 0,
      outstanding_amount: data.total_amount,
      reminder_count: 0
    }

    invoices.push(newInvoice)
    this.saveToStorage('invoices', invoices)
    this.updateCustomerInvoiceCount(data.customer_id)
    return newInvoice
  }

  updateInvoice(id: string, data: UpdateInvoiceRequest): Invoice | null {
    const invoices = this.getInvoices()
    const index = invoices.findIndex(i => i.invoice_id === id)

    if (index === -1) return null

    const oldAmount = invoices[index].outstanding_amount
    invoices[index] = {
      ...invoices[index],
      ...data
    }

    // Update outstanding amount based on payment status
    if (data.payment_status === 'paid') {
      invoices[index].paid_amount = invoices[index].total_amount
      invoices[index].outstanding_amount = 0
      invoices[index].payment_date = getCurrentDate()
      invoices[index].payment_reference = generateId('pay')
    }

    this.saveToStorage('invoices', invoices)

    // Update customer outstanding amount
    const amountChange = invoices[index].outstanding_amount - oldAmount
    this.updateCustomerOutstanding(invoices[index].customer_id, amountChange)

    return invoices[index]
  }

  deleteInvoice(id: string): boolean {
    const invoices = this.getInvoices()
    const index = invoices.findIndex(i => i.invoice_id === id)

    if (index === -1) return false

    const invoice = invoices[index]
    invoices.splice(index, 1)
    this.saveToStorage('invoices', invoices)

    // Update customer totals
    this.updateCustomerInvoiceCount(invoice.customer_id)
    this.updateCustomerOutstanding(invoice.customer_id, -invoice.outstanding_amount)

    return true
  }

  // Payment operations
  getPayments(): Payment[] {
    return this.getFromStorage<Payment>('payments')
  }

  getInvoicePayments(invoiceId: string): Payment[] {
    const payments = this.getPayments()
    const invoice = this.getInvoice(invoiceId)
    if (!invoice) return []

    return payments.filter(p => p.customer_id === invoice.customer_id)
  }

  createPayment(data: CreatePaymentRequest): Payment {
    const payments = this.getPayments()
    const newPayment: Payment = {
      id: generateId('pay'),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    payments.push(newPayment)
    this.saveToStorage('payments', payments)
    return newPayment
  }

  // Communication operations
  getCommunications(): Communication[] {
    return this.getFromStorage<Communication>('communications')
  }

  getCustomerCommunications(customerId: string): Communication[] {
    const communications = this.getCommunications()
    return communications.filter(c => c.customer_id === customerId)
  }

  sendCommunication(data: SendCommunicationRequest): Communication {
    const communications = this.getCommunications()
    const newCommunication: Communication = {
      id: generateId('comm'),
      ...data,
      status: 'sent',
      sent_at: new Date().toISOString(),
      delivered_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    }

    communications.push(newCommunication)
    this.saveToStorage('communications', communications)
    return newCommunication
  }

  // Helper methods for updating customer aggregates
  private updateCustomerInvoiceCount(customerId: string): void {
    const customers = this.getCustomers()
    const invoices = this.getInvoices()
    const customerIndex = customers.findIndex(c => c.id === customerId)

    if (customerIndex !== -1) {
      const customerInvoices = invoices.filter(i => i.customer_id === customerId)
      customers[customerIndex].total_invoices = customerInvoices.length
      customers[customerIndex].outstanding_amount = customerInvoices.reduce(
        (sum, invoice) => sum + invoice.outstanding_amount, 0
      )
      customers[customerIndex].updated_at = new Date().toISOString()
      this.saveToStorage('customers', customers)
    }
  }

  private updateCustomerOutstanding(customerId: string, amountChange: number): void {
    const customers = this.getCustomers()
    const customerIndex = customers.findIndex(c => c.id === customerId)

    if (customerIndex !== -1) {
      customers[customerIndex].outstanding_amount += amountChange
      customers[customerIndex].updated_at = new Date().toISOString()
      this.saveToStorage('customers', customers)
    }
  }

  // Risk assessment (mock implementation)
  assessCustomerRisk(customerId: string): Customer | null {
    const customer = this.getCustomer(customerId)
    if (!customer) return null

    const invoices = this.getInvoices().filter(i => i.customer_id === customerId)
    const overdue = invoices.filter(i => i.status === 'overdue').length
    const total = invoices.length

    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'

    if (total > 0) {
      const overdueRatio = overdue / total
      if (overdueRatio > 0.7) riskLevel = 'critical'
      else if (overdueRatio > 0.4) riskLevel = 'high'
      else if (overdueRatio > 0.2) riskLevel = 'medium'
    }

    return this.updateCustomer(customerId, { risk_level: riskLevel })
  }
}

// Export singleton instance
export const mockStorage = new MockStorage()

// Initialize on import if in browser
if (typeof window !== 'undefined') {
  mockStorage.initializeStorage()
}