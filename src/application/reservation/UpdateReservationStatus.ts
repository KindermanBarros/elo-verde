import type { ReservationIntentRepository } from "@/domain/reservation/ReservationIntentRepository";
import type { ReservationStatus } from "@/domain/reservation/ReservationStatus";
export class UpdateReservationStatus { constructor(private readonly repository: ReservationIntentRepository) {} execute(id: string, status: ReservationStatus, user: string) { return this.repository.updateStatus(id, status, user); } }
