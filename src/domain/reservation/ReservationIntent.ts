import type { ReservationStatus } from "./ReservationStatus";
export type ReservationIntent = { reservationId: string; name: string; email: string; phone: string; date: string; notes: string; status: ReservationStatus; updatedAt: Date; updatedBy: string };
