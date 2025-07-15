"use client"

import { useState, useEffect, useCallback } from "react"
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Navigation } from "@/components/navigation"
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  PoundSterling,
  Calendar,
  TrendingUp,
  Copy,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Target,
  Percent,
  Clock,
  GraduationCap,
  Crown,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"

interface StudentDiscount {
  id: string
  code: string
  name: string
  description?: string
  discountType: string
  discountValue: number
  minPurchase?: number
  maxDiscount?: number
  usageLimit?: number
  usageCount: number
  perStudentLimit?: number
  validFrom: string
  validUntil?: string
  isActive: boolean
  requiresStudentVerification: boolean
  allowedInstitutions?: string[]
  totalUsages: number
  recentUsages: Array<{
    id: string
    discountAmount: number
    purchaseAmount: number
    usedAt: string
    student: {
      id: string
      name: string
      email: string
    }
  }>
  createdAt: string
  updatedAt: string
}

interface DiscountForm {
  code: string
  name: string
  description: string
  discountType: string
  discountValue: string
  minPurchase: string
  maxDiscount: string
  usageLimit: string
  perStudentLimit: string
  validUntil: string
  requiresStudentVerification: boolean
  allowedInstitutions: string
}

const INSTITUTIONS = [
  "University of St Andrews",
  "Edinburgh University",
  "Glasgow University",
  "University of Aberdeen",
  "Heriot-Watt University",
  "University of Stirling",
  "Robert Gordon University",
  "University of Dundee",
  "University of Strathclyde",
  "Glasgow Caledonian University"
]

export default function StudentDiscountsPage() {
  const { data: session, status } = useSession()
  const [discounts, setDiscounts] = useState<StudentDiscount[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("active")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState<StudentDiscount | null>(null)
  const [copiedCode, setCopiedCode] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState<DiscountForm>({
    code: "",
    name: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minPurchase: "",
    maxDiscount: "",
    usageLimit: "",
    perStudentLimit: "",
    validUntil: "",
    requiresStudentVerification: true,
    allowedInstitutions: ""
  })

  const fetchDiscounts = useCallback(async (status = "active") => {
    try {
      const response = await fetch(`/api/pga/student-discounts?status=${status}`)
      const data = await response.json()

      if (response.ok) {
        setDiscounts(data.discounts)
      } else {
        setError(data.error || "Failed to fetch discounts")
      }
    } catch (error) {
      setError("Failed to fetch discounts")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session?.user?.id) {
      fetchDiscounts(activeTab)
    }
  }, [session, activeTab, fetchDiscounts])

  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const response = await fetch("/api/pga/student-discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          allowedInstitutions: formData.allowedInstitutions ?
            formData.allowedInstitutions.split(",").map(s => s.trim()) : null
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Student discount created successfully!")
        setShowCreateForm(false)
        resetForm()
        fetchDiscounts(activeTab)
      } else {
        setError(data.error || "Failed to create discount")
      }
    } catch (error) {
      setError("Failed to create discount")
    }
  }

  const handleUpdateDiscount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDiscount) return

    setError("")

    try {
      const response = await fetch(`/api/pga/student-discounts/${editingDiscount.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          allowedInstitutions: formData.allowedInstitutions ?
            formData.allowedInstitutions.split(",").map(s => s.trim()) : null
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Student discount updated successfully!")
        setEditingDiscount(null)
        resetForm()
        fetchDiscounts(activeTab)
      } else {
        setError(data.error || "Failed to update discount")
      }
    } catch (error) {
      setError("Failed to update discount")
    }
  }

  const handleDeleteDiscount = async (discountId: string) => {
    if (!confirm("Are you sure you want to delete this discount? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/pga/student-discounts/${discountId}`, {
        method: "DELETE"
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Student discount deleted successfully!")
        fetchDiscounts(activeTab)
      } else {
        setError(data.error || "Failed to delete discount")
      }
    } catch (error) {
      setError("Failed to delete discount")
    }
  }

  const toggleDiscountStatus = async (discount: StudentDiscount) => {
    try {
      const response = await fetch(`/api/pga/student-discounts/${discount.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !discount.isActive })
      })

      if (response.ok) {
        setSuccess(`Discount ${discount.isActive ? 'deactivated' : 'activated'} successfully!`)
        fetchDiscounts(activeTab)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to update discount")
      }
    } catch (error) {
      setError("Failed to update discount")
    }
  }

  const copyDiscountCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(""), 2000)
  }

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      minPurchase: "",
      maxDiscount: "",
      usageLimit: "",
      perStudentLimit: "",
      validUntil: "",
      requiresStudentVerification: true,
      allowedInstitutions: ""
    })
  }

  const startEdit = (discount: StudentDiscount) => {
    setFormData({
      code: discount.code,
      name: discount.name,
      description: discount.description || "",
      discountType: discount.discountType,
      discountValue: discount.discountValue.toString(),
      minPurchase: discount.minPurchase?.toString() || "",
      maxDiscount: discount.maxDiscount?.toString() || "",
      usageLimit: discount.usageLimit?.toString() || "",
      perStudentLimit: discount.perStudentLimit?.toString() || "",
      validUntil: discount.validUntil ? new Date(discount.validUntil).toISOString().split('T')[0] : "",
      requiresStudentVerification: discount.requiresStudentVerification,
      allowedInstitutions: discount.allowedInstitutions?.join(", ") || ""
    })
    setEditingDiscount(discount)
  }

  const formatDiscountValue = (discount: StudentDiscount) => {
    if (discount.discountType === "percentage") {
      return `${discount.discountValue}%`
    } else {
      return `£${discount.discountValue}`
    }
  }

  const getDiscountStatus = (discount: StudentDiscount) => {
    if (!discount.isActive) return { label: "Inactive", color: "bg-gray-100 text-gray-800" }
    if (discount.validUntil && new Date(discount.validUntil) < new Date()) {
      return { label: "Expired", color: "bg-red-100 text-red-800" }
    }
    if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
      return { label: "Used Up", color: "bg-orange-100 text-orange-800" }
    }
    return { label: "Active", color: "bg-green-100 text-green-800" }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse max-w-6xl mx-auto">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">PGA Pro Access Required</h2>
              <p className="text-gray-600 mb-4">
                Please sign in with your PGA Professional account to manage student discounts.
              </p>
              <Link href="/auth/signin">
                <Button>Sign In</Button>
              </Link>
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
            <Link href="/pga/dashboard" className="inline-flex items-center text-primary hover:underline mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to PGA Dashboard
            </Link>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                  <GraduationCap className="w-8 h-8 text-primary" />
                  Student Discounts
                </h1>
                <p className="text-xl text-gray-600">
                  Create and manage exclusive discounts for golf students
                </p>
              </div>

              <Button
                onClick={() => setShowCreateForm(true)}
                className="px-6"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Discount
              </Button>
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

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">Active Discounts</TabsTrigger>
              <TabsTrigger value="inactive">Inactive Discounts</TabsTrigger>
              <TabsTrigger value="expired">Expired Discounts</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : discounts.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No {activeTab} discounts found</h3>
                    <p className="text-gray-600 mb-6">
                      {activeTab === "active"
                        ? "Create your first student discount to start helping golf students save money."
                        : `You don't have any ${activeTab} discounts yet.`
                      }
                    </p>
                    {activeTab === "active" && (
                      <Button onClick={() => setShowCreateForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Discount
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {discounts.map((discount) => {
                    const status = getDiscountStatus(discount)

                    return (
                      <Card key={discount.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={status.color}>
                                  {status.label}
                                </Badge>
                                {discount.requiresStudentVerification && (
                                  <Badge variant="outline" className="text-xs">
                                    <GraduationCap className="w-3 h-3 mr-1" />
                                    Verified Only
                                  </Badge>
                                )}
                              </div>
                              <h3 className="font-semibold text-lg">{discount.name}</h3>
                            </div>

                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyDiscountCode(discount.code)}
                                className="h-8 w-8 p-0"
                              >
                                {copiedCode === discount.code ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Discount Code */}
                          <div className="bg-gray-50 rounded-lg p-3 mb-4">
                            <div className="text-xs text-gray-500 mb-1">Discount Code</div>
                            <div className="font-mono font-bold text-lg">{discount.code}</div>
                          </div>

                          {/* Discount Value */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Percent className="w-4 h-4 text-primary" />
                              <span className="font-medium">Discount</span>
                            </div>
                            <span className="text-lg font-bold text-primary">
                              {formatDiscountValue(discount)}
                            </span>
                          </div>

                          {/* Usage Stats */}
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Usage</span>
                              <span className="font-medium">
                                {discount.usageCount}
                                {discount.usageLimit ? ` / ${discount.usageLimit}` : ''}
                              </span>
                            </div>

                            {discount.validUntil && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Expires</span>
                                <span className="font-medium">
                                  {new Date(discount.validUntil).toLocaleDateString()}
                                </span>
                              </div>
                            )}

                            {discount.minPurchase && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Min Purchase</span>
                                <span className="font-medium">£{discount.minPurchase}</span>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEdit(discount)}
                              className="flex-1"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleDiscountStatus(discount)}
                              className="flex-1"
                            >
                              {discount.isActive ? "Deactivate" : "Activate"}
                            </Button>

                            {discount.usageCount === 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteDiscount(discount.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>

                          {/* Recent Usage */}
                          {discount.recentUsages.length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                              <div className="text-xs text-gray-500 mb-2">Recent Usage</div>
                              <div className="space-y-1">
                                {discount.recentUsages.slice(0, 2).map((usage) => (
                                  <div key={usage.id} className="text-xs text-gray-600">
                                    {usage.student.name} saved £{usage.discountAmount.toFixed(2)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Create/Edit Discount Dialog */}
          <Dialog open={showCreateForm || !!editingDiscount} onOpenChange={(open) => {
            if (!open) {
              setShowCreateForm(false)
              setEditingDiscount(null)
              resetForm()
              setError("")
            }
          }}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingDiscount ? "Edit Student Discount" : "Create Student Discount"}
                </DialogTitle>
                <DialogDescription>
                  {editingDiscount
                    ? "Update your existing student discount."
                    : "Create a new discount code for golf students. Students will need to verify their status to use this discount."
                  }
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={editingDiscount ? handleUpdateDiscount : handleCreateDiscount} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code">Discount Code *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder="STUDENT20"
                      disabled={!!editingDiscount}
                      required
                      className="mt-1"
                    />
                    {!editingDiscount && (
                      <p className="text-xs text-gray-500 mt-1">
                        Code will be converted to uppercase
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="name">Display Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Student Discount 20%"
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Special discount for verified golf students"
                    rows={2}
                    className="mt-1"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="discountType">Discount Type *</Label>
                    <Select value={formData.discountType} onValueChange={(value) => setFormData(prev => ({ ...prev, discountType: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="discountValue">
                      Discount Value * {formData.discountType === "percentage" ? "(%)" : "(£)"}
                    </Label>
                    <Input
                      id="discountValue"
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) => setFormData(prev => ({ ...prev, discountValue: e.target.value }))}
                      placeholder={formData.discountType === "percentage" ? "20" : "10"}
                      min="0"
                      max={formData.discountType === "percentage" ? "100" : undefined}
                      step={formData.discountType === "percentage" ? "1" : "0.01"}
                      required
                      className="mt-1"
                    />
                  </div>

                  {formData.discountType === "percentage" && (
                    <div>
                      <Label htmlFor="maxDiscount">Max Discount (£)</Label>
                      <Input
                        id="maxDiscount"
                        type="number"
                        value={formData.maxDiscount}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxDiscount: e.target.value }))}
                        placeholder="50"
                        min="0"
                        step="0.01"
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="minPurchase">Min Purchase (£)</Label>
                    <Input
                      id="minPurchase"
                      type="number"
                      value={formData.minPurchase}
                      onChange={(e) => setFormData(prev => ({ ...prev, minPurchase: e.target.value }))}
                      placeholder="25"
                      min="0"
                      step="0.01"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="usageLimit">Total Usage Limit</Label>
                    <Input
                      id="usageLimit"
                      type="number"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: e.target.value }))}
                      placeholder="100"
                      min="1"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="perStudentLimit">Per Student Limit</Label>
                    <Input
                      id="perStudentLimit"
                      type="number"
                      value={formData.perStudentLimit}
                      onChange={(e) => setFormData(prev => ({ ...prev, perStudentLimit: e.target.value }))}
                      placeholder="1"
                      min="1"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="validUntil">Expiry Date</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty for no expiry date
                  </p>
                </div>

                <div>
                  <Label htmlFor="allowedInstitutions">Allowed Institutions (Optional)</Label>
                  <Textarea
                    id="allowedInstitutions"
                    value={formData.allowedInstitutions}
                    onChange={(e) => setFormData(prev => ({ ...prev, allowedInstitutions: e.target.value }))}
                    placeholder="University of St Andrews, Edinburgh University"
                    rows={2}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Comma-separated list. Leave empty to allow all institutions.
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    className="flex-1"
                  >
                    {editingDiscount ? "Update Discount" : "Create Discount"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false)
                      setEditingDiscount(null)
                      resetForm()
                      setError("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
