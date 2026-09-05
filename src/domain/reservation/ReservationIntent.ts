import type { ReservationStatus } from "./ReservationStatus";
export type ReservationIntent = { reservationId: string; status: ReservationStatus; updatedAt: Date; updatedBy: string };
