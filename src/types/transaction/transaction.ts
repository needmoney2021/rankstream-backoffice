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