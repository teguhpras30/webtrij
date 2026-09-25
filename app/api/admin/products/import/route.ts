import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { createProductSlug } from "@/lib/slug";

function parseBoolean(val: any): boolean {
  if (typeof val === "boolean") return val;
  const str = String(val || "").trim().toUpperCase();
  return str === "TRUE" || str === "1" || str === "YES" || str === "YA";
}

function parseVariants(raw: any, defaultPrice: number): { groupName: string; name: string; price: number; stock: number }[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== "string" || !raw.trim()) return [];

  const items = raw.split("|");
  const result: { groupName: string; name: string; price: number; stock: number }[] = [];

  for (const item of items) {
    const clean = item.trim();
    if (!clean) continue;

    const parts = clean.split("=");
    const varName = parts[0]?.trim();
    if (!varName) continue;

    const varPrice = parts[1] !== undefined && parts[1] !== "" ? Number(parts[1]) : defaultPrice;
    const varStock = parts[2] !== undefined && parts[2] !== "" ? Number(parts[2]) : 0;

    result.push({
      groupName: "WARNA",
      name: varName,
      price: isNaN(varPrice) ? defaultPrice : Math.max(0, varPrice),
      stock: isNaN(varStock) ? 0 : Math.max(0, varStock),
    });
  }

  return result;
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser || authUser.role?.trim().toUpperCase() !== "ADMIN") {
      return NextResponse.json({ error: "Akses ditolak. Membutuhkan hak akses Admin." }, { status: 403 });
    }

    const body = await request.json();
    const { products: rawProducts, updateExisting = true } = body;

    if (!Array.isArray(rawProducts) || rawProducts.length === 0) {
      return NextResponse.json({ error: "Data produk yang diunggah kosong." }, { status: 400 });
    }

    // Cache categories to reduce redundant queries
    const existingCategories = await db.category.findMany();
    const categoryMap = new Map<string, number>();
    existingCategories.forEach((c) => categoryMap.set(c.name.toLowerCase().trim(), c.id));

    let createdCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < rawProducts.length; i++) {
      const p = rawProducts[i];
      const name = String(p.name || p["Nama Produk"] || "").trim();

      if (!name) {
        errors.push(`Baris #${i + 1}: Nama produk tidak boleh kosong.`);
        errorCount++;
        continue;
      }

      try {
        // Resolve Category
        const catName = String(p.categoryName || p["Kategori"] || "Perlengkapan Dapur").trim();
        let catId = categoryMap.get(catName.toLowerCase());

        if (!catId) {
          const newSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `cat-${Date.now()}`;
          const newCat = await db.category.create({
            data: { name: catName, slug: newSlug },
          });
          catId = newCat.id;
          categoryMap.set(catName.toLowerCase(), catId);
        }

        const retailPrice = Math.max(0, Number(p.retailPrice || p["Harga Eceran (IDR)"] || p["Harga Eceran"] || 0));
        const baseStock = Math.max(0, Number(p.stock || p["Stok Dasar"] || p["Stok"] || 0));
        const moq = Math.max(1, Number(p.moq || p["MOQ (Min Beli)"] || p["MOQ"] || 1));
        const weightGram = Math.max(1, Number(p.weightGram || p["Berat (gram)"] || p["Berat"] || 1000));
        const lengthCm = Math.max(1, Number(p.lengthCm || p["Panjang (cm)"] || 20));
        const widthCm = Math.max(1, Number(p.widthCm || p["Lebar (cm)"] || 20));
        const heightCm = Math.max(1, Number(p.heightCm || p["Tinggi (cm)"] || 20));
        const description = String(p.description || p["Deskripsi"] || `${name} berkualitas tinggi dari TRI J.`).trim();
        const thumbnail = String(p.thumbnail || p["URL Thumbnail"] || p["Thumbnail"] || "/images/placeholder.webp").trim();

        const isBuyerOnly = parseBoolean(p.isBuyerOnly !== undefined ? p.isBuyerOnly : p["Buyer Only (TRUE/FALSE)"]);
        const isPopular = parseBoolean(p.isPopular !== undefined ? p.isPopular : p["Is Popular (TRUE/FALSE)"]);
        const isDeal = parseBoolean(p.isDeal !== undefined ? p.isDeal : p["Is Deal (TRUE/FALSE)"]);

        const rawVariantStr = p.variants !== undefined ? p.variants : p["Variasi (Nama=Harga=Stok dipisah |)"];
        const parsedVars = parseVariants(rawVariantStr, retailPrice);

        // Check if existing product with exact name exists
        const existingProduct = await db.product.findFirst({
          where: { name: { equals: name, mode: "insensitive" } },
        });

        if (existingProduct && updateExisting) {
          // Update existing product
          await db.product.update({
            where: { id: existingProduct.id },
            data: {
              categoryId: catId,
              description,
              retailPrice,
              stock: baseStock,
              moq,
              weightGram,
              lengthCm,
              widthCm,
              heightCm,
              thumbnail,
              isBuyerOnly,
              isPopular,
              isDeal,
              variants: {
                deleteMany: {},
                create: parsedVars.map((v) => ({
                  groupName: v.groupName,
                  name: v.name,
                  price: v.price,
                  stock: v.stock,
                })),
              },
            },
          });
          updatedCount++;
        } else {
          // Create new product
          const uniqueSlug = createProductSlug(Date.now() + Math.floor(Math.random() * 1000), name);
          await db.product.create({
            data: {
              name,
              slug: uniqueSlug,
              categoryId: catId,
              description,
              retailPrice,
              stock: baseStock,
              moq,
              weightGram,
              lengthCm,
              widthCm,
              heightCm,
              thumbnail,
              sold: "0",
              isBuyerOnly,
              isPopular,
              isDeal,
              variants: {
                create: parsedVars.map((v) => ({
                  groupName: v.groupName,
                  name: v.name,
                  price: v.price,
                  stock: v.stock,
                })),
              },
            },
          });
          createdCount++;
        }
      } catch (rowErr: any) {
        console.error(`Error importing row #${i + 1}:`, rowErr);
        errors.push(`Baris #${i + 1} (${name}): ${rowErr.message || "Gagal mengimpor data."}`);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Proses impor selesai! ${createdCount} dibuat, ${updatedCount} diperbarui, ${errorCount} gagal.`,
      createdCount,
      updatedCount,
      errorCount,
      errors,
    });
  } catch (error: any) {
    console.error("Error processing CSV import API:", error);
    return NextResponse.json({ error: "Gagal memproses file CSV." }, { status: 500 });
  }
}
