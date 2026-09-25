import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comparePassword, createSessionToken, COOKIE_NAME } from "@/lib/auth";
import { sendWhatsAppOtp } from "@/lib/whatsapp";

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Username/Email dan Password wajib diisi." },
        { status: 400 }
      );
    }

    const cleanIdentifier = String(identifier).trim();

    // Find user by username or email
    const user = await db.user.findFirst({
      where: {
        OR: [
          { username: { equals: cleanIdentifier, mode: "insensitive" } },
          { email: { equals: cleanIdentifier, mode: "insensitive" } },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Username/Email atau Password salah." },
        { status: 401 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { error: "Akun ini terdaftar via Google SSO. Silakan klik tombol 'Masuk dengan Google'." },
        { status: 400 }
      );
    }

    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Username/Email atau Password salah." },
        { status: 401 }
      );
    }

    // Check if account is verified via WhatsApp OTP
    if (user.isVerified === false) {
      const freshOtp = Math.floor(1000 + Math.random() * 9000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

      await db.user.update({
        where: { id: user.id },
        data: { otpCode: freshOtp, otpExpiresAt: otpExpiry },
      });

      await sendWhatsAppOtp(user.phone || "08961656039", freshOtp, user.name);

      return NextResponse.json({
        requiresOtp: true,
        userId: user.id,
        phone: user.phone,
        error: "Akun Anda belum terverifikasi. Kode OTP baru telah dikirimkan ke WhatsApp Anda.",
        debugOtp: process.env.NODE_ENV !== "production" ? freshOtp : undefined,
      }, { status: 403 });
    }

    const token = await createSessionToken({
      id: user.id,
      username: user.username || user.email,
      email: user.email,
    });

    const response = NextResponse.json({
      success: true,
      message: "Login berhasil!",
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
      maxAge: 1 * 24 * 60 * 60, // 1 day (24 hours)
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server saat login." },
      { status: 500 }
    );
  }
}
