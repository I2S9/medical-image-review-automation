export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage?: string
  ) {
    super(message)
    this.name = 'AppError'
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export function handleError(error: unknown, context?: string): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Error) {
    return new AppError(
      error.message,
      'UNKNOWN_ERROR',
      context
        ? `An error occurred in ${context}. Please try again.`
        : 'An unexpected error occurred. Please try again.'
    )
  }

  return new AppError(
    'An unknown error occurred',
    'UNKNOWN_ERROR',
    'An unexpected error occurred. Please try again.'
  )
}

export function logError(error: AppError, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context || 'App'}] Error:`, {
      message: error.message,
      code: error.code,
      stack: error.stack,
    })
  }
}
