export const reservationStatuses = ["Pendente contato", "Reservado", "Quitado", "Visita"] as const;
export type ReservationStatus = (typeof reservationStatuses)[number];
