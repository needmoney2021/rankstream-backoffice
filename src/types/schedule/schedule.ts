export interface Schedule {
    day: number
    hour: number
    minute: number
    readonly createdBy: string
    readonly createdAt: string
    readonly updatedBy: string
    readonly updatedAt: string
}

export interface ScheduleForm {
    day: number
    hour: number
    minute: number
}
