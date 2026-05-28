import { Suspense, lazy } from "react"

const Dashboard = lazy(() => import("@/components/Dashboard"))

export default function App() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Carregando painel...</p>
        </div>
      </div>
    }>
      <Dashboard />
    </Suspense>
  )
}