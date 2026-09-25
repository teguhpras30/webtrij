import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { sendWhatsAppOtp, formatWhatsAppNumber } from "@/lib/whatsapp";

export async function POST(req: Request) {
  try {
    const { name, phone, address } = await req.json();

    if (!phone || String(phone).trim().length < 8) {
      return NextResponse.json(
        { error: "Nomor WhatsApp wajib diisi (minimal 9 digit)." },
        { status: 400 }
      );
    }

    const cleanName = String(name || "").trim() || "Pelanggan TRI J";
    const cleanAddress = String(address || "").trim();
    const formattedPhone = formatWhatsAppNumber(phone);

    // Check if user with this phone number already exists
    let existingUser = await db.user.findFirst({
      where: { phone: formattedPhone },
    });

    const freshOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (existingUser) {
      // Update name & address if user provided them
      const updatedUser = await db.user.update({
        where: { id: existingUser.id },
        data: {
          name: cleanName !== "Pelanggan TRI J" ? cleanName : existingUser.name,
          address: cleanAddress || existingUser.address,
          otpCode: freshOtp,
          otpExpiresAt: otpExpiry,
        },
      });

      // Send OTP to WhatsApp
      await sendWhatsAppOtp(formattedPhone, freshOtp, updatedUser.name);

      return NextResponse.json({
        success: true,
        requiresOtp: true,
        userId: updatedUser.id,
        phone: formattedPhone,
        name: updatedUser.name,
        address: updatedUser.address,
        isNewUser: false,
        message: "Kode OTP verifikasi WhatsApp telah dikirim!",
        debugOtp: process.env.NODE_ENV !== "production" ? freshOtp : undefined,
      });
    }

    // Create new user account automatically with auto-generated credentials
    const cleanUsername = `user_${formattedPhone}`;
    const cleanEmail = `${formattedPhone}@trij.co.id`;
    const randomPass = Math.random().toString(36).substring(2, 12);
    const hashedPassword = await hashPassword(randomPass);

    const newUser = await db.user.create({
      data: {
        name: cleanName,
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
        phone: formattedPhone,
        address: cleanAddress || null,
        role: "USER",
        isVerified: false,
        otpCode: freshOtp,
        otpExpiresAt: otpExpiry,
      },
    });

    // Send WhatsApp OTP
    await sendWhatsAppOtp(formattedPhone, freshOtp, newUser.name);

    return NextResponse.json({
      success: true,
      requiresOtp: true,
      userId: newUser.id,
      phone: formattedPhone,
      name: newUser.name,
      address: newUser.address,
      isNewUser: true,
      message: "Akun baru dibuat! Kode OTP verifikasi WhatsApp telah dikirim.",
      debugOtp: process.env.NODE_ENV !== "production" ? freshOtp : undefined,
    });
  } catch (error: any) {
    console.error("Quick OTP Register/Login Error:", error);
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan saat memproses WhatsApp OTP." },
      { status: 500 }
    );
  }
}
