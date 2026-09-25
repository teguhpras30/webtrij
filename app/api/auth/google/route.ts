import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, createSessionToken, COOKIE_NAME } from "@/lib/auth";
import crypto from "crypto";
import { sendWhatsAppOtp } from "@/lib/whatsapp";

export async function POST(req: Request) {
  try {
    const { email, name, avatar, uid } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email dari Google tidak ditemukan." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Check if user already exists with this email
    let user = await db.user.findFirst({
      where: {
        email: { equals: cleanEmail, mode: "insensitive" },
      },
    });

    if (user) {
      // Sync avatar from Google if provided
      const updateData: { avatar?: string; name?: string } = {};
      if (avatar) updateData.avatar = avatar;
      if (!user.name && name) updateData.name = name;

      if (Object.keys(updateData).length > 0) {
        user = await db.user.update({
          where: { id: user.id },
          data: updateData,
        });
      }
    } else {
      // Create new user for Google login
      const emailPrefix = cleanEmail.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "");
      let baseUsername = emailPrefix || "user";
      let uniqueUsername = baseUsername;
      let counter = 1;

      while (await db.user.findFirst({ where: { username: { equals: uniqueUsername, mode: "insensitive" } } })) {
        uniqueUsername = `${baseUsername}_${counter}`;
        counter++;
      }

      // Generate secure random password for OAuth user (hasPasswordSet = false)
      const randomSecret = crypto.randomBytes(16).toString("hex");
      const hashedPassword = await hashPassword(randomSecret);

      user = await db.user.create({
        data: {
          email: cleanEmail,
          username: uniqueUsername,
          name: name || uniqueUsername,
          avatar: avatar || null,
          password: hashedPassword,
          hasPasswordSet: false, // Google SSO user has not set custom password yet
          isVerified: false, // Requires WhatsApp OTP verification
          role: "USER",
        },
      });
    }

    // Check if account is verified via WhatsApp OTP or has a verified phone number
    if (user.isVerified === false || !user.phone) {
      const freshOtp = Math.floor(1000 + Math.random() * 9000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

      await db.user.update({
        where: { id: user.id },
        data: { isVerified: false, otpCode: freshOtp, otpExpiresAt: otpExpiry },
      });

      if (user.phone) {
        await sendWhatsAppOtp(user.phone, freshOtp, user.name);
      }

      return NextResponse.json({
        requiresOtp: true,
        userId: user.id,
        phone: user.phone || "",
        message: "Login Google berhasil! Masukkan nomor WhatsApp Anda untuk verifikasi OTP.",
        debugOtp: process.env.NODE_ENV !== "production" ? freshOtp : undefined,
      });
    }

    // Create session JWT token
    const token = await createSessionToken({
      id: user.id,
      username: user.username || user.email,
      email: user.email,
    });

    const response = NextResponse.json({
      success: true,
      message: "Login Google berhasil!",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        hasPasswordSet: user.hasPasswordSet,
      },
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Google Auth error:", error);
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan saat verifikasi login Google." },
      { status: 500 }
    );
  }
}
