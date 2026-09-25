import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    const products = await db.product.findMany({
      include: { variants: true }
    });

    let updatedCount = 0;

    for (const product of products) {
      if (!product.variants || product.variants.length === 0) continue;

      // Check if product variants contain legacy matrix format " - " (e.g. "MERAH RUBY - BUBBLE LUAR")
      const hasMatrixName = product.variants.some((v) => v.name.includes(" - "));
      if (!hasMatrixName) continue;

      const rawGroupName = product.variants[0]?.groupName || "WARNA | BUBBLE PACKAGE";
      let g1Name = "WARNA";
      let g2Name = "BUBBLE PACKAGE";

      if (rawGroupName.includes("::")) {
        const headerPart = rawGroupName.split("::")[0];
        if (headerPart.includes(" | ")) {
          const [p1, p2] = headerPart.split(" | ");
          if (p1 && p1.trim()) g1Name = p1.trim();
          if (p2 && p2.trim()) g2Name = p2.trim();
        }
      } else if (rawGroupName.includes(" | ")) {
        const [p1, p2] = rawGroupName.split(" | ");
        if (p1 && p1.trim()) g1Name = p1.trim();
        if (p2 && p2.trim()) g2Name = p2.trim();
      }

      // Group variants by primary physical variant (Part 1 before " - ")
      const g1Map = new Map<string, { basePrice: number; maxStock: number; image: string }>();
      const g2AddOnMap = new Map<string, number>(); // optionName -> extraPrice

      // First pass: find base prices for each primary physical variant
      product.variants.forEach((v) => {
        const nameParts = v.name.split(" - ");
        const primaryName = nameParts[0]?.trim() || v.name.trim();
        const price = Number(v.price) || 0;
        const stock = Number(v.stock) || 0;

        if (!g1Map.has(primaryName)) {
          g1Map.set(primaryName, {
            basePrice: price,
            maxStock: stock,
            image: v.image || ""
          });
        } else {
          const existing = g1Map.get(primaryName)!;
          if (price > 0 && (existing.basePrice === 0 || price < existing.basePrice)) {
            existing.basePrice = price;
          }
          if (stock > existing.maxStock) {
            existing.maxStock = stock;
          }
          if (!existing.image && v.image) {
            existing.image = v.image;
          }
        }
      });

      // Second pass: compute extra prices for Add-On options
      product.variants.forEach((v) => {
        const nameParts = v.name.split(" - ");
        const primaryName = nameParts[0]?.trim() || v.name.trim();
        const addOnName = nameParts[1]?.trim() || "";
        const price = Number(v.price) || 0;

        if (addOnName) {
          const primaryBase = g1Map.get(primaryName)?.basePrice || price;
          const extra = Math.max(0, price - primaryBase);
          if (!g2AddOnMap.has(addOnName) || extra < g2AddOnMap.get(addOnName)!) {
            g2AddOnMap.set(addOnName, extra);
          }
        }
      });

      // Construct metadata string for Group 2 Add-Ons
      const addOnMeta = Array.from(g2AddOnMap.entries())
        .map(([optName, extraVal]) => `${optName}:+${extraVal}`)
        .join("|");

      const fullGroupName = addOnMeta
        ? `${g1Name} | ${g2Name}::${addOnMeta}`
        : g1Name;

      // Transaction: Delete old matrix rows for this product and create clean physical variant rows
      await db.$transaction(async (tx) => {
        await tx.productVariant.deleteMany({
          where: { productId: product.id }
        });

        const newVariantsData = Array.from(g1Map.entries()).map(([colorName, info]) => ({
          productId: product.id,
          groupName: fullGroupName,
          name: colorName,
          price: info.basePrice > 0 ? info.basePrice : Number(product.retailPrice) || 0,
          stock: info.maxStock,
          image: info.image || null,
        }));

        if (newVariantsData.length > 0) {
          await tx.productVariant.createMany({
            data: newVariantsData
          });
        }

        // Update total product stock sum
        const totalStockSum = newVariantsData.reduce((sum, v) => sum + v.stock, 0);
        await tx.product.update({
          where: { id: product.id },
          data: { stock: totalStockSum }
        });
      });

      updatedCount++;
    }

    return NextResponse.json({ success: true, updatedCount });
  } catch (error: any) {
    console.error("Clean variants API error:", error);
    return NextResponse.json({ error: error.message || "Gagal merapikan variasi database." }, { status: 500 });
  }
}
