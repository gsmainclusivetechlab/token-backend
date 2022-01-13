import { SystemType } from "./operation";

export interface SMSWebhookBody {
    phoneNumber: string
    text:string
    system: SystemType 
}