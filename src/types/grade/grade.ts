export interface Grade {
    readonly idx: number
    name: string
    achievementPoint: number
    refundRate: number
    readonly createdBy: string
    readonly createdAt: string
    readonly updatedBy?: string
    readonly updatedAt?: string
}
