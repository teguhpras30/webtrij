import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, createSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { name, username, email, password, phone } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, Email, dan Password wajib diisi." },
        { status: 400 }
      );
    }

    const cleanUsername = String(username).trim();
    const cleanEmail = String(email).trim().toLowerCase();

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
      return NextResponse.json(
        { error: "Username atau Email sudah terdaftar." },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await db.user.create({
      data: {
        name: name || cleanUsername,
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
        phone: phone || null,
        role: "CUSTOMER",
      },
    });

    const token = await createSessionToken({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
    });

    const response = NextResponse.json({
      success: true,
      message: "Pendaftaran akun pelanggan berhasil!",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
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
    console.error("Register error:", error);
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan saat pendaftaran akun." },
      { status: 500 }
    );
  }
}
