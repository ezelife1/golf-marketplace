"use client"

export default function DebugPage() {
  const testAlert = () => {
    alert("JavaScript is working!")
  }

  const testRedirect = () => {
    alert("About to redirect to Google...")
    window.location.href = "https://google.com"
  }

  const testStripeRedirect = () => {
    const url = "https://checkout.stripe.com/c/pay/cs_test_a1F0f8nhbWnIcLDoL2FZDjhHDdCwlTdjTxqfcwBrjGrpLa4kVCzZkpyz2Z"
    alert("Redirecting to Stripe URL: " + url)
    window.location.href = url
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Debug Page</h1>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={testAlert} style={{
          padding: '10px 20px',
          marginRight: '10px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px'
        }}>
          Test Alert
        </button>

        <button onClick={testRedirect} style={{
          padding: '10px 20px',
          marginRight: '10px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px'
        }}>
          Test Redirect (Google)
        </button>

        <button onClick={testStripeRedirect} style={{
          padding: '10px 20px',
          backgroundColor: '#6f42c1',
          color: 'white',
          border: 'none',
          borderRadius: '4px'
        }}>
          Test Stripe Redirect
        </button>
      </div>

      <div>
        <p>Click the buttons above to test:</p>
        <ul>
          <li>Test Alert - Checks if JavaScript works</li>
          <li>Test Redirect - Checks if redirects work</li>
          <li>Test Stripe Redirect - Uses the actual Stripe URL</li>
        </ul>
      </div>
    </div>
  )
}
