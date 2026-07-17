import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ErrorState } from '@/components/ui/AsyncState'

interface State {
  failed: boolean
}

/** Prevents an unexpected render error from leaving the entire SPA blank. */
export class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error', error, info.componentStack)
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="flex min-h-full items-center justify-center p-6">
          <div className="w-full max-w-xl">
            <ErrorState message="页面遇到未知错误，请重新加载后再试。" onRetry={() => window.location.reload()} />
          </div>
        </main>
      )
    }
    return this.props.children
  }
}
