import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");

    // Fetch messages for a specific room
    if (roomId) {
      const parsedRoomId = Number(roomId);
      if (isNaN(parsedRoomId)) {
        return NextResponse.json({ error: "Room ID tidak valid." }, { status: 400 });
      }

      const room = await db.chatRoom.findUnique({
        where: { id: parsedRoomId },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true, avatar: true },
          },
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!room) {
        return NextResponse.json({ error: "Room chat tidak ditemukan." }, { status: 404 });
      }

      // Reset unread count for Admin
      if (room.unreadAdmin > 0) {
        await db.chatRoom.update({
          where: { id: room.id },
          data: { unreadAdmin: 0 },
        });
        await db.chatMessage.updateMany({
          where: { roomId: room.id, senderType: "USER", isRead: false },
          data: { isRead: true },
        });
      }

      return NextResponse.json({ room });
    }

    // List all chat rooms for Admin
    const rooms = await db.chatRoom.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, avatar: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const totalUnreadAdmin = rooms.reduce((sum, r) => sum + (r.unreadAdmin || 0), 0);

    return NextResponse.json({ rooms, totalUnreadAdmin });
  } catch (error: any) {
    console.error("Error GET /api/admin/chat:", error);
    return NextResponse.json({ error: "Gagal mengambil daftar chat Admin." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId, message } = await req.json();
    const parsedRoomId = Number(roomId);

    if (!parsedRoomId || isNaN(parsedRoomId) || !message || !message.trim()) {
      return NextResponse.json({ error: "Room ID dan Pesan wajib diisi." }, { status: 400 });
    }

    const room = await db.chatRoom.findUnique({
      where: { id: parsedRoomId },
    });

    if (!room) {
      return NextResponse.json({ error: "Room chat tidak ditemukan." }, { status: 404 });
    }

    const cleanMsg = message.trim();

    const newMsg = await db.chatMessage.create({
      data: {
        roomId: room.id,
        senderType: "ADMIN",
        senderName: "Customer Service TRI J",
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
    console.error("Error POST /api/admin/chat:", error);
    return NextResponse.json({ error: "Gagal mengirim balasan pesan." }, { status: 500 });
  }
}
