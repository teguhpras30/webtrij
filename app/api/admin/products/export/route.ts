import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser || authUser.role?.trim().toUpperCase() !== "ADMIN") {
      return NextResponse.json({ error: "Akses ditolak. Membutuhkan hak akses Admin." }, { status: 403 });
    }

    const products = await db.product.findMany({
      include: {
        category: true,
        variants: true,
      },
      orderBy: { id: "asc" },
    });

    const headers = [
      "Nama Produk",
      "Kategori",
      "Harga Eceran (IDR)",
      "Stok Dasar",
      "MOQ (Min Beli)",
      "Berat (gram)",
      "Panjang (cm)",
      "Lebar (cm)",
      "Tinggi (cm)",
      "Deskripsi",
      "URL Thumbnail",
      "Buyer Only (TRUE/FALSE)",
      "Is Popular (TRUE/FALSE)",
      "Is Deal (TRUE/FALSE)",
      "Variasi (Nama=Harga=Stok dipisah |)",
    ];

    const csvRows: string[] = [];
    // Add BOM for Excel UTF-8 display compatibility
    csvRows.push("\uFEFF" + headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(","));

    for (const p of products) {
      const variantStr = (p.variants || [])
        .map((v) => `${v.name}=${v.price || 0}=${v.stock || 0}`)
        .join(" | ");

      const row = [
        p.name || "",
        p.category?.name || "",
        p.retailPrice || 0,
        p.stock || 0,
        p.moq || 1,
        p.weightGram || 1000,
        p.lengthCm || 20,
        p.widthCm || 20,
        p.heightCm || 20,
        (p.description || "").replace(/\n/g, " "),
        p.thumbnail || "",
        p.isBuyerOnly ? "TRUE" : "FALSE",
        p.isPopular ? "TRUE" : "FALSE",
        p.isDeal ? "TRUE" : "FALSE",
        variantStr,
      ];

      const formattedRow = row.map((field) => {
        const val = String(field !== undefined && field !== null ? field : "");
        return `"${val.replace(/"/g, '""')}"`;
      });

      csvRows.push(formattedRow.join(","));
    }

    const csvContent = csvRows.join("\r\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="data_produk_webtrij_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error: any) {
    console.error("Error exporting products to CSV:", error);
    return NextResponse.json({ error: "Gagal meng-export data produk ke CSV." }, { status: 500 });
  }
}
