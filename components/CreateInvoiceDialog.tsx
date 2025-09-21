'use client'

import { useState, useEffect } from 'react'
import { Plus, Loader2, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCustomers, useCreateInvoice } from '@/lib/api/hooks'
import { CreateInvoiceRequest } from '@/types/api'

interface CreateInvoiceDialogProps {
  onInvoiceCreated?: () => void
  preSelectedCustomerId?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function CreateInvoiceDialog({ onInvoiceCreated, preSelectedCustomerId, open: controlledOpen, onOpenChange }: CreateInvoiceDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  const [formData, setFormData] = useState<CreateInvoiceRequest>({
    customer_id: '',
    invoice_date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    due_date: '',
    amount: 0,
    total_amount: 0,
    currency: 'USD',
    status: 'draft',
    payment_status: 'unpaid'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // API hooks
  const { data: customersData, loading: customersLoading } = useCustomers({ limit: 100 })
  const { createInvoice, loading: creating, error: createError } = useCreateInvoice()

  const customers = customersData?.customers || []

  // Set default due date to 30 days from invoice date
  useEffect(() => {
    if (formData.invoice_date) {
      const invoiceDate = new Date(formData.invoice_date)
      const dueDate = new Date(invoiceDate)
      dueDate.setDate(dueDate.getDate() + 30)
      setFormData(prev => ({
        ...prev,
        due_date: dueDate.toISOString().split('T')[0]
      }))
    }
  }, [formData.invoice_date])

  // Update total amount when amount changes (adding potential tax or fees)
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      total_amount: prev.amount
    }))
  }, [formData.amount])

  // Pre-select customer when preSelectedCustomerId is provided
  useEffect(() => {
    if (preSelectedCustomerId) {
      setFormData(prev => ({
        ...prev,
        customer_id: preSelectedCustomerId
      }))
    }
  }, [preSelectedCustomerId])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.customer_id) {
      newErrors.customer_id = 'Please select a customer'
    }
    if (!formData.invoice_date) {
      newErrors.invoice_date = 'Invoice date is required'
    }
    if (!formData.due_date) {
      newErrors.due_date = 'Due date is required'
    }
    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }
    if (new Date(formData.due_date) < new Date(formData.invoice_date)) {
      newErrors.due_date = 'Due date must be after invoice date'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const result = await createInvoice(formData)
      if (result) {
        // Reset form
        setFormData({
          customer_id: '',
          invoice_date: new Date().toISOString().split('T')[0],
          due_date: '',
          amount: 0,
          total_amount: 0,
          currency: 'USD',
          status: 'draft',
          payment_status: 'unpaid'
        })
        setErrors({})
        setOpen(false)
        onInvoiceCreated?.()
      }
    } catch (error) {
      console.error('Failed to create invoice:', error)
    }
  }

  const handleInputChange = (field: keyof CreateInvoiceRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
          <DialogDescription>
            Create a new invoice for your customer. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Selection */}
          <div className="space-y-2">
            <Label htmlFor="customer">Customer *</Label>
            <Select
              value={formData.customer_id}
              onValueChange={(value) => handleInputChange('customer_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={customersLoading ? "Loading customers..." : "Select a customer"} />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{customer.name}</span>
                      <span className="text-sm text-gray-500">{customer.email}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.customer_id && <p className="text-sm text-red-600">{errors.customer_id}</p>}
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoice_date">Invoice Date *</Label>
              <Input
                id="invoice_date"
                type="date"
                value={formData.invoice_date}
                onChange={(e) => handleInputChange('invoice_date', e.target.value)}
              />
              {errors.invoice_date && <p className="text-sm text-red-600">{errors.invoice_date}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date *</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
              />
              {errors.due_date && <p className="text-sm text-red-600">{errors.due_date}</p>}
            </div>
          </div>

          {/* Amount Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount || ''}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
              {errors.amount && <p className="text-sm text-red-600">{errors.amount}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_amount">Total Amount *</Label>
              <Input
                id="total_amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.total_amount || ''}
                onChange={(e) => handleInputChange('total_amount', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500">Include taxes, fees, etc.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleInputChange('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="CAD">CAD ($)</SelectItem>
                  <SelectItem value="MYR">MYR (RM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Invoice Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_status">Payment Status</Label>
              <Select
                value={formData.payment_status}
                onValueChange={(value) => handleInputChange('payment_status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Error Display */}
          {createError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{createError}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Invoice
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}