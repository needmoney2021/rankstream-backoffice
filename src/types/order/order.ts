export interface Order {
    orderId: string
    memberId: string
    memberName: string
    orderDate: string
    cancelDate?: string
    amount: number
    gradePoint: number
    businessPoint: number
    status: 'COMPLETED' | 'CANCELLED'
    isClosed: boolean
}

export interface OrderSearchParams {
    memberId?: string
    orderId?: string
    orderDateFrom?: string
    orderDateTo?: string
}

export interface OrderSnapshotSearchParams {
    searchType: 'ALL' | 'MEMBER'
    memberId?: string
    closedMonthFrom?: string
    closedMonthTo?: string
} 