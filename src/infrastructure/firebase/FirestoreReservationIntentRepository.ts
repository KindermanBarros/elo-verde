import { collection, doc, getDocs, orderBy, query, runTransaction, serverTimestamp } from "firebase/firestore";
import type { ReservationIntentRepository } from "@/domain/reservation/ReservationIntentRepository";
import type { ReservationIntent } from "@/domain/reservation/ReservationIntent";
import type { ReservationStatus } from "@/domain/reservation/ReservationStatus";
import { firestore } from "./client";
export class FirestoreReservationIntentRepository implements ReservationIntentRepository {
  async list(): Promise<ReservationIntent[]> {
    const snapshot = await getDocs(query(collection(firestore, "reservationIntents"), orderBy("updatedAt", "desc")));
    return snapshot.docs.map((item) => {
      const data = item.data();
      return { reservationId: item.id, name: data.name ?? "", email: data.email ?? "", phone: data.phone ?? "", date: data.date ?? "", notes: data.notes ?? "", status: data.status, updatedAt: data.updatedAt?.toDate?.() ?? new Date(), updatedBy: data.updatedBy };
    });
  }

  async updateStatus(id: string, status: ReservationStatus, updatedBy: string) {
    const reservationRef = doc(firestore, "reservationIntents", id);
    await runTransaction(firestore, async (transaction) => {
      const reservation = await transaction.get(reservationRef);
      if (!reservation.exists()) throw new Error("Reserva não encontrada.");
      const data = reservation.data();
      const date = String(data.date ?? "");
      const currentStatus = data.status as ReservationStatus;
      const lockRef = doc(firestore, "reservationDateLocks", date);
      const lock = await transaction.get(lockRef);
      const blocksDate = status === "Reservado" || status === "Quitado";
      const currentlyBlocksDate = currentStatus === "Reservado" || currentStatus === "Quitado";

      if (blocksDate) {
        if (lock.exists() && lock.data().reservationId !== id) {
          throw new Error("Esta data já está reservada ou quitada.");
        }
        transaction.set(lockRef, { reservationId: id, date, status, updatedBy, updatedAt: serverTimestamp() });
      } else if (currentlyBlocksDate && lock.data()?.reservationId === id) {
        transaction.delete(lockRef);
      }
      transaction.update(reservationRef, { status, updatedBy, updatedAt: serverTimestamp() });
    });
  }

  async remove(id: string) {
    const reservationRef = doc(firestore, "reservationIntents", id);
    await runTransaction(firestore, async (transaction) => {
      const reservation = await transaction.get(reservationRef);
      if (!reservation.exists()) return;
      const date = String(reservation.data().date ?? "");
      const lockRef = doc(firestore, "reservationDateLocks", date);
      const lock = await transaction.get(lockRef);
      if (lock.data()?.reservationId === id) transaction.delete(lockRef);
      transaction.delete(reservationRef);
    });
  }
}
