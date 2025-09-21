'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Users,
  Plus,
  Download,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Building,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Edit,
  Trash,
  Eye,
  Loader2,
  User,
  DollarSign,
  FileText,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { useCustomers, useUpdateCustomer, useDeleteCustomer, useAssessCustomerRisk } from '@/lib/api/hooks'
import { apiClient } from '@/lib/api/client'
import { formatCurrency, formatDate, getInitials, cn } from '@/lib/utils'
import { Customer, UpdateCustomerRequest, SendCommunicationRequest } from '@/types/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import CreateInvoiceDialog from '@/components/CreateInvoiceDialog'
import NewCustomerDialog from '@/components/NewCustomerDialog'

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending' | 'suspended'>('all')
  const [riskFilter, setRiskFilter] = useState('all')
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  // Form states
  const [editFormData, setEditFormData] = useState<UpdateCustomerRequest>({})
  const [messageData, setMessageData] = useState<SendCommunicationRequest>({
    customer_id: '',
    type: 'email',
    subject: '',
    message: ''
  })

  // Loading states
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})

  // API hooks
  const { updateCustomer } = useUpdateCustomer()
  const { deleteCustomer } = useDeleteCustomer()

  const itemsPerPage = 10

  // API calls
  const {
    data: customersData,
    loading: customersLoading,
    error: customersError,
    refetch: refetchCustomers
  } = useCustomers({ skip: (currentPage - 1) * itemsPerPage, limit: itemsPerPage })
  const { assessRisk, loading: assessLoading, error: assessError } = useAssessCustomerRisk()

  const customers = customersData?.customers || []
  const totalPages = customersData ? Math.ceil(customersData.total / itemsPerPage) : 1

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.industry?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter
      const matchesRisk = riskFilter === 'all' || customer.risk_level === riskFilter

      return matchesSearch && matchesStatus && matchesRisk
    })
  }, [customers, searchQuery, statusFilter, riskFilter])

  // Sort customers
  const sortedCustomers = useMemo(() => {
    return [...filteredCustomers].sort((a, b) => {
      if (!sortField) return 0

      let aValue: any = a[sortField as keyof Customer]
      let bValue: any = b[sortField as keyof Customer]

      if (sortField === 'outstanding_amount' || sortField === 'total_invoices') {
        aValue = parseFloat(aValue?.toString() || '0')
        bValue = parseFloat(bValue?.toString() || '0')
      }

      if (sortField === 'created_at' || sortField === 'updated_at') {
        aValue = new Date(aValue)
        bValue = new Date(bValue)
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredCustomers, sortField, sortDirection])

  const displayCustomers = sortedCustomers

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleSelectAll = () => {
    if (selectedCustomers.length === displayCustomers.length) {
      setSelectedCustomers([])
    } else {
      setSelectedCustomers(displayCustomers.map(customer => customer.id))
    }
  }

  const handleSelectCustomer = (id: string) => {
    setSelectedCustomers(prev =>
      prev.includes(id)
        ? prev.filter(customerId => customerId !== id)
        : [...prev, id]
    )
  }

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
        return <Badge variant="outline" className="border-gray-500 text-gray-700">No Data</Badge>
    }
  }

  // Calculate summary statistics
  const totalCustomers = filteredCustomers.length
  const activeCustomers = filteredCustomers.filter(customer => customer.status === 'active').length
  const totalOutstanding = filteredCustomers.reduce((sum, customer) => sum + customer.outstanding_amount, 0)
  const highRiskCustomers = filteredCustomers.filter(customer => customer.risk_level === 'high' || customer.risk_level === 'critical').length

  // Action handlers
  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
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

  const handleDeleteCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setDeleteDialogOpen(true)
  }

  const handleSendMessage = (customer: Customer) => {
    setSelectedCustomer(customer)
    setMessageData({
      customer_id: customer.id,
      type: 'email',
      subject: '',
      message: ''
    })
    setMessageDialogOpen(true)
  }

  const handleCreateInvoice = (customer: Customer) => {
    setSelectedCustomer(customer)
    setInvoiceDialogOpen(true)
  }

  const handleRiskAssessment = async (customer: Customer) => {
    setActionLoading(prev => ({ ...prev, [`risk-${customer.id}`]: true }))
    try {
      const result = await assessRisk(customer.id)
      if (result) {
        const riskLevel = result.risk_level || 'no_data'
        const riskMessages = {
          low: 'This customer has a low risk level. Payment history is good.',
          medium: 'This customer has a medium risk level. Monitor payment patterns.',
          high: 'This customer has a high risk level. Consider payment terms review.',
          critical: 'This customer has a critical risk level. Immediate attention required.',
          no_data: 'Risk level could not be determined for this customer.'
        }

        // Refresh the customers list to show updated risk level
        refetchCustomers()
      } else {
        alert('Failed to assess customer risk. Please try again.')
      }
    } catch (error) {
      console.error('Risk assessment failed:', error)
      alert('Risk assessment failed. Please try again.')
    } finally {
      setActionLoading(prev => ({ ...prev, [`risk-${customer.id}`]: false }))
    }
  }

  const confirmEdit = async () => {
    if (!selectedCustomer) return

    setActionLoading(prev => ({ ...prev, edit: true }))
    try {
      const result = await updateCustomer(selectedCustomer.id, editFormData)
      if (result) {
        setEditDialogOpen(false)
        refetchCustomers()
      }
    } catch (error) {
      console.error('Failed to update customer:', error)
    } finally {
      setActionLoading(prev => ({ ...prev, edit: false }))
    }
  }

  const confirmDelete = async () => {
    if (!selectedCustomer) return

    setActionLoading(prev => ({ ...prev, delete: true }))
    try {
      const result = await deleteCustomer(selectedCustomer.id)
      if (result) {
        setDeleteDialogOpen(false)
        refetchCustomers()
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
  if (customersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading customers...</span>
      </div>
    )
  }

  // Error state
  if (customersError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-red-800">Error Loading Customers</h3>
          <p className="text-red-600 mt-1">{customersError}</p>
          <p className="text-sm text-red-500 mt-2">Please ensure the backend server is running on http://localhost:8001</p>
          <Button className="mt-3" onClick={() => refetchCustomers()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">Manage your customer relationships and profiles</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <NewCustomerDialog
            onCustomerCreated={(customer) => {
              refetchCustomers()
            }}
            triggerButton={
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            }
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-gray-500 mt-1">{activeCustomers} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Active Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCustomers}</div>
            <p className="text-xs text-gray-500 mt-1">
              {totalCustomers > 0 ? Math.round((activeCustomers / totalCustomers) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Outstanding Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalOutstanding)}</div>
            <p className="text-xs text-gray-500 mt-1">Across all customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">High Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{highRiskCustomers}</div>
            <p className="text-xs text-gray-500 mt-1">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>

            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Filter by risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
                <SelectItem value="critical">Critical Risk</SelectItem>
              </SelectContent>
            </Select>

            {selectedCustomers.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Message ({selectedCustomers.length})
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.length === displayCustomers.length && displayCustomers.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center space-x-1 hover:text-gray-900"
                    onClick={() => handleSort('name')}
                  >
                    <span>Customer</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center space-x-1 hover:text-gray-900"
                    onClick={() => handleSort('company')}
                  >
                    <span>Company</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center space-x-1 hover:text-gray-900"
                    onClick={() => handleSort('outstanding_amount')}
                  >
                    <span>Outstanding</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center space-x-1 hover:text-gray-900"
                    onClick={() => handleSort('total_invoices')}
                  >
                    <span>Invoices</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedCustomers.includes(customer.id)}
                      onChange={() => handleSelectCustomer(customer.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-700">
                          {getInitials(customer.name)}
                        </span>
                      </div>
                      <div>
                        <Link href={`/dashboard/customers/${customer.id}`} className="font-medium text-blue-600 hover:text-blue-800">
                          {customer.name}
                        </Link>
                        <p className="text-xs text-gray-500">{customer.email}</p>
                        {customer.phone && (
                          <p className="text-xs text-gray-500">{customer.phone}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{customer.company || 'N/A'}</p>
                      {customer.industry && (
                        <p className="text-xs text-gray-500">{customer.industry}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatCurrency(customer.outstanding_amount)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{customer.total_invoices}</div>
                  </TableCell>
                  <TableCell>{getStatusBadge(customer.status)}</TableCell>
                  <TableCell>{getRiskBadge(customer.risk_level)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Link href={`/dashboard/customers/${customer.id}`} className="flex items-center w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditCustomer(customer)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Customer
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCreateInvoice(customer)}>
                          <FileText className="h-4 w-4 mr-2" />
                          Create Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSendMessage(customer)}>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRiskAssessment(customer)}
                          disabled={actionLoading[`risk-${customer.id}`]}
                        >
                          {actionLoading[`risk-${customer.id}`] ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 mr-2" />
                          )}
                          Assess Risk Level
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteCustomer(customer)}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-gray-500">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, customersData?.total || 0)} of {customersData?.total || 0} customers
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
              Are you sure you want to delete {selectedCustomer?.name}? This action cannot be undone.
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
              Send a message to {selectedCustomer?.name} ({selectedCustomer?.email})
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

      {/* Create Invoice Dialog for Selected Customer */}
      <CreateInvoiceDialog
        open={invoiceDialogOpen}
        onOpenChange={setInvoiceDialogOpen}
        onInvoiceCreated={() => {
          setInvoiceDialogOpen(false)
          refetchCustomers()
        }}
        preSelectedCustomerId={selectedCustomer?.id}
      />
    </div>
  )
}