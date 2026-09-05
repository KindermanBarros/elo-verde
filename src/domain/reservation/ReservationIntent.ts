import type { ReservationStatus } from "./ReservationStatus";
export type ReservationIntent = { calBookingId: string; status: ReservationStatus; updatedAt: Date; updatedBy: string };
