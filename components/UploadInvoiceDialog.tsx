'use client'

import { useState, useEffect } from 'react'
import { Upload, Loader2, FileText, User, Plus, Check, AlertCircle } from 'lucide-react'
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
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCustomers, useCreateCustomer } from '@/lib/api/hooks'
import { CreateCustomerRequest } from '@/types/api'

interface UploadInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvoiceUploaded?: () => void
}

export default function UploadInvoiceDialog({ open, onOpenChange, onInvoiceUploaded }: UploadInvoiceDialogProps) {
  const [step, setStep] = useState<'upload' | 'customer-selection' | 'new-customer'>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
  const [newCustomerData, setNewCustomerData] = useState<CreateCustomerRequest>({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    industry: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // API hooks
  const { data: customersData, loading: customersLoading } = useCustomers({ limit: 100 })
  const { createCustomer, loading: creatingCustomer } = useCreateCustomer()

  const customers = customersData?.customers || []

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setStep('upload')
      setSelectedFile(null)
      setUploadProgress(0)
      setUploading(false)
      setSelectedCustomerId('')
      setNewCustomerData({
        name: '',
        email: '',
        phone: '',
        company: '',
        address: '',
        industry: ''
      })
      setErrors({})
    }
  }, [open])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && (file.type === 'application/pdf' || file.type.startsWith('image/'))) {
      setSelectedFile(file)
    } else {
      alert('Please select a PDF or image file')
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setUploadProgress(0)

    try {
      // Simulate file upload with progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Simulate API call to extract invoice data
      await new Promise(resolve => setTimeout(resolve, 2000))

      setUploadProgress(100)
      setStep('customer-selection')
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const validateNewCustomer = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!newCustomerData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!newCustomerData.email.trim()) {
      newErrors.email = 'Email is required'
    }
    if (newCustomerData.email && !/\S+@\S+\.\S+/.test(newCustomerData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreateCustomer = async () => {
    if (!validateNewCustomer()) return

    try {
      const customer = await createCustomer(newCustomerData)
      if (customer) {
        setSelectedCustomerId(customer.id)
        handleFinalSubmit(customer.id)
      }
    } catch (error) {
      console.error('Failed to create customer:', error)
      alert('Failed to create customer. Please try again.')
    }
  }

  const handleFinalSubmit = async (customerId?: string) => {
    const finalCustomerId = customerId || selectedCustomerId
    if (!finalCustomerId || !selectedFile) return

    try {
      // Here you would actually process the invoice with the selected customer
      // For now, we'll simulate it
      console.log('Processing invoice for customer:', finalCustomerId)
      console.log('File:', selectedFile.name)

      await new Promise(resolve => setTimeout(resolve, 1000))

      onInvoiceUploaded?.()
      onOpenChange(false)
      alert('Invoice uploaded and processed successfully!')
    } catch (error) {
      console.error('Failed to process invoice:', error)
      alert('Failed to process invoice. Please try again.')
    }
  }

  const renderUploadStep = () => (
    <>
      <DialogHeader>
        <DialogTitle>Upload Invoice</DialogTitle>
        <DialogDescription>
          Upload a PDF or image file of your invoice. We'll extract the data automatically.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Click to upload or drag and drop
              </span>
              <span className="block text-xs text-gray-500 mt-1">
                PDF, PNG, JPG up to 10MB
              </span>
            </label>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileSelect}
            />
          </div>
        </div>

        {selectedFile && (
          <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600 mr-3" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">{selectedFile.name}</p>
              <p className="text-xs text-blue-700">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        )}

        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
          Cancel
        </Button>
        <Button onClick={handleFileUpload} disabled={!selectedFile || uploading}>
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            'Upload & Extract Data'
          )}
        </Button>
      </DialogFooter>
    </>
  )

  const renderCustomerSelectionStep = () => (
    <>
      <DialogHeader>
        <DialogTitle>Select Customer</DialogTitle>
        <DialogDescription>
          Choose an existing customer or create a new one for this invoice.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Select existing customer</Label>
          <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
            <SelectTrigger>
              <SelectValue placeholder={customersLoading ? "Loading customers..." : "Choose a customer"} />
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
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => setStep('new-customer')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Customer
        </Button>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => setStep('upload')}>
          Back
        </Button>
        <Button onClick={() => handleFinalSubmit()} disabled={!selectedCustomerId}>
          Process Invoice
        </Button>
      </DialogFooter>
    </>
  )

  const renderNewCustomerStep = () => (
    <>
      <DialogHeader>
        <DialogTitle>Create New Customer</DialogTitle>
        <DialogDescription>
          Enter the customer details for this invoice.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={newCustomerData.name}
              onChange={(e) => setNewCustomerData({ ...newCustomerData, name: e.target.value })}
              placeholder="Customer name"
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={newCustomerData.email}
              onChange={(e) => setNewCustomerData({ ...newCustomerData, email: e.target.value })}
              placeholder="customer@example.com"
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={newCustomerData.phone}
              onChange={(e) => setNewCustomerData({ ...newCustomerData, phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={newCustomerData.company}
              onChange={(e) => setNewCustomerData({ ...newCustomerData, company: e.target.value })}
              placeholder="Company name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={newCustomerData.address}
            onChange={(e) => setNewCustomerData({ ...newCustomerData, address: e.target.value })}
            placeholder="Full address"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Input
            id="industry"
            value={newCustomerData.industry}
            onChange={(e) => setNewCustomerData({ ...newCustomerData, industry: e.target.value })}
            placeholder="e.g., Technology, Healthcare, Finance"
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => setStep('customer-selection')}>
          Back
        </Button>
        <Button onClick={handleCreateCustomer} disabled={creatingCustomer}>
          {creatingCustomer ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            'Create & Process Invoice'
          )}
        </Button>
      </DialogFooter>
    </>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        {step === 'upload' && renderUploadStep()}
        {step === 'customer-selection' && renderCustomerSelectionStep()}
        {step === 'new-customer' && renderNewCustomerStep()}
      </DialogContent>
    </Dialog>
  )
}