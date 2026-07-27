import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const testimonialId = Number(id);

  try {
    const { type, name, role, review, avatar, isActive } = await req.json();

    const updated = await db.testimonial.update({
      where: { id: testimonialId },
      data: {
        type: type === "MEMBER" ? "MEMBER" : "MARKETPLACE",
        name,
        role: role || null,
        review,
        avatar: avatar || null,
        isActive,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update testimonial error:", error);
    return NextResponse.json({ error: "Gagal memperbarui testimoni." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const testimonialId = Number(id);

  try {
    await db.testimonial.delete({ where: { id: testimonialId } });
    return NextResponse.json({ success: true, message: "Testimoni berhasil dihapus." });
  } catch (error) {
    console.error("Delete testimonial error:", error);
    return NextResponse.json({ error: "Gagal menghapus testimoni." }, { status: 500 });
  }
}
