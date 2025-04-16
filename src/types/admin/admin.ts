export interface Admin {
    readonly companyName: string
    readonly id: string
    readonly name: string
    readonly department: string
    readonly state: 'ACTIVE' | 'DEACTIVATED'
    readonly createdAt: string
    readonly updatedAt: string
    readonly createdBy: string
    readonly updatedBy: string
}
