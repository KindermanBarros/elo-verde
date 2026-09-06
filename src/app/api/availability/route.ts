import { NextResponse } from "next/server";
import { adminFirestore } from "@/infrastructure/firebase/admin";

export const dynamic = "force-dynamic";

const blockingStatuses = new Set(["Reservado", "Quitado"]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json(
      { error: "Informe start e end." },
      { status: 400 },
    );
  }

  try {
    const snapshot = await adminFirestore
      .collection("reservationIntents")
      .where("date", ">=", start)
      .where("date", "<=", end)
      .get();

    const dates = new Set<string>();
    snapshot.docs.forEach((item) => {
      const data = item.data();
      if (
        typeof data.date === "string" &&
        blockingStatuses.has(data.status)
      ) {
        dates.add(data.date);
      }
    });

    const days = [...dates].map((date) => ({ date }));
    return NextResponse.json(
      { days },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("availability", error);
    return NextResponse.json(
      { error: "Não foi possível consultar a disponibilidade." },
      { status: 500 },
    );
  }
}
