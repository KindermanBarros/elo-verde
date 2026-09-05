import type { ReservationIntent } from "./ReservationIntent";
import type { ReservationStatus } from "./ReservationStatus";
export interface ReservationIntentRepository { list(): Promise<ReservationIntent[]>; updateStatus(calBookingId: string, status: ReservationStatus, updatedBy: string): Promise<void>; }
