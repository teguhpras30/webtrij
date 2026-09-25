import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSessionToken, COOKIE_NAME } from "@/lib/auth";
import { formatWhatsAppNumber } from "@/lib/whatsapp";

export async function POST(req: Request) {
  try {
    const { userId, phone, otpCode } = await req.json();

    if (!otpCode || otpCode.trim().length === 0) {
      return NextResponse.json({ error: "Kode OTP wajib diisi." }, { status: 400 });
    }

    const cleanOtp = String(otpCode).trim();
    const formattedPhone = phone ? formatWhatsAppNumber(phone) : undefined;

    // Search user by userId or phone
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
      // Create session token and log in
      const token = await createSessionToken({
        id: user.id,
        username: user.username || user.email,
        email: user.email,
      });

      const response = NextResponse.json({
        success: true,
        message: "Akun Anda sudah terverifikasi. Selamat datang!",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });

      response.cookies.set({
        name: COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });

      return response;
    }

    // Verify OTP code & check expiration
    const isValidCode = Boolean(user.otpCode && user.otpCode === cleanOtp);
    const isNotExpired = !user.otpExpiresAt || new Date() < new Date(user.otpExpiresAt);

    if (!isValidCode) {
      return NextResponse.json({ error: "Kode OTP WhatsApp yang Anda masukkan salah." }, { status: 400 });
    }

    if (!isNotExpired) {
      return NextResponse.json({ error: "Kode OTP sudah kadaluarsa. Silakan minta kode baru." }, { status: 400 });
    }

    // Activate user account in DB
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        otpCode: null,
        otpExpiresAt: null,
      },
    });

    // Generate Session Token & Login Cookie
    const token = await createSessionToken({
      id: updatedUser.id,
      username: updatedUser.username || updatedUser.email,
      email: updatedUser.email,
    });

    const response = NextResponse.json({
      success: true,
      message: "Verifikasi WhatsApp berhasil! Akun Anda kini telah aktif.",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      },
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error("Verify OTP Error:", error);
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan saat memverifikasi OTP." },
      { status: 500 }
    );
  }
}
