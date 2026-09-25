import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { sendWhatsAppOtp, formatWhatsAppNumber } from "@/lib/whatsapp";

export async function POST(req: Request) {
  try {
    const { name, username, email, password, phone } = await req.json();

    if (!username || !email || !password || !phone) {
      return NextResponse.json(
        { error: "Nama, Username, Email, Password, dan Nomor WhatsApp wajib diisi." },
        { status: 400 }
      );
    }

    const cleanUsername = String(username).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const formattedPhone = formatWhatsAppNumber(phone);

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter." },
        { status: 400 }
      );
    }

    // Check existing username or email
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { username: { equals: cleanUsername, mode: "insensitive" } },
          { email: { equals: cleanEmail, mode: "insensitive" } },
        ],
      },
    });

    if (existingUser) {
      // If user exists and is already verified, reject duplicate registration
      if (existingUser.isVerified) {
        return NextResponse.json(
          { error: "Username atau Email sudah terdaftar. Silakan login." },
          { status: 400 }
        );
      }

      // If user exists but is not yet verified, generate fresh OTP and resend
      const freshOtp = Math.floor(1000 + Math.random() * 9000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await db.user.update({
        where: { id: existingUser.id },
        data: {
          name: name || cleanUsername,
          phone: formattedPhone,
          otpCode: freshOtp,
          otpExpiresAt: otpExpiry,
        },
      });

      await sendWhatsAppOtp(formattedPhone, freshOtp, name || cleanUsername);

      return NextResponse.json({
        success: true,
        requiresOtp: true,
        userId: existingUser.id,
        phone: formattedPhone,
        message: "Kode OTP verifikasi WhatsApp telah dikirim!",
        debugOtp: process.env.NODE_ENV !== "production" ? freshOtp : undefined,
      });
    }

    const hashedPassword = await hashPassword(password);
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const newUser = await db.user.create({
      data: {
        name: name || cleanUsername,
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
        phone: formattedPhone,
        role: "USER",
        isVerified: false, // Requires WhatsApp OTP verification
        otpCode,
        otpExpiresAt,
      },
    });

    // Send WhatsApp OTP
    await sendWhatsAppOtp(formattedPhone, otpCode, newUser.name);

    return NextResponse.json({
      success: true,
      requiresOtp: true,
      userId: newUser.id,
      phone: formattedPhone,
      message: "Pendaftaran berhasil! Silakan masukkan kode OTP WhatsApp.",
      debugOtp: process.env.NODE_ENV !== "production" ? otpCode : undefined,
    });
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan saat pendaftaran akun." },
      { status: 500 }
    );
  }
}
