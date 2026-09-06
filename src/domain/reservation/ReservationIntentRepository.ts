import type { ReservationIntent } from "./ReservationIntent";
import type { ReservationStatus } from "./ReservationStatus";
export interface ReservationIntentRepository { list(): Promise<ReservationIntent[]>; updateStatus(reservationId: string, status: ReservationStatus, updatedBy: string): Promise<void>; remove(reservationId: string): Promise<void>; }
