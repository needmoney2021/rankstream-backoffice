export interface Admin {
    readonly idx: number
    readonly companyName: string
    readonly id: string
    readonly name: string
    department: string
    state: 'ACTIVE' | 'DEACTIVATED'
    readonly createdAt: string
    readonly updatedAt: string
    readonly createdBy: string
    readonly updatedBy: string
}
