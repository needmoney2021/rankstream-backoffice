export interface Transaction {
    readonly idx: number
    readonly memberIdx: number
    readonly memberName: string
    readonly transactionId: String
    readonly amount: number
    readonly gradePoint: number
    readonly businessPoint: number
    readonly valueAddedTax: number
    readonly orderedAt: string
    readonly createdAt: string
    readonly updatedAt: string
}

export interface ClosedTransaction {
    readonly year: number
    readonly month: number
    readonly totalAmount: number
    readonly totalValueAddedTax: number
    readonly totalGradePoint: number
    readonly totalBusinessPoint: number
    readonly memberIdx: number
    readonly memberName: string
}