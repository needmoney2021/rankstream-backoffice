export interface Member {
    readonly id: string
    readonly name: string
    readonly gender: 'M' | 'F'
    state: 'ACTIVE' | 'DEACTIVATED'
    readonly joinDate: string
    readonly deactivatedDate?: string
    readonly childrenCount: number
    currentGrade: number
    readonly gradeHistory: GradeHistory[]
}

export interface GradeHistory {
    grade: number
    readonly date: string
}


export interface MemberSearchParams {
    memberId?: string
    name?: string
    gender?: string
}
