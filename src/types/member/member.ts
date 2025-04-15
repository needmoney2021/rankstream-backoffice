export interface Member {
    readonly id: string
    readonly name: string
    readonly gender: 'M' | 'F'
    status: 'ACTIVE' | 'INACTIVE' | 'WITHDRAW'
    readonly joinDate: string
    readonly withdrawDate?: string
    readonly childrenCount: number
    currentGrade: string
    readonly sponsorId?: string
    readonly recommenderId?: string
    position?: 'Left' | 'Right'
}

export interface MemberSearchParams {
    memberId?: string
    name?: string
    gender?: string
}
