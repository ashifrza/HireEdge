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
              background: 'rgba(22, 20, 31, 0.9)',
              color: '#f7f5ff',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '1rem',
              fontSize: '0.875rem',
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              padding: '0.85rem 1rem',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 18px 60px rgba(0,0,0,0.48)',
            },
            success: {
              iconTheme: { primary: '#34d399', secondary: '#16141f' },
            },
            error: {
              iconTheme: { primary: '#fb7185', secondary: '#16141f' },
            },
            loading: {
              iconTheme: { primary: '#ff2d78', secondary: '#16141f' },
            },
          }}
          />
        </InterviewProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
