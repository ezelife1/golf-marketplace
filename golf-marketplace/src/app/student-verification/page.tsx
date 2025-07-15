"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navigation } from "@/components/navigation"
import {
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  GraduationCap,
  Calendar,
  School,
  User,
  Shield
} from "lucide-react"
import Link from "next/link"

interface StudentVerification {
  id: string
  studentId: string
  institution: string
  courseOfStudy?: string
  academicYear?: string
  graduationDate?: string
  documentUrl?: string
  verificationStatus: string
  expiresAt: string
  createdAt: string
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
  "Glasgow Caledonian University",
  "University of the West of Scotland",
  "Edinburgh Napier University",
  "Glasgow School of Art",
  "Royal Conservatoire of Scotland",
  "Other"
]

const ACADEMIC_YEARS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "5th Year",
  "Postgraduate",
  "PhD"
]

interface VerificationForm {
  studentId: string
  institution: string
  courseOfStudy: string
  academicYear: string
  graduationDate: string
  documentFile: File | null
}

export default function StudentVerificationPage() {
  const { data: session, status } = useSession()
  const [verification, setVerification] = useState<StudentVerification | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<string>("not_applied")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState<VerificationForm>({
    studentId: "",
    institution: "",
    courseOfStudy: "",
    academicYear: "",
    graduationDate: "",
    documentFile: null
  })

  useEffect(() => {
    if (session?.user?.id) {
      fetchVerificationStatus()
    }
  }, [session])

  const fetchVerificationStatus = async () => {
    try {
      const response = await fetch("/api/student-verification")
      const data = await response.json()

      if (response.ok) {
        setVerificationStatus(data.status)
        if (data.verification) {
          setVerification(data.verification)
          // Pre-fill form if editing
          setFormData({
            studentId: data.verification.studentId || "",
            institution: data.verification.institution || "",
            courseOfStudy: data.verification.courseOfStudy || "",
            academicYear: data.verification.academicYear || "",
            graduationDate: data.verification.graduationDate ?
              new Date(data.verification.graduationDate).toISOString().split('T')[0] : "",
            documentFile: null
          })
        }
      } else {
        setError("Failed to fetch verification status")
      }
    } catch (error) {
      setError("Failed to fetch verification status")
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file: File): Promise<string> => {
    setUploading(true)

    try {
      // In a real app, you would upload to a file storage service
      // For now, we'll simulate the upload and return a mock URL
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Generate a mock URL for the uploaded document
      const mockUrl = `https://storage.clubup.com/documents/${Date.now()}_${file.name}`
      return mockUrl
    } catch (error) {
      throw new Error("Failed to upload document")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      // Validation
      if (!formData.studentId || !formData.institution) {
        throw new Error("Student ID and institution are required")
      }

      if (!formData.documentFile && verificationStatus === "not_applied") {
        throw new Error("Please upload your student verification document")
      }

      // Upload document if provided
      let documentUrl = verification?.documentUrl
      if (formData.documentFile) {
        documentUrl = await handleFileUpload(formData.documentFile)
      }

      // Submit verification
      const method = verification ? "PUT" : "POST"
      const response = await fetch("/api/student-verification", {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          studentId: formData.studentId,
          institution: formData.institution,
          courseOfStudy: formData.courseOfStudy,
          academicYear: formData.academicYear,
          graduationDate: formData.graduationDate || null,
          documentUrl
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(verification ?
          "Student verification updated successfully!" :
          "Student verification submitted successfully!"
        )
        fetchVerificationStatus()
      } else {
        setError(data.error || "Failed to submit verification")
      }
    } catch (error: any) {
      setError(error.message || "Failed to submit verification")
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case "verified":
        return <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Verified
        </Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending Review
        </Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      case "expired":
        return <Badge className="bg-gray-100 text-gray-800">
          <Calendar className="w-3 h-3 mr-1" />
          Expired
        </Badge>
      default:
        return <Badge variant="outline">
          <User className="w-3 h-3 mr-1" />
          Not Applied
        </Badge>
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse max-w-2xl mx-auto">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
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
              <GraduationCap className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Student Verification</h2>
              <p className="text-gray-600 mb-4">
                Please sign in to verify your student status and access exclusive discounts.
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
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Student Verification</h1>
            <p className="text-xl text-gray-600">
              Verify your student status to access exclusive golf equipment discounts
            </p>
          </div>

          {/* Current Status */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Verification Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Current Status</p>
                  <div className="mt-1">
                    {getStatusBadge()}
                  </div>
                </div>

                {verification && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {verificationStatus === "verified" ? "Expires" : "Submitted"}
                    </p>
                    <p className="font-medium">
                      {new Date(
                        verificationStatus === "verified"
                          ? verification.expiresAt
                          : verification.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {verificationStatus === "verified" && (
                <Alert className="mt-4 border-green-200 bg-green-50">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    Your student status is verified! You can now use student discounts from PGA Professionals.
                  </AlertDescription>
                </Alert>
              )}

              {verificationStatus === "pending" && (
                <Alert className="mt-4 border-yellow-200 bg-yellow-50">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-700">
                    Your verification is being reviewed. This usually takes 2-3 business days.
                  </AlertDescription>
                </Alert>
              )}

              {verificationStatus === "rejected" && (
                <Alert className="mt-4 border-red-200 bg-red-50">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    Your verification was rejected. Please check your documents and resubmit.
                  </AlertDescription>
                </Alert>
              )}

              {verificationStatus === "expired" && (
                <Alert className="mt-4 border-orange-200 bg-orange-50">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <AlertDescription className="text-orange-700">
                    Your student verification has expired. Please submit new documents to renew.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Verification Form */}
          {(verificationStatus === "not_applied" ||
            verificationStatus === "rejected" ||
            verificationStatus === "expired") && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {verification ? "Update Verification" : "Submit Verification"}
                </CardTitle>
                <p className="text-gray-600">
                  Provide your student details and upload a verification document.
                </p>
              </CardHeader>
              <CardContent>
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

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="studentId">Student ID *</Label>
                      <Input
                        id="studentId"
                        value={formData.studentId}
                        onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value }))}
                        placeholder="S1234567"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="institution">Institution *</Label>
                      <Select value={formData.institution} onValueChange={(value) => setFormData(prev => ({ ...prev, institution: value }))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select your institution" />
                        </SelectTrigger>
                        <SelectContent>
                          {INSTITUTIONS.map(institution => (
                            <SelectItem key={institution} value={institution}>
                              {institution}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="courseOfStudy">Course of Study</Label>
                      <Input
                        id="courseOfStudy"
                        value={formData.courseOfStudy}
                        onChange={(e) => setFormData(prev => ({ ...prev, courseOfStudy: e.target.value }))}
                        placeholder="e.g., Golf Management"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="academicYear">Academic Year</Label>
                      <Select value={formData.academicYear} onValueChange={(value) => setFormData(prev => ({ ...prev, academicYear: value }))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {ACADEMIC_YEARS.map(year => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="graduationDate">Expected Graduation Date</Label>
                    <Input
                      id="graduationDate"
                      type="date"
                      value={formData.graduationDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, graduationDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      This helps determine how long your verification remains valid
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="document">Student Verification Document *</Label>
                    <div className="mt-1">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {uploading ? (
                            <div className="text-center">
                              <Upload className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                              <p className="text-sm text-blue-600">Uploading...</p>
                            </div>
                          ) : formData.documentFile ? (
                            <div className="text-center">
                              <FileText className="w-8 h-8 text-green-500 mx-auto mb-2" />
                              <p className="text-sm font-medium text-green-700">{formData.documentFile.name}</p>
                              <p className="text-xs text-gray-500">Click to change file</p>
                            </div>
                          ) : (
                            <div className="text-center">
                              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">
                                <span className="font-semibold">Click to upload</span> student ID or enrollment letter
                              </p>
                              <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                            </div>
                          )}
                        </div>
                        <input
                          id="document"
                          type="file"
                          className="hidden"
                          accept=".png,.jpg,.jpeg,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setFormData(prev => ({ ...prev, documentFile: file }))
                            }
                          }}
                          disabled={uploading}
                        />
                      </label>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Upload a clear photo of your student ID card or official enrollment letter
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Acceptable Documents</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Student ID card (both sides)</li>
                      <li>• Official enrollment letter</li>
                      <li>• Current student transcript</li>
                      <li>• Tuition payment receipt</li>
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting || uploading}
                    className="w-full"
                  >
                    {submitting ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        {verification ? "Updating..." : "Submitting..."}
                      </>
                    ) : (
                      <>
                        <GraduationCap className="w-4 h-4 mr-2" />
                        {verification ? "Update Verification" : "Submit for Verification"}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Benefits */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Student Verification Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-medium">Exclusive Discounts</h4>
                    <p className="text-sm text-gray-600">Access special student-only discount codes from PGA Professionals</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-medium">Verified Status</h4>
                    <p className="text-sm text-gray-600">Student badge on your profile builds trust with sellers</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-medium">Priority Support</h4>
                    <p className="text-sm text-gray-600">Get priority customer support for verified students</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-medium">Educational Resources</h4>
                    <p className="text-sm text-gray-600">Access to educational content and golf improvement resources</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
