export interface Grade {
    readonly id: number
    name: string
    achievementPoint: number
    refundRate: number
    readonly createdBy: string
    readonly createdAt: string
    readonly updatedBy?: string
    readonly updatedAt?: string
}
