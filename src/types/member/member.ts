export interface Member {
    id: string
    name: string
    gender: 'M' | 'F'
    status: 'ACTIVE' | 'INACTIVE' | 'WITHDRAW'
    joinDate: string
    withdrawDate?: string
    childrenCount: number
    currentGrade: string
    sponsorId?: string
    recommenderId?: string
    position?: 'Left' | 'Right'
}

export interface MemberSearchParams {
    memberId?: string
    name?: string
    gender?: string
} 