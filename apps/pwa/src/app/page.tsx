/**
 * UICare Safety — Home Page
 *
 * Entry point for the Behavioral Safety PWA.
 * All behavioral monitoring is opt-in and requires explicit consent.
 * This is not a medical device. Not a clinical tool.
 */
export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0f0f1a',
        color: '#e8e8f0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        padding: '2rem',
      }}
    >
      <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>
        UICare Behavioral Safety Aid
      </h1>
      <p style={{ color: '#a0a0b8', maxWidth: '480px', textAlign: 'center', lineHeight: 1.6 }}>
        A local-first safety companion. Behavioral monitoring is entirely optional and
        requires your explicit consent before any data is collected or gates are active.
      </p>
      <p
        style={{
          marginTop: '2rem',
          fontSize: '0.75rem',
          color: '#606078',
          maxWidth: '480px',
          textAlign: 'center',
        }}
      >
        Not a medical device. Not a clinical diagnostic tool. No emergency response
        capability. If you are in crisis, contact a crisis line or emergency services.
      </p>
    </main>
  )
}
