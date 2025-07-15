"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Navigation } from "@/components/navigation"
import {
  ArrowLeft,
  Target,
  Play,
  Pause,
  Trash2,
  Copy,
  Archive,
  Star,
  CheckCircle,
  AlertCircle,
  Package,
  Crown,
  Search,
  RefreshCw,
  Eye,
  Zap,
  AlertTriangle
} from "lucide-react"
import Link from "next/link"

interface ProductListing {
  id: string
  title: string
  category: string
  brand: string
  condition: string
  price: number
  originalPrice?: number
  status: 'active' | 'draft' | 'sold' | 'pending' | 'archived'
  featured: boolean
  createdAt: string
  views: number
  watchers: number
  selected?: boolean
}

// Mock data
const mockListings: ProductListing[] = [
  {
    id: "1",
    title: "TaylorMade SIM2 Driver - 10.5° Regular Flex",
    category: "drivers",
    brand: "TaylorMade",
    condition: "Excellent",
    price: 240,
    originalPrice: 450,
    status: "active",
    featured: false,
    createdAt: "2025-01-10T10:30:00Z",
    views: 127,
    watchers: 8
  },
  {
    id: "2",
    title: "Callaway Apex Iron Set 4-PW",
    category: "irons",
    brand: "Callaway",
    condition: "Very Good",
    price: 480,
    originalPrice: 899,
    status: "draft",
    featured: true,
    createdAt: "2025-01-08T15:45:00Z",
    views: 89,
    watchers: 12
  },
  {
    id: "3",
    title: "Scotty Cameron Newport 2 Putter",
    category: "putters",
    brand: "Titleist",
    condition: "Like New",
    price: 360,
    originalPrice: 450,
    status: "active",
    featured: false,
    createdAt: "2025-01-05T09:20:00Z",
    views: 156,
    watchers: 15
  },
  {
    id: "4",
    title: "Ping G425 Max Driver",
    category: "drivers",
    brand: "Ping",
    condition: "Excellent",
    price: 320,
    status: "archived",
    featured: false,
    createdAt: "2025-01-03T14:10:00Z",
    views: 67,
    watchers: 3
  }
]

type BatchOperation =
  | 'activate'
  | 'deactivate'
  | 'archive'
  | 'delete'
  | 'feature'
  | 'unfeature'
  | 'duplicate'

const BATCH_OPERATIONS = [
  {
    id: 'activate' as BatchOperation,
    label: 'Activate Listings',
    description: 'Make selected draft/archived listings active and visible',
    icon: Play,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    confirmRequired: false
  },
  {
    id: 'deactivate' as BatchOperation,
    label: 'Deactivate Listings',
    description: 'Convert active listings to draft status',
    icon: Pause,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    confirmRequired: true
  },
  {
    id: 'archive' as BatchOperation,
    label: 'Archive Listings',
    description: 'Move listings to archived status (hidden from all views)',
    icon: Archive,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    confirmRequired: true
  },
  {
    id: 'delete' as BatchOperation,
    label: 'Delete Listings',
    description: 'Permanently delete selected listings (cannot be undone)',
    icon: Trash2,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    confirmRequired: true,
    dangerous: true
  },
  {
    id: 'feature' as BatchOperation,
    label: 'Add Featured Status',
    description: 'Mark selected listings as featured for better visibility',
    icon: Star,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    confirmRequired: false
  },
  {
    id: 'unfeature' as BatchOperation,
    label: 'Remove Featured Status',
    description: 'Remove featured status from selected listings',
    icon: Star,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    confirmRequired: false
  },
  {
    id: 'duplicate' as BatchOperation,
    label: 'Duplicate Listings',
    description: 'Create copies of selected listings as drafts',
    icon: Copy,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    confirmRequired: false
  }
]

export default function BatchOperationsPage() {
  const { data: session } = useSession()
  const [listings, setListings] = useState<ProductListing[]>(mockListings)
  const [selectedListings, setSelectedListings] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedOperation, setSelectedOperation] = useState<BatchOperation | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Check if user has access to bulk tools
  const hasAccess = session?.user?.subscription &&
    ['business', 'pga-pro'].includes(session.user.subscription)

  // Filter listings
  const filteredListings = listings.filter(listing => {
    const matchesSearch = !searchQuery ||
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.brand.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = filterStatus === "all" || listing.status === filterStatus

    return matchesSearch && matchesStatus
  })

  // Handle listing selection
  const toggleListingSelection = (listingId: string) => {
    setSelectedListings(prev =>
      prev.includes(listingId)
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId]
    )
  }

  const selectAllFiltered = () => {
    const filteredIds = filteredListings.map(l => l.id)
    setSelectedListings(filteredIds)
  }

  const clearSelection = () => {
    setSelectedListings([])
  }

  // Execute batch operation
  const executeBatchOperation = async (operation: BatchOperation) => {
    if (selectedListings.length === 0) {
      setError("Please select at least one listing")
      return
    }

    const operationConfig = BATCH_OPERATIONS.find(op => op.id === operation)

    if (operationConfig?.confirmRequired) {
      setSelectedOperation(operation)
      setShowConfirmDialog(true)
      return
    }

    await performOperation(operation)
  }

  const performOperation = async (operation: BatchOperation) => {
    setIsProcessing(true)
    setError("")
    setShowConfirmDialog(false)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Apply operation to selected listings
      setListings(prev => {
        let updatedListings = [...prev]

        switch (operation) {
          case 'activate':
            updatedListings = updatedListings.map(listing =>
              selectedListings.includes(listing.id)
                ? { ...listing, status: 'active' as const }
                : listing
            )
            break

          case 'deactivate':
            updatedListings = updatedListings.map(listing =>
              selectedListings.includes(listing.id)
                ? { ...listing, status: 'draft' as const }
                : listing
            )
            break

          case 'archive':
            updatedListings = updatedListings.map(listing =>
              selectedListings.includes(listing.id)
                ? { ...listing, status: 'archived' as const }
                : listing
            )
            break

          case 'delete':
            updatedListings = updatedListings.filter(listing =>
              !selectedListings.includes(listing.id)
            )
            break

          case 'feature':
            updatedListings = updatedListings.map(listing =>
              selectedListings.includes(listing.id)
                ? { ...listing, featured: true }
                : listing
            )
            break

          case 'unfeature':
            updatedListings = updatedListings.map(listing =>
              selectedListings.includes(listing.id)
                ? { ...listing, featured: false }
                : listing
            )
            break

          case 'duplicate':
            const duplicates = updatedListings
              .filter(listing => selectedListings.includes(listing.id))
              .map(listing => ({
                ...listing,
                id: `${listing.id}-copy-${Date.now()}`,
                title: `${listing.title} (Copy)`,
                status: 'draft' as const,
                featured: false,
                views: 0,
                watchers: 0,
                createdAt: new Date().toISOString()
              }))
            updatedListings = [...updatedListings, ...duplicates]
            break
        }

        return updatedListings
      })

      const operationLabel = BATCH_OPERATIONS.find(op => op.id === operation)?.label
      setSuccess(`Successfully ${operationLabel?.toLowerCase()} ${selectedListings.length} listing${selectedListings.length !== 1 ? 's' : ''}`)
      setSelectedListings([])
      setSelectedOperation(null)
    } catch (err) {
      setError("Operation failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusBadge = (status: ProductListing['status']) => {
    const statusConfig = {
      active: { label: 'Active', className: 'bg-green-100 text-green-800' },
      draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800' },
      sold: { label: 'Sold', className: 'bg-blue-100 text-blue-800' },
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      archived: { label: 'Archived', className: 'bg-purple-100 text-purple-800' }
    }

    const config = statusConfig[status]
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
              <p className="text-gray-600 mb-4">Please sign in to access batch operations.</p>
              <Button asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Business+ Access Required</h2>
              <p className="text-gray-600 mb-4">
                Batch operations are available for Business and PGA Pro subscribers.
              </p>
              <Button asChild>
                <Link href="/subscription">Upgrade Now</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/dashboard/seller" className="inline-flex items-center text-primary hover:underline mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                  <Target className="w-8 h-8 text-primary" />
                  Batch Operations
                </h1>
                <p className="text-xl text-gray-600">
                  Perform bulk actions on multiple listings
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-500 text-white">
                  <Crown className="w-3 h-3 mr-1" />
                  Business+
                </Badge>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}

          {/* Batch Operations Panel */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Available Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {BATCH_OPERATIONS.map((operation) => (
                  <Button
                    key={operation.id}
                    variant="outline"
                    className={`h-auto p-4 flex flex-col items-center gap-2 text-left hover:shadow-md transition-all ${
                      operation.dangerous ? 'hover:border-red-300' : ''
                    }`}
                    onClick={() => executeBatchOperation(operation.id)}
                    disabled={isProcessing || selectedListings.length === 0}
                  >
                    <div className={`w-12 h-12 rounded-full ${operation.bgColor} flex items-center justify-center`}>
                      <operation.icon className={`w-6 h-6 ${operation.color}`} />
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-sm">{operation.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{operation.description}</div>
                    </div>
                    {operation.dangerous && (
                      <Badge className="bg-red-100 text-red-800 text-xs">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Permanent
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>

              {selectedListings.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Select listings below to enable batch operations</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Listings Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your Listings ({filteredListings.length})</CardTitle>
                <div className="flex items-center gap-2">
                  {selectedListings.length > 0 && (
                    <Badge className="bg-blue-100 text-blue-800">
                      {selectedListings.length} selected
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectedListings.length === filteredListings.length ? clearSelection : selectAllFiltered}
                  >
                    {selectedListings.length === filteredListings.length ? "Deselect All" : "Select All"}
                  </Button>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex gap-4 mt-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search listings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="w-12 p-4">
                        <Checkbox
                          checked={selectedListings.length === filteredListings.length && filteredListings.length > 0}
                          onCheckedChange={() => selectedListings.length === filteredListings.length ? clearSelection() : selectAllFiltered()}
                        />
                      </th>
                      <th className="text-left p-4 font-medium">Listing</th>
                      <th className="text-left p-4 font-medium">Category</th>
                      <th className="text-left p-4 font-medium">Condition</th>
                      <th className="text-left p-4 font-medium">Price</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Stats</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredListings.map((listing) => (
                      <tr
                        key={listing.id}
                        className={`border-b hover:bg-gray-50 transition-colors ${
                          selectedListings.includes(listing.id) ? 'bg-blue-50' : ''
                        }`}
                      >
                        <td className="p-4">
                          <Checkbox
                            checked={selectedListings.includes(listing.id)}
                            onCheckedChange={() => toggleListingSelection(listing.id)}
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="font-medium">{listing.title}</div>
                              <div className="text-sm text-gray-600">{listing.brand}</div>
                            </div>
                            {listing.featured && (
                              <Badge className="bg-yellow-500 text-white text-xs">
                                <Star className="w-3 h-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-gray-600 capitalize">{listing.category}</td>
                        <td className="p-4 text-gray-600">{listing.condition}</td>
                        <td className="p-4">
                          <div className="font-bold">£{listing.price}</div>
                          {listing.originalPrice && (
                            <div className="text-sm text-gray-500 line-through">£{listing.originalPrice}</div>
                          )}
                        </td>
                        <td className="p-4">
                          {getStatusBadge(listing.status)}
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {listing.views}
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {listing.watchers} watching
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredListings.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No listings found</h3>
                    <p className="text-gray-600 mb-6">
                      Try adjusting your search criteria or create new listings.
                    </p>
                    <Button asChild>
                      <Link href="/sell/new">Create New Listing</Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Confirmation Dialog */}
          <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  Confirm Batch Operation
                </DialogTitle>
                <DialogDescription>
                  {selectedOperation && (
                    <div className="space-y-4">
                      <p>
                        Are you sure you want to <strong>{BATCH_OPERATIONS.find(op => op.id === selectedOperation)?.label.toLowerCase()}</strong> {selectedListings.length} listing{selectedListings.length !== 1 ? 's' : ''}?
                      </p>

                      {selectedOperation === 'delete' && (
                        <Alert className="border-red-200 bg-red-50">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <AlertDescription className="text-red-700">
                            <strong>Warning:</strong> This action cannot be undone. Deleted listings will be permanently removed.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => selectedOperation && performOperation(selectedOperation)}
                  disabled={isProcessing}
                  className={selectedOperation === 'delete' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
