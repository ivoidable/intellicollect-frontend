'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Edit,
  Trash,
  Mail,
  Phone,
  MapPin,
  Building,
  Briefcase,
  Calendar,
  DollarSign,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  TrendingUp,
  MoreHorizontal,
  Plus,
  Send,
  Loader2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { useCustomer, useInvoices, useDeleteCustomer, useUpdateCustomer } from '@/lib/api/hooks'
import { apiClient } from '@/lib/api/client'
import { formatCurrency, formatDate, getInitials, cn } from '@/lib/utils'
import { Customer, SendCommunicationRequest, UpdateCustomerRequest } from '@/types/api'

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
import CreateInvoiceDialog from '@/components/CreateInvoiceDialog'

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const customerId = params.id as string

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)

  // Form states
  const [editFormData, setEditFormData] = useState<UpdateCustomerRequest>({})
  const [messageData, setMessageData] = useState<SendCommunicationRequest>({
    customer_id: customerId,
    type: 'email',
    subject: '',
    message: ''
  })

  // Loading states
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})

  // API hooks
  const { data: customer, loading: customerLoading, error: customerError, refetch } = useCustomer(customerId)
  const { data: invoicesData, loading: invoicesLoading } = useInvoices({
    customer_id: customerId,
    limit: 100
  })
  const { updateCustomer } = useUpdateCustomer()
  const { deleteCustomer } = useDeleteCustomer()

  const invoices = invoicesData?.invoices || []

  // Calculate customer metrics
  const customerMetrics = useMemo(() => {
    if (!customer) return { totalInvoices: 0, totalAmount: 0, paidAmount: 0, outstandingAmount: 0 }

    const totalInvoices = invoices.length
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.total_amount, 0)
    const paidAmount = invoices
      .filter(inv => inv.payment_status === 'paid')
      .reduce((sum, inv) => sum + inv.total_amount, 0)
    const outstandingAmount = customer.outstanding_amount

    return { totalInvoices, totalAmount, paidAmount, outstandingAmount }
  }, [customer, invoices])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100"><XCircle className="h-3 w-3 mr-1" />Inactive</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><AlertTriangle className="h-3 w-3 mr-1" />Suspended</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getRiskBadge = (risk: string | null | undefined) => {
    switch (risk) {
      case 'low':
        return <Badge variant="outline" className="border-green-500 text-green-700">Low Risk</Badge>
      case 'medium':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Medium Risk</Badge>
      case 'high':
        return <Badge variant="outline" className="border-orange-500 text-orange-700">High Risk</Badge>
      case 'critical':
        return <Badge variant="outline" className="border-red-500 text-red-700">Critical Risk</Badge>
      default:
        return <Badge variant="outline" className="border-gray-500 text-gray-700">Not Assessed</Badge>
    }
  }

  const getInvoiceStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Overdue</Badge>
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Draft</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Action handlers
  const handleEditCustomer = () => {
    if (!customer) return
    setEditFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      company: customer.company,
      industry: customer.industry
    })
    setEditDialogOpen(true)
  }

  const handleRiskAssessment = async () => {
    setActionLoading(prev => ({ ...prev, risk: true }))
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert('Risk assessment completed! Check the customer\'s risk level.')
      refetch()
    } catch (error) {
      console.error('Risk assessment failed:', error)
      alert('Risk assessment failed. Please try again.')
    } finally {
      setActionLoading(prev => ({ ...prev, risk: false }))
    }
  }

  const confirmEdit = async () => {
    if (!customer) return

    setActionLoading(prev => ({ ...prev, edit: true }))
    try {
      const result = await updateCustomer(customer.id, editFormData)
      if (result) {
        setEditDialogOpen(false)
        refetch()
      }
    } catch (error) {
      console.error('Failed to update customer:', error)
    } finally {
      setActionLoading(prev => ({ ...prev, edit: false }))
    }
  }

  const confirmDelete = async () => {
    if (!customer) return

    setActionLoading(prev => ({ ...prev, delete: true }))
    try {
      const result = await deleteCustomer(customer.id)
      if (result) {
        router.push('/dashboard/customers')
      }
    } catch (error) {
      console.error('Failed to delete customer:', error)
    } finally {
      setActionLoading(prev => ({ ...prev, delete: false }))
    }
  }

  const confirmSendMessage = async () => {
    setActionLoading(prev => ({ ...prev, message: true }))
    try {
      await apiClient.sendCommunication(messageData)
      setMessageDialogOpen(false)
      alert('Message sent successfully!')
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setActionLoading(prev => ({ ...prev, message: false }))
    }
  }

  // Loading state
  if (customerLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading customer...</span>
      </div>
    )
  }

  // Error state
  if (customerError || !customer) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-red-800">Error Loading Customer</h3>
          <p className="text-red-600 mt-1">{customerError || 'Customer not found'}</p>
          <div className="mt-4">
            <Link href="/dashboard/customers">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Customers
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
          <Link href="/dashboard/customers">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-700">
                {getInitials(customer.name)}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
              <p className="text-gray-600 mt-1">{customer.email}</p>
            </div>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button variant="outline" onClick={() => setMessageDialogOpen(true)}>
            <Send className="h-4 w-4 mr-2" />
            Send Message
          </Button>
          <Button onClick={() => setInvoiceDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
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
              <DropdownMenuItem onClick={handleEditCustomer}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Customer
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleRiskAssessment}
                disabled={actionLoading.risk}
              >
                {actionLoading.risk ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <AlertTriangle className="h-4 w-4 mr-2" />
                )}
                Check Risk
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete Customer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Status and Risk Badges */}
      <div className="flex items-center space-x-4">
        {getStatusBadge(customer.status)}
        {getRiskBadge(customer.risk_level)}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerMetrics.totalInvoices}</div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Billed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(customerMetrics.totalAmount)}</div>
            <p className="text-xs text-gray-500 mt-1">Lifetime value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Amount Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(customerMetrics.paidAmount)}</div>
            <p className="text-xs text-gray-500 mt-1">Collected revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(customerMetrics.outstandingAmount)}</div>
            <p className="text-xs text-gray-500 mt-1">Pending payment</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="invoices">Invoices ({invoices.length})</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>Complete customer details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Contact Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-3" />
                        <span>{customer.email}</span>
                      </div>
                      {customer.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-gray-400 mr-3" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                      {customer.address && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                          <span>{customer.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Business Information</h4>
                    <div className="space-y-3">
                      {customer.company && (
                        <div className="flex items-center">
                          <Building className="h-4 w-4 text-gray-400 mr-3" />
                          <span>{customer.company}</span>
                        </div>
                      )}
                      {customer.industry && (
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 text-gray-400 mr-3" />
                          <span>{customer.industry}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Account Details</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Customer ID</span>
                        <span className="text-sm font-mono">{customer.id}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Created</span>
                        <span className="text-sm">{formatDate(customer.created_at)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Last Updated</span>
                        <span className="text-sm">{formatDate(customer.updated_at)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Status</span>
                        {getStatusBadge(customer.status)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Risk Level</span>
                        {getRiskBadge(customer.risk_level)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Customer Invoices</CardTitle>
              <CardDescription>All invoices for this customer</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {invoicesLoading ? (
                <div className="flex items-center justify-center h-[200px]">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading invoices...</span>
                </div>
              ) : invoices.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.invoice_id}>
                        <TableCell>
                          <Link
                            href={`/dashboard/invoices/${invoice.invoice_id}`}
                            className="font-medium text-blue-600 hover:text-blue-800"
                          >
                            {invoice.invoice_id}
                          </Link>
                        </TableCell>
                        <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                        <TableCell>{formatDate(invoice.due_date)}</TableCell>
                        <TableCell>{formatCurrency(invoice.total_amount)}</TableCell>
                        <TableCell>{getInvoiceStatusBadge(invoice.status)}</TableCell>
                        <TableCell>
                          <Badge variant={invoice.payment_status === 'paid' ? 'default' : 'secondary'}>
                            {invoice.payment_status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No invoices found for this customer</p>
                  <Button className="mt-4" onClick={() => setInvoiceDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Invoice
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications">
          <Card>
            <CardHeader>
              <CardTitle>Communication History</CardTitle>
              <CardDescription>Messages and notifications sent to this customer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Mail className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No communications found</p>
                <Button className="mt-4" onClick={() => setMessageDialogOpen(true)}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Customer Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer information. All changes will be saved to the database.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editFormData.phone || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-company">Company</Label>
                <Input
                  id="edit-company"
                  value={editFormData.company || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={editFormData.address || ''}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-industry">Industry</Label>
              <Input
                id="edit-industry"
                value={editFormData.industry || ''}
                onChange={(e) => setEditFormData({ ...editFormData, industry: e.target.value })}
              />
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

      {/* Delete Customer Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {customer?.name}? This action cannot be undone.
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
                'Delete Customer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
            <DialogDescription>
              Send a message to {customer?.name} ({customer?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message-type">Type</Label>
              <Select
                value={messageData.type}
                onValueChange={(value) => setMessageData({ ...messageData, type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {messageData.type === 'email' && (
              <div className="space-y-2">
                <Label htmlFor="message-subject">Subject</Label>
                <Input
                  id="message-subject"
                  value={messageData.subject || ''}
                  onChange={(e) => setMessageData({ ...messageData, subject: e.target.value })}
                  placeholder="Enter email subject"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="message-content">Message</Label>
              <textarea
                id="message-content"
                className="w-full p-3 border border-gray-300 rounded-md resize-none"
                rows={4}
                value={messageData.message}
                onChange={(e) => setMessageData({ ...messageData, message: e.target.value })}
                placeholder="Enter your message"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageDialogOpen(false)} disabled={actionLoading.message}>
              Cancel
            </Button>
            <Button onClick={confirmSendMessage} disabled={actionLoading.message || !messageData.message.trim()}>
              {actionLoading.message ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Message'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Invoice Dialog */}
      <CreateInvoiceDialog
        open={invoiceDialogOpen}
        onOpenChange={setInvoiceDialogOpen}
        onInvoiceCreated={() => {
          setInvoiceDialogOpen(false)
          refetch()
        }}
        preSelectedCustomerId={customer?.id}
      />
    </div>
  )
}