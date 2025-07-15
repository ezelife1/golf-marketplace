"use client"

import { useState } from "react"

export default function SimpleTestPage() {
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  const testCheckout = async () => {
    setLoading(true)
    setResult("Starting test...")

    try {
      setResult("Making API call...")

      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: 'test-product',
          buyerEmail: 'test@example.com',
          successUrl: `${window.location.origin}/purchase/success`,
          cancelUrl: window.location.href
        })
      })

      setResult(`Response status: ${response.status}`)

      const text = await response.text()
      setResult(prev => prev + `\n\nRaw response: ${text}`)

      let data
      try {
        data = JSON.parse(text)
        setResult(prev => prev + `\n\nParsed JSON: ${JSON.stringify(data, null, 2)}`)
      } catch (e) {
        setResult(prev => prev + `\n\nJSON parse error: ${e}`)
        return
      }

      if (data.url) {
        setResult(prev => prev + `\n\nGot URL: ${data.url}`)
        setResult(prev => prev + `\n\nTrying redirect...`)
        window.location.href = data.url
      } else {
        setResult(prev => prev + `\n\nNo URL in response!`)
      }

    } catch (error) {
      setResult(prev => prev + `\n\nError: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Simple Checkout Test</h1>

      <button
        onClick={testCheckout}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px'
        }}
      >
        {loading ? 'Testing...' : 'Test Checkout API'}
      </button>

      <pre style={{
        marginTop: '20px',
        padding: '10px',
        backgroundColor: '#f5f5f5',
        whiteSpace: 'pre-wrap',
        fontSize: '12px'
      }}>
        {result}
      </pre>
    </div>
  )
}
