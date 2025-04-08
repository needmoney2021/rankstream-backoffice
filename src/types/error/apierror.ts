export interface ApiError {
    message: string
    code: string
    status: number
    timestamp: string
    path: string
    validationErrors?: Record<string, string>
} 