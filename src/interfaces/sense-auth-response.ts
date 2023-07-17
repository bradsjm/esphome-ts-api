import { SenseMonitorAttributes, SenseSettings } from "../types";

export interface SenseAuthResponse {
    ab_cohort: string
    access_token: string
    account_id: number
    authorized: boolean
    bridge_server: string
    date_created: string
    monitors: SenseMonitor[]
    refresh_token: string
    settings: SenseSettings
    totp_enabled: boolean
    user_id: number
}

export interface SenseMonitor {
    attributes: SenseMonitorAttributes
    hardware_type: string
    id: number
    online: boolean
    serial_number: string
}
