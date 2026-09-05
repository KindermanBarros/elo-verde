import { collection, doc, getDocs, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";
import type { ReservationIntentRepository } from "@/domain/reservation/ReservationIntentRepository";
import type { ReservationIntent } from "@/domain/reservation/ReservationIntent";
import type { ReservationStatus } from "@/domain/reservation/ReservationStatus";
import { firestore } from "./client";
export class FirestoreReservationIntentRepository implements ReservationIntentRepository { async list(): Promise<ReservationIntent[]> { const snapshot = await getDocs(query(collection(firestore, "reservationIntents"), orderBy("updatedAt", "desc"))); return snapshot.docs.map((item) => { const data = item.data(); return { calBookingId: item.id, status: data.status, updatedAt: data.updatedAt?.toDate?.() ?? new Date(), updatedBy: data.updatedBy }; }); } async updateStatus(id: string, status: ReservationStatus, updatedBy: string) { await setDoc(doc(firestore, "reservationIntents", id), { status, updatedBy, updatedAt: serverTimestamp() }, { merge: true }); } }
