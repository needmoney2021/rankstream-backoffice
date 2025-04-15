export interface Order {
    readonly orderId: string
    readonly memberId: string
    readonly memberName: string
    readonly orderDate: string
    readonly cancelDate?: string
    readonly amount: number
    readonly gradePoint: number
    readonly businessPoint: number
    readonly status: 'COMPLETED' | 'CANCELLED'
    readonly isClosed: boolean
}

export interface OrderSearchParams {
    memberId?: string
    orderId?: string
    orderDateFrom?: string
    orderDateTo?: string
}

export interface OrderSnapshot {
    readonly memberId: string
    readonly memberName: string
    readonly snapshotMonth: string
    readonly totalAmount: number
    readonly gradePoint: number
    readonly businessPoint: number
    readonly createdBy: string
    readonly createdAt: string
}

export interface OrderSnapshotSearchParams {
    searchType: 'ALL' | 'MEMBER'
    memberId?: string
    closedMonthFrom?: string
    closedMonthTo?: string
}
