export interface Auth {
    readonly userId: string
    readonly companyId: number
    readonly accessToken: string
    readonly refreshToken: string
}
