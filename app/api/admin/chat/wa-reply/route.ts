import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { roomId, message, waSender } = await req.json();

    if (!roomId || !message || !message.trim()) {
      return NextResponse.json({ error: "roomId and message required" }, { status: 400 });
    }

    const room = await db.chatRoom.findUnique({
      where: { id: Number(roomId) },
      include: { user: true },
    });

    if (!room) {
      return NextResponse.json({ error: "Room chat tidak ditemukan." }, { status: 404 });
    }

    const cleanMsg = message.trim();

    const newMsg = await db.chatMessage.create({
      data: {
        roomId: room.id,
        senderType: "ADMIN",
        senderName: "CS WA Admin",
        message: cleanMsg,
      },
    });

    await db.chatRoom.update({
      where: { id: room.id },
      data: {
        lastMessage: cleanMsg,
        lastSender: "ADMIN",
        unreadUser: { increment: 1 },
      },
    });

    return NextResponse.json({ success: true, message: newMsg });
  } catch (error: any) {
    console.error("Error WA Reply POST:", error);
    return NextResponse.json({ error: error.message || "Gagal memproses balasan WA" }, { status: 500 });
  }
}
