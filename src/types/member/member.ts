export interface GradeHistory {
    memberIdx: number
    previousGradeIdx: number
    previousGradeName: string
    changedGradeIdx: number
    changedGradeName: string
    issuedAt: string
}

export interface Member {
    companyIdx: number
    companyName: string
    idx: number
    id: string
    name: string
    gender: 'MALE' | 'FEMALE'
    sponsorIdx: number | null
    sponsorId: string | null
    sponsorName: string | null
    recommenderIdx: number | null
    recommenderId: string | null
    recommenderName: string | null
    state: 'ACTIVE' | 'DEACTIVATED'
    position?: 'LEFT' | 'RIGHT' | null
    gradeIdx: number
    gradeName: string
    gradeHistory: GradeHistory[]
    childrenCount: number
    createdAt: string
    updatedAt: string
    createdBy: string
    updatedBy: string
}

export interface MemberSearchParams {
    memberId?: string
    name?: string
    gender?: string
}
