"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  FileText,
  Plus,
  Download,
  Upload,
  Search,
  Filter,
  MoreHorizontal,
  Send,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Printer,
  Mail,
  Copy,
  Trash,
  Edit,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useInvoices, useCustomers } from "@/lib/api/hooks"
import { formatCurrency, formatDate, calculateDaysOverdue, cn } from "@/lib/utils"
import { Invoice, Customer } from "@/types/api"
import CreateInvoiceDialog from "@/components/CreateInvoiceDialog"

// Mock invoice data
const mockInvoices = [
  {
    id: "INV-2024-001",
    customer: "Acme Corporation",
    customerEmail: "billing@acme.com",
    amount: 5420.00,
    dueDate: "2024-02-15",
    status: "paid",
    riskLevel: "low",
    createdAt: "2024-01-15",
    items: 3,
    daysOverdue: 0,
  },
  {
    id: "INV-2024-002",
    customer: "Tech Solutions Inc",
    customerEmail: "accounts@techsolutions.com",
    amount: 3200.00,
    dueDate: "2024-02-20",
    status: "pending",
    riskLevel: "medium",
    createdAt: "2024-01-20",
    items: 2,
    daysOverdue: 0,
  },
  {
    id: "INV-2024-003",
    customer: "Global Enterprises",
    customerEmail: "finance@global.com",
    amount: 8750.50,
    dueDate: "2024-01-30",
    status: "overdue",
    riskLevel: "high",
    createdAt: "2024-01-01",
    items: 5,
    daysOverdue: 15,
  },
  {
    id: "INV-2024-004",
    customer: "Startup Hub",
    customerEmail: "pay@startuphub.io",
    amount: 1500.00,
    dueDate: "2024-02-28",
    status: "draft",
    riskLevel: "low",
    createdAt: "2024-01-25",
    items: 1,
    daysOverdue: 0,
  },
  {
    id: "INV-2024-005",
    customer: "Digital Agency Co",
    customerEmail: "billing@digitalagency.com",
    amount: 12300.00,
    dueDate: "2024-02-10",
    status: "pending",
    riskLevel: "medium",
    createdAt: "2024-01-10",
    items: 7,
    daysOverdue: 0,
  },
  {
    id: "INV-2024-006",
    customer: "Retail Mart",
    customerEmail: "accounts@retailmart.com",
    amount: 4567.89,
    dueDate: "2024-01-25",
    status: "overdue",
    riskLevel: "critical",
    createdAt: "2023-12-25",
    items: 4,
    daysOverdue: 20,
  },
  {
    id: "INV-2024-007",
    customer: "Cloud Services Ltd",
    customerEmail: "finance@cloudservices.com",
    amount: 9999.99,
    dueDate: "2024-03-01",
    status: "pending",
    riskLevel: "low",
    createdAt: "2024-02-01",
    items: 3,
    daysOverdue: 0,
  },
  {
    id: "INV-2024-008",
    customer: "Manufacturing Inc",
    customerEmail: "ap@manufacturing.com",
    amount: 15750.00,
    dueDate: "2024-02-05",
    status: "paid",
    riskLevel: "low",
    createdAt: "2024-01-05",
    items: 10,
    daysOverdue: 0,
  },
]

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "pending" | "sent" | "paid" | "overdue" | "cancelled">("all")
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const itemsPerPage = 10

  // API calls
  const {
    data: invoicesData,
    loading: invoicesLoading,
    error: invoicesError,
    refetch: refetchInvoices
  } = useInvoices({ skip: (currentPage - 1) * itemsPerPage, limit: itemsPerPage })

  const { data: customersData } = useCustomers()

  // Create customer lookup map
  const customerMap = useMemo(() => {
    if (!customersData?.customers) return new Map()
    return new Map(customersData.customers.map(customer => [customer.id, customer]))
  }, [customersData])

  const invoices = invoicesData?.invoices || []
  const totalPages = invoicesData ? Math.ceil(invoicesData.total / itemsPerPage) : 1

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const customer = customerMap.get(invoice.customer_id)
      const matchesSearch =
        invoice.invoice_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer?.email.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [invoices, customerMap, searchQuery, statusFilter])

  // Sort invoices
  const sortedInvoices = useMemo(() => {
    return [...filteredInvoices].sort((a, b) => {
      if (!sortField) return 0

      let aValue: any = a[sortField as keyof Invoice]
      let bValue: any = b[sortField as keyof Invoice]

      if (sortField === "total_amount" || sortField === "amount") {
        aValue = parseFloat(aValue.toString())
        bValue = parseFloat(bValue.toString())
      }

      if (sortField === "due_date" || sortField === "invoice_date" || sortField === "created_timestamp") {
        aValue = new Date(aValue)
        bValue = new Date(bValue)
      }

      if (sortField === "customer") {
        const customerA = customerMap.get(a.customer_id)
        const customerB = customerMap.get(b.customer_id)
        aValue = customerA?.name || ""
        bValue = customerB?.name || ""
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }, [filteredInvoices, sortField, sortDirection, customerMap])

  // Use sorted invoices for display (pagination handled by API)
  const displayInvoices = sortedInvoices

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleSelectAll = () => {
    if (selectedInvoices.length === displayInvoices.length) {
      setSelectedInvoices([])
    } else {
      setSelectedInvoices(displayInvoices.map(inv => inv.invoice_id))
    }
  }

  const handleSelectInvoice = (id: string) => {
    setSelectedInvoices(prev =>
      prev.includes(id)
        ? prev.filter(invId => invId !== id)
        : [...prev, id]
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case "sent":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><Send className="h-3 w-3 mr-1" />Sent</Badge>
      case "overdue":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="h-3 w-3 mr-1" />Overdue</Badge>
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100"><FileText className="h-3 w-3 mr-1" />Draft</Badge>
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }


  const exportToCSV = () => {
    const csvData = filteredInvoices.map(invoice => {
      const customer = customerMap.get(invoice.customer_id)
      return {
        'Invoice ID': invoice.invoice_id,
        'Customer': customer?.name || 'Unknown',
        'Customer Email': customer?.email || '',
        'Amount': invoice.total_amount,
        'Currency': invoice.currency,
        'Status': invoice.status,
        'Payment Status': invoice.payment_status,
        'Invoice Date': invoice.invoice_date,
        'Due Date': invoice.due_date,
        'Paid Amount': invoice.paid_amount,
        'Outstanding Amount': invoice.outstanding_amount,
        'Created': invoice.created_timestamp
      }
    })

    const headers = Object.keys(csvData[0] || {})
    const csvContent = [
      headers.join(','),
      ...csvData.map(row =>
        headers.map(header => {
          const value = row[header as keyof typeof row]
          // Escape quotes and wrap in quotes if contains comma
          return typeof value === 'string' && value.includes(',')
            ? `"${value.replace(/"/g, '""')}"`
            : value
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `invoices-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Calculate summary statistics
  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.total_amount, 0)
  const overdueAmount = filteredInvoices
    .filter(inv => inv.status === "overdue")
    .reduce((sum, inv) => sum + inv.total_amount, 0)
  const pendingAmount = filteredInvoices
    .filter(inv => inv.status === "pending" || inv.status === "sent")
    .reduce((sum, inv) => sum + inv.total_amount, 0)

  // Loading state
  if (invoicesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading invoices...</span>
      </div>
    )
  }

  // Error state
  if (invoicesError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-red-800">Error Loading Invoices</h3>
          <p className="text-red-600 mt-1">{invoicesError}</p>
          <p className="text-sm text-red-500 mt-2">Please ensure the backend server is running on http://localhost:8001</p>
          <Button className="mt-3" onClick={() => refetchInvoices()}>
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
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-1">Manage and track all your invoices</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <CreateInvoiceDialog onInvoiceCreated={refetchInvoices} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-gray-500 mt-1">{filteredInvoices.length} invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Overdue Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(overdueAmount)}</div>
            <p className="text-xs text-gray-500 mt-1">
              {filteredInvoices.filter(inv => inv.status === "overdue").length} invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</div>
            <p className="text-xs text-gray-500 mt-1">
              {filteredInvoices.filter(inv => inv.status === "pending").length} invoices
            </p>
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
                  placeholder="Search invoices..."
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
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>


            {selectedInvoices.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Send className="h-4 w-4 mr-2" />
                  Send Reminders ({selectedInvoices.length})
                </Button>
                <Button variant="outline" size="sm">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invoice Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedInvoices.length === displayInvoices.length && displayInvoices.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center space-x-1 hover:text-gray-900"
                    onClick={() => handleSort("id")}
                  >
                    <span>Invoice</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center space-x-1 hover:text-gray-900"
                    onClick={() => handleSort("customer")}
                  >
                    <span>Customer</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center space-x-1 hover:text-gray-900"
                    onClick={() => handleSort("amount")}
                  >
                    <span>Amount</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center space-x-1 hover:text-gray-900"
                    onClick={() => handleSort("dueDate")}
                  >
                    <span>Due Date</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayInvoices.map((invoice) => {
                const customer = customerMap.get(invoice.customer_id)
                const daysOverdue = invoice.status === 'overdue' ? calculateDaysOverdue(invoice.due_date) : 0

                return (
                  <TableRow key={invoice.invoice_id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedInvoices.includes(invoice.invoice_id)}
                        onChange={() => handleSelectInvoice(invoice.invoice_id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell>
                      <Link href={`/dashboard/invoices/${invoice.invoice_id}`} className="font-medium text-blue-600 hover:text-blue-800">
                        {invoice.invoice_id}
                      </Link>
                      <p className="text-xs text-gray-500">Created {formatDate(invoice.invoice_date)}</p>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{customer?.name || 'Unknown Customer'}</p>
                        <p className="text-xs text-gray-500">{customer?.email || 'No email'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatCurrency(invoice.total_amount, invoice.currency)}</div>
                      <p className="text-xs text-gray-500">Paid: {formatCurrency(invoice.paid_amount, invoice.currency)}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{formatDate(invoice.due_date)}</span>
                      </div>
                      {daysOverdue > 0 && (
                        <p className="text-xs text-red-600 mt-1">{daysOverdue} days overdue</p>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
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
                            <Link href={`/dashboard/invoices/${invoice.invoice_id}`} className="flex items-center w-full">
                              <FileText className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Reminder
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-gray-500">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, invoicesData?.total || 0)} of {invoicesData?.total || 0} invoices
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
    </div>
  )
}