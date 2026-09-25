import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;
    const userId = Number(id);
    if (!userId) {
      return NextResponse.json({ error: "ID User tidak valid." }, { status: 400 });
    }

    const body = await request.json();
    const { name, email, phone, address, role } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Nama dan Email wajib diisi." }, { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        name: name.trim(),
        email: email.trim(),
        phone: phone ? phone.trim() : null,
        address: address ? address.trim() : null,
        role: role ? String(role).trim().toUpperCase() : "USER",
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            wishlists: true,
          },
        },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            customerName: true,
            customerPhone: true,
            shippingAddress: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("PUT /api/admin/users/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memperbarui data user." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;
    const userId = Number(id);
    if (!userId) {
      return NextResponse.json({ error: "ID User tidak valid." }, { status: 400 });
    }

    // Prevent deleting the main logged-in admin account
    if (admin.id === userId) {
      return NextResponse.json(
        { error: "Anda tidak dapat menghapus akun admin Anda sendiri yang sedang aktif." },
        { status: 400 }
      );
    }

    // Cascade clean wishlists and detach user from orders
    await db.wishlist.deleteMany({ where: { userId } });
    await db.order.updateMany({
      where: { userId },
      data: { userId: null },
    });

    await db.user.delete({ where: { id: userId } });

    return NextResponse.json({ message: "User berhasil dihapus." });
  } catch (error: any) {
    console.error("DELETE /api/admin/users/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menghapus user." },
      { status: 500 }
    );
  }
}
