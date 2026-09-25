import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    const { searchParams } = new URL(req.url);
    const guestToken = searchParams.get("guestToken");

    let room = null;

    if (user) {
      room = await db.chatRoom.findUnique({
        where: { userId: user.id },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!room) {
        room = await db.chatRoom.create({
          data: {
            userId: user.id,
            lastMessage: "Halo kak, selamat datang di TRI J! Ada yang bisa kami bantu hari ini? 😊",
            lastSender: "ADMIN",
            unreadUser: 0,
            messages: {
              create: {
                senderType: "ADMIN",
                senderName: "Customer Service TRI J",
                message: "Halo kak, selamat datang di TRI J! Ada yang bisa kami bantu hari ini? 😊",
              },
            },
          },
          include: { messages: true },
        });
      }
    } else if (guestToken && guestToken.trim()) {
      const cleanGuestToken = guestToken.trim();
      room = await db.chatRoom.findUnique({
        where: { guestToken: cleanGuestToken },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!room) {
        const shortToken = cleanGuestToken.slice(-4);
        room = await db.chatRoom.create({
          data: {
            guestToken: cleanGuestToken,
            guestName: `Tamu #${shortToken}`,
            lastMessage: "Halo kak, selamat datang di TRI J! Ada yang bisa kami bantu hari ini? 😊",
            lastSender: "ADMIN",
            unreadUser: 0,
            messages: {
              create: {
                senderType: "ADMIN",
                senderName: "Customer Service TRI J",
                message: "Halo kak, selamat datang di TRI J! Ada yang bisa kami bantu hari ini? 😊",
              },
            },
          },
          include: { messages: true },
        });
      }
    } else {
      return NextResponse.json({ room: null });
    }

    if (room && room.unreadUser > 0) {
      await db.chatRoom.update({
        where: { id: room.id },
        data: { unreadUser: 0 },
      });
      await db.chatMessage.updateMany({
        where: { roomId: room.id, senderType: "ADMIN", isRead: false },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ room });
  } catch (error: any) {
    console.error("Error GET /api/chat:", error);
    return NextResponse.json({ error: "Gagal mengambil pesan chat." }, { status: 500 });
  }
}

async function forwardToWaCs(roomId: number, user: any, messageText: string) {
  try {
    const setting = await db.systemSetting.findUnique({
      where: { key: "LIVECHAT_FORWARD_WA_NUMBERS" },
    });

    if (!setting || !setting.value || !setting.value.trim()) return;

    const numbers = setting.value
      .split(",")
      .map((n: string) => n.trim())
      .filter((n: string) => n.length >= 5);

    if (numbers.length === 0) return;

    const waMsg = `📩 *LIVECHAT WEBTRIJ - PESAN BARU*

🆔 *Room ID*: #${roomId}
👤 *Customer*: ${user.name || "Pelanggan"}
📱 *HP*: ${user.phone || "-"}
📧 *Email*: ${user.email || "-"}

💬 *Pesan*: "${messageText}"

----------------------------------
💡 *Cara Balas dari WA:*
Ketik: #${roomId} [Pesan Anda]
Contoh: #${roomId} Halo kak, produk ready stok siap kirim!`;

    const gatewayPort = process.env.WA_GATEWAY_PORT || 3005;
    for (const num of numbers) {
      fetch(`http://127.0.0.1:${gatewayPort}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: num,
          message: waMsg,
        }),
      }).catch((e) => console.warn("WA Forwarding fetch error:", e.message));
    }
  } catch (err) {
    console.error("forwardToWaCs error:", err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    const body = await req.json();
    const { message, guestToken, guestName } = body || {};

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Pesan tidak boleh kosong." }, { status: 400 });
    }

    const cleanMsg = message.trim();
    let room = null;
    let senderName = "Pembeli";
    let userInfoForWa: any = null;

    if (user) {
      room = await db.chatRoom.findUnique({
        where: { userId: user.id },
      });

      if (!room) {
        room = await db.chatRoom.create({
          data: { userId: user.id },
        });
      }

      senderName = user.name || "Pembeli";
      userInfoForWa = user;
    } else if (guestToken && guestToken.trim()) {
      const cleanGuestToken = guestToken.trim();
      const shortToken = cleanGuestToken.slice(-4);
      const defaultGuestName = guestName && guestName.trim() ? guestName.trim() : `Tamu #${shortToken}`;

      room = await db.chatRoom.findUnique({
        where: { guestToken: cleanGuestToken },
      });

      if (!room) {
        room = await db.chatRoom.create({
          data: {
            guestToken: cleanGuestToken,
            guestName: defaultGuestName,
          },
        });
      } else if (guestName && guestName.trim() && room.guestName !== guestName.trim()) {
        await db.chatRoom.update({
          where: { id: room.id },
          data: { guestName: guestName.trim() },
        });
      }

      senderName = room.guestName || defaultGuestName;
      userInfoForWa = {
        name: `${senderName} (Guest/Tanpa Login)`,
        phone: "-",
        email: "-",
      };
    } else {
      return NextResponse.json({ error: "Sesi live chat tidak ditemukan. Silakan refresh halaman." }, { status: 400 });
    }

    const newMsg = await db.chatMessage.create({
      data: {
        roomId: room.id,
        senderType: "USER",
        senderName: senderName,
        message: cleanMsg,
      },
    });

    await db.chatRoom.update({
      where: { id: room.id },
      data: {
        lastMessage: cleanMsg,
        lastSender: "USER",
        unreadAdmin: { increment: 1 },
      },
    });

    forwardToWaCs(room.id, userInfoForWa, cleanMsg);

    return NextResponse.json({ success: true, message: newMsg });
  } catch (error: any) {
    console.error("Error POST /api/chat:", error);
    return NextResponse.json({ error: "Gagal mengirim pesan." }, { status: 500 });
  }
}
