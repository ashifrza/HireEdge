import { RouterProvider } from "react-router"
import { router } from "./app.routes.jsx"
import { AuthProvider } from "./features/auth/auth.context.jsx"
import { InterviewProvider } from "./features/interview/interview.context.jsx"
import { Toaster } from "react-hot-toast"
import { Suspense } from "react"
import ErrorBoundary from "./components/ErrorBoundary"

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <InterviewProvider>
          <Suspense fallback={<main className='auth-loading' aria-label='Loading HireEdge'><div className='auth-spinner'/></main>}>
            <RouterProvider router={router} />
          </Suspense>
          <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1c2230',
              color: '#e6edf3',
              border: '1px solid #2a3348',
              borderRadius: '0.65rem',
              fontSize: '0.875rem',
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              padding: '0.75rem 1rem',
              boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
            },
            success: {
              iconTheme: { primary: '#3fb950', secondary: '#1c2230' },
            },
            error: {
              iconTheme: { primary: '#ff4d4d', secondary: '#1c2230' },
            },
            loading: {
              iconTheme: { primary: '#ff2d78', secondary: '#1c2230' },
            },
          }}
          />
        </InterviewProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
