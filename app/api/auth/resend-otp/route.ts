import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendWhatsAppOtp, formatWhatsAppNumber } from "@/lib/whatsapp";

export async function POST(req: Request) {
  try {
    const { userId, phone } = await req.json();

    const formattedPhone = phone ? formatWhatsAppNumber(phone) : undefined;

    const user = await db.user.findFirst({
      where: {
        OR: [
          { id: userId ? Number(userId) : -1 },
          { phone: formattedPhone || "invalid" },
        ],
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ success: true, message: "Akun Anda sudah terverifikasi." });
    }

    const freshOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const updateData: any = {
      otpCode: freshOtp,
      otpExpiresAt: otpExpiry,
    };
    if (formattedPhone) {
      updateData.phone = formattedPhone;
    }

    await db.user.update({
      where: { id: user.id },
      data: updateData,
    });

    await sendWhatsAppOtp(user.phone || formattedPhone || "08961656039", freshOtp, user.name);

    return NextResponse.json({
      success: true,
      message: "Kode OTP baru berhasil dikirimkan ke WhatsApp Anda!",
      debugOtp: process.env.NODE_ENV !== "production" ? freshOtp : undefined,
    });
  } catch (error: any) {
    console.error("Resend OTP Error:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal mengirim ulang kode OTP." },
      { status: 500 }
    );
  }
}
