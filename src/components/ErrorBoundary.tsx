import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AppError, handleError, logError } from '@utils/errorHandling'
import './ErrorBoundary.css'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: AppError | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: unknown): State {
    const appError = handleError(error, 'ErrorBoundary')
    return {
      hasError: true,
      error: appError,
    }
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo): void {
    const appError = handleError(error, 'ErrorBoundary')
    logError(appError, 'ErrorBoundary')
    console.error('ErrorBoundary caught an error:', errorInfo)
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="error-boundary">
          <div className="error-boundary__content">
            <h2 className="error-boundary__title">Something went wrong</h2>
            <p className="error-boundary__message">
              {this.state.error?.userMessage ||
                'An unexpected error occurred. Please refresh the page.'}
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-boundary__details">
                <summary>Error details</summary>
                <pre className="error-boundary__stack">
                  {this.state.error.message}
                  {'\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <button
              className="error-boundary__button"
              onClick={this.handleReset}
            >
              Try again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
