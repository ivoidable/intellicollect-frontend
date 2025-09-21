'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Edit,
  Trash,
  Download,
  Send,
  Eye,
  Calendar,
  DollarSign,
  User,
  Building,
  Mail,
  Phone,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  MoreHorizontal,
  Loader2,
  Copy,
  CreditCard,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'

import { useInvoice, useCustomer, useDeleteInvoice, useUpdateInvoice } from '@/lib/api/hooks'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { Invoice, UpdateInvoiceRequest } from '@/types/api'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const invoiceId = params.id as string

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Form states
  const [editFormData, setEditFormData] = useState<UpdateInvoiceRequest>({})

  // Loading states
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})

  // API hooks
  const { data: invoice, loading: invoiceLoading, error: invoiceError, refetch } = useInvoice(invoiceId)
  const { data: customer, loading: customerLoading } = useCustomer(invoice?.customer_id || null)
  const { updateInvoice } = useUpdateInvoice()
  const { deleteInvoice } = useDeleteInvoice()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><AlertTriangle className="h-3 w-3 mr-1" />Overdue</Badge>
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100"><FileText className="h-3 w-3 mr-1" />Draft</Badge>
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><Send className="h-3 w-3 mr-1" />Sent</Badge>
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>
      case 'unpaid':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="h-3 w-3 mr-1" />Unpaid</Badge>
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="h-3 w-3 mr-1" />Partial</Badge>
      case 'refunded':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100"><ArrowLeft className="h-3 w-3 mr-1" />Refunded</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Calculate days overdue
  const daysOverdue = useMemo(() => {
    if (!invoice || invoice.status !== 'overdue') return null
    const dueDate = new Date(invoice.due_date)
    const now = new Date()
    return Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
  }, [invoice])

  // Action handlers
  const handleEditInvoice = () => {
    if (!invoice) return
    setEditFormData({
      invoice_date: invoice.invoice_date,
      due_date: invoice.due_date,
      amount: invoice.amount,
      total_amount: invoice.total_amount,
      currency: invoice.currency,
      status: invoice.status,
      payment_status: invoice.payment_status
    })
    setEditDialogOpen(true)
  }

  const handleDownloadInvoice = () => {
    // Simulate PDF download
    alert('Downloading invoice PDF...')
  }

  const handleSendInvoice = () => {
    // Simulate sending invoice
    alert('Invoice sent to customer!')
  }

  const handleCopyInvoiceId = () => {
    if (invoice?.invoice_id) {
      navigator.clipboard.writeText(invoice.invoice_id)
      alert('Invoice ID copied to clipboard!')
    }
  }

  const confirmEdit = async () => {
    if (!invoice) return

    setActionLoading(prev => ({ ...prev, edit: true }))
    try {
      const result = await updateInvoice(invoice.id, editFormData)
      if (result) {
        setEditDialogOpen(false)
        refetch()
      }
    } catch (error) {
      console.error('Failed to update invoice:', error)
    } finally {
      setActionLoading(prev => ({ ...prev, edit: false }))
    }
  }

  const confirmDelete = async () => {
    if (!invoice) return

    setActionLoading(prev => ({ ...prev, delete: true }))
    try {
      const result = await deleteInvoice(invoice.id)
      if (result) {
        router.push('/dashboard/invoices')
      }
    } catch (error) {
      console.error('Failed to delete invoice:', error)
    } finally {
      setActionLoading(prev => ({ ...prev, delete: false }))
    }
  }

  // Loading state
  if (invoiceLoading || customerLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading invoice...</span>
      </div>
    )
  }

  // Error state
  if (invoiceError || !invoice) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-red-800">Error Loading Invoice</h3>
          <p className="text-red-600 mt-1">{invoiceError || 'Invoice not found'}</p>
          <div className="mt-4">
            <Link href="/dashboard/invoices">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Invoices
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/invoices">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-gray-900">{invoice.invoice_id}</h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyInvoiceId}
                className="h-8 w-8"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-gray-600 mt-1">
              {customer ? `Invoice for ${customer.name}` : 'Loading customer...'}
            </p>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button variant="outline" onClick={handleDownloadInvoice}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={handleSendInvoice}>
            <Send className="h-4 w-4 mr-2" />
            Send Invoice
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleEditInvoice}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Invoice
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyInvoiceId}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Invoice ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete Invoice
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Status and Alert */}
      <div className="flex items-center space-x-4">
        {getStatusBadge(invoice.status)}
        {getPaymentStatusBadge(invoice.payment_status)}
        {daysOverdue && (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {daysOverdue} days overdue
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Invoice Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Invoice ID</span>
                      <span className="text-sm font-mono">{invoice.invoice_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Invoice Date</span>
                      <span className="text-sm">{formatDate(invoice.invoice_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Due Date</span>
                      <span className="text-sm">{formatDate(invoice.due_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Currency</span>
                      <span className="text-sm">{invoice.currency}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Status Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Status</span>
                      {getStatusBadge(invoice.status)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Payment Status</span>
                      {getPaymentStatusBadge(invoice.payment_status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Created</span>
                      <span className="text-sm">{formatDate(invoice.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last Updated</span>
                      <span className="text-sm">{formatDate(invoice.updated_at)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Amount Breakdown */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">Amount Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Subtotal</span>
                    <span className="text-sm">{formatCurrency(invoice.amount)}</span>
                  </div>
                  {invoice.total_amount !== invoice.amount && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Additional Charges</span>
                      <span className="text-sm">{formatCurrency(invoice.total_amount - invoice.amount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-medium">Total Amount</span>
                    <span className="font-bold text-lg">{formatCurrency(invoice.total_amount)}</span>
                  </div>
                  {invoice.outstanding_amount > 0 && (
                    <div className="flex justify-between text-orange-600">
                      <span className="font-medium">Outstanding</span>
                      <span className="font-bold">{formatCurrency(invoice.outstanding_amount)}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          {invoice.payment_date && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Payment Date</span>
                    <span className="text-sm">{formatDate(invoice.payment_date)}</span>
                  </div>
                  {invoice.payment_reference && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Reference</span>
                      <span className="text-sm font-mono">{invoice.payment_reference}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          {customer && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Link
                    href={`/dashboard/customers/${customer.id}`}
                    className="font-medium text-blue-600 hover:text-blue-800"
                  >
                    {customer.name}
                  </Link>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{customer.email}</span>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.company && (
                    <div className="flex items-center text-sm">
                      <Building className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{customer.company}</span>
                    </div>
                  )}
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Invoices</span>
                    <span>{customer.total_invoices}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Outstanding</span>
                    <span className="font-medium text-orange-600">
                      {formatCurrency(customer.outstanding_amount)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={handleDownloadInvoice}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={handleSendInvoice}>
                <Send className="h-4 w-4 mr-2" />
                Send to Customer
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={handleEditInvoice}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Invoice
              </Button>
              {customer && (
                <Link href={`/dashboard/customers/${customer.id}`} className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="h-4 w-4 mr-2" />
                    View Customer
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Invoice Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
            <DialogDescription>
              Update invoice information. Changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-invoice-date">Invoice Date</Label>
                <Input
                  id="edit-invoice-date"
                  type="date"
                  value={editFormData.invoice_date || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, invoice_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-due-date">Due Date</Label>
                <Input
                  id="edit-due-date"
                  type="date"
                  value={editFormData.due_date || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, due_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-amount">Amount</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  step="0.01"
                  value={editFormData.amount || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-total-amount">Total Amount</Label>
                <Input
                  id="edit-total-amount"
                  type="number"
                  step="0.01"
                  value={editFormData.total_amount || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, total_amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-currency">Currency</Label>
                <Select
                  value={editFormData.currency || ''}
                  onValueChange={(value) => setEditFormData({ ...editFormData, currency: value })}
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
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editFormData.status || ''}
                  onValueChange={(value) => setEditFormData({ ...editFormData, status: value as any })}
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
                <Label htmlFor="edit-payment-status">Payment Status</Label>
                <Select
                  value={editFormData.payment_status || ''}
                  onValueChange={(value) => setEditFormData({ ...editFormData, payment_status: value as any })}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={actionLoading.edit}>
              Cancel
            </Button>
            <Button onClick={confirmEdit} disabled={actionLoading.edit}>
              {actionLoading.edit ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Invoice Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete invoice {invoice?.invoice_id}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={actionLoading.delete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={actionLoading.delete}>
              {actionLoading.delete ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Invoice'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}