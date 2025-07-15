"use client"

import { useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Navigation } from "@/components/navigation"
import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  Plus,
  Download,
  CheckCircle,
  AlertCircle,
  X,
  Package,
  Crown,
  FileText,
  Zap,
  Eye
} from "lucide-react"
import Link from "next/link"

interface BulkUploadItem {
  id: string
  title: string
  category: string
  brand: string
  condition: string
  price: number
  originalPrice?: number
  description: string
  images: string[]
  status: 'pending' | 'processing' | 'success' | 'error'
  errorMessage?: string
}

const SAMPLE_CSV_DATA = `Title,Category,Brand,Condition,Price,Original Price,Description,Image URLs
"TaylorMade SIM2 Driver 10.5°","drivers","TaylorMade","Excellent",240,450,"Premium driver in excellent condition","https://example.com/image1.jpg,https://example.com/image2.jpg"
"Callaway Apex Iron Set 4-PW","irons","Callaway","Very Good",480,899,"Professional iron set with minimal wear","https://example.com/image3.jpg,https://example.com/image4.jpg"
"Scotty Cameron Newport 2 Putter","putters","Titleist","Like New",360,450,"Legendary putter with original headcover","https://example.com/image5.jpg"`

export default function BulkUploadPage() {
  const { data: session } = useSession()
  const [uploadMethod, setUploadMethod] = useState<'csv' | 'form'>('csv')
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [uploadItems, setUploadItems] = useState<BulkUploadItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Check if user has access to bulk tools
  const hasAccess = session?.user?.subscription &&
    ['business', 'pga-pro'].includes(session.user.subscription)

  const handleCSVUpload = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string
        const lines = csv.split('\n')
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())

        const items: BulkUploadItem[] = []

        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim())

            const item: BulkUploadItem = {
              id: `item-${i}`,
              title: values[0] || '',
              category: values[1] || '',
              brand: values[2] || '',
              condition: values[3] || '',
              price: parseFloat(values[4]) || 0,
              originalPrice: values[5] ? parseFloat(values[5]) : undefined,
              description: values[6] || '',
              images: values[7] ? values[7].split(',').map(url => url.trim()) : [],
              status: 'pending'
            }

            items.push(item)
          }
        }

        setUploadItems(items)
        setError("")
        setSuccess(`Successfully parsed ${items.length} items from CSV`)
      } catch (err) {
        setError("Failed to parse CSV file. Please check the format.")
      }
    }
    reader.readAsText(file)
  }, [])

  const processBulkUpload = async () => {
    if (uploadItems.length === 0) {
      setError("No items to upload")
      return
    }

    setIsProcessing(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < uploadItems.length; i++) {
        const item = uploadItems[i]

        // Update item status to processing
        setUploadItems(prev => prev.map(p =>
          p.id === item.id ? { ...p, status: 'processing' } : p
        ))

        try {
          // Simulate API call to create product
          await new Promise(resolve => setTimeout(resolve, 1000))

          // In real implementation, call the products API
          const response = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: item.title,
              description: item.description,
              category: item.category,
              brand: item.brand,
              condition: item.condition,
              price: item.price,
              originalPrice: item.originalPrice,
              imageUrls: item.images,
              negotiable: true,
              specifications: {},
              shipping: { available: true },
              location: "UK",
              tags: []
            })
          })

          if (response.ok) {
            setUploadItems(prev => prev.map(p =>
              p.id === item.id ? { ...p, status: 'success' } : p
            ))
          } else {
            throw new Error("Failed to create listing")
          }
        } catch (err) {
          setUploadItems(prev => prev.map(p =>
            p.id === item.id ? {
              ...p,
              status: 'error',
              errorMessage: err instanceof Error ? err.message : 'Unknown error'
            } : p
          ))
        }

        setUploadProgress(((i + 1) / uploadItems.length) * 100)
      }

      const successCount = uploadItems.filter(item => item.status === 'success').length
      const errorCount = uploadItems.filter(item => item.status === 'error').length

      setSuccess(`Bulk upload completed! ${successCount} successful, ${errorCount} failed`)
    } catch (err) {
      setError("Bulk upload failed")
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadSampleCSV = () => {
    const blob = new Blob([SAMPLE_CSV_DATA], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample_bulk_upload.csv'
    a.click()
    URL.revokeObjectURL(url)
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
              <p className="text-gray-600 mb-4">Please sign in to access bulk upload tools.</p>
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
                Bulk upload tools are available for Business and PGA Pro subscribers.
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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/dashboard/seller" className="inline-flex items-center text-primary hover:underline mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                  <Upload className="w-8 h-8 text-primary" />
                  Bulk Upload
                </h1>
                <p className="text-xl text-gray-600">
                  Upload multiple product listings efficiently
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

          {/* Upload Methods */}
          <Tabs defaultValue="csv" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="csv">CSV Upload</TabsTrigger>
              <TabsTrigger value="form">Manual Entry</TabsTrigger>
            </TabsList>

            {/* CSV Upload Tab */}
            <TabsContent value="csv" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5" />
                    CSV Bulk Upload
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Sample CSV Download */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-blue-900">Need a template?</h3>
                        <p className="text-sm text-blue-700">Download our sample CSV to get started</p>
                      </div>
                      <Button onClick={downloadSampleCSV} variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download Sample
                      </Button>
                    </div>
                  </div>

                  {/* File Upload */}
                  <div>
                    <Label htmlFor="csv-upload">Upload CSV File</Label>
                    <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <div className="text-lg font-medium text-gray-900 mb-2">
                        {csvFile ? csvFile.name : "Choose a CSV file or drag and drop"}
                      </div>
                      <p className="text-gray-600 mb-4">CSV files up to 10MB</p>
                      <Input
                        id="csv-upload"
                        type="file"
                        accept=".csv"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setCsvFile(file)
                            handleCSVUpload(file)
                          }
                        }}
                        className="hidden"
                      />
                      <Button
                        onClick={() => document.getElementById('csv-upload')?.click()}
                        variant="outline"
                      >
                        Choose File
                      </Button>
                    </div>
                  </div>

                  {/* CSV Preview */}
                  {uploadItems.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Preview ({uploadItems.length} items)</h3>
                        <Button
                          onClick={processBulkUpload}
                          disabled={isProcessing}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isProcessing ? (
                            <>
                              <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4 mr-2" />
                              Start Upload
                            </>
                          )}
                        </Button>
                      </div>

                      {isProcessing && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Upload Progress</span>
                            <span className="text-sm font-medium">{Math.round(uploadProgress)}%</span>
                          </div>
                          <Progress value={uploadProgress} className="w-full" />
                        </div>
                      )}

                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 p-3 border-b font-medium text-sm grid grid-cols-6 gap-4">
                          <div>Title</div>
                          <div>Category</div>
                          <div>Brand</div>
                          <div>Condition</div>
                          <div>Price</div>
                          <div>Status</div>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {uploadItems.map((item) => (
                            <div key={item.id} className="p-3 border-b grid grid-cols-6 gap-4 items-center text-sm">
                              <div className="font-medium truncate">{item.title}</div>
                              <div className="text-gray-600">{item.category}</div>
                              <div className="text-gray-600">{item.brand}</div>
                              <div className="text-gray-600">{item.condition}</div>
                              <div className="font-medium">£{item.price}</div>
                              <div>
                                {item.status === 'pending' && (
                                  <Badge variant="secondary">Pending</Badge>
                                )}
                                {item.status === 'processing' && (
                                  <Badge className="bg-blue-100 text-blue-800">Processing</Badge>
                                )}
                                {item.status === 'success' && (
                                  <Badge className="bg-green-100 text-green-800">Success</Badge>
                                )}
                                {item.status === 'error' && (
                                  <Badge className="bg-red-100 text-red-800">Error</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Manual Entry Tab */}
            <TabsContent value="form">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Manual Bulk Entry
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Manual Entry Form</h3>
                    <p className="text-gray-600 mb-6">
                      Create multiple listings using an easy-to-use form interface
                    </p>
                    <Button variant="outline">
                      Coming Soon
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
