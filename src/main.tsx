import { Component, StrictMode } from 'react'
import type { ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

class AppErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error) {
    console.error('MotionSplit crashed.', error)
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="grid min-h-screen place-items-center bg-[#050816] px-6 text-slate-50">
          <section className="max-w-md rounded-3xl border border-red-500/20 bg-[#2a1118] p-6 text-center">
            <h1 className="text-2xl font-semibold">MotionSplit stopped unexpectedly</h1>
            <p className="mt-3 text-sm leading-6 text-red-100/80">
              Your source file was not changed. Reload the app and try a shorter range.
            </p>
            <button
              className="mt-5 rounded-2xl border border-white/15 px-5 py-3 text-sm font-medium hover:bg-white/8"
              onClick={() => window.location.reload()}
              type="button"
            >
              Reload MotionSplit
            </button>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}

registerSW({
  immediate: true,
  onRegisterError: (error) => console.error('Offline support could not start.', error),
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
)
