import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import { PrismaClient, TestimonialType } from "../lib/generated/prisma/client";
import { categories } from "../data/categories";
import { allProducts } from "../data/Products";
import { productSections } from "../data/productSections";
import { heroSlides } from "../data/heroSlides";
import { testimonials as memberTestimonials } from "../data/testimoniMember";
import testimonialMarketplace from "../data/testimonialMarketplace";

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  console.log("Starting seeding process...");

  // 0. Seed Admin User
  const defaultPasswordHash = await bcrypt.hash("secretpassword123", 10);
  const adminUser = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      email: "admin@trij.com",
      password: defaultPasswordHash,
      name: "Super Admin",
      role: "ADMIN",
    },
  });
  console.log(`[User] Admin user seeded (Username: ${adminUser.username}, Email: ${adminUser.email})`);

  // 0.1 Seed Customer User
  const customerPasswordHash = await bcrypt.hash("user123456", 10);
  const customerUser = await prisma.user.upsert({
    where: { username: "pelanggan" },
    update: {},
    create: {
      username: "pelanggan",
      email: "pelanggan@trij.com",
      password: customerPasswordHash,
      name: "Budi Santoso",
      phone: "08123456789",
      role: "CUSTOMER",
    },
  });
  console.log(`[User] Customer user seeded (Username: ${customerUser.username}, Email: ${customerUser.email})`);


  // Clear existing testimonials to prevent duplication on re-seeding
  await prisma.testimonial.deleteMany({});


  // 1. Seed Categories
  const categoryMap = new Map<string, number>();

  for (const catName of categories) {
    const slug = slugify(catName);
    const category = await prisma.category.upsert({
      where: { name: catName },
      update: { slug },
      create: {
        name: catName,
        slug,
      },
    });
    categoryMap.set(catName, category.id);
    console.log(`[Category] ${category.name} (ID: ${category.id})`);
  }

  // 2. Seed Products and ProductImages
  const popularSet = new Set<number>(productSections.popular);
  const dealsSet = new Set<number>(productSections.deals);

  const usedSlugs = new Set<string>();

  for (const p of allProducts) {
    let categoryId = categoryMap.get(p.category);
    if (!categoryId) {
      const slug = slugify(p.category);
      const cat = await prisma.category.upsert({
        where: { name: p.category },
        update: { slug },
        create: { name: p.category, slug },
      });
      categoryId = cat.id;
      categoryMap.set(p.category, cat.id);
    }

    let baseSlug = slugify(p.name);
    if (!baseSlug) baseSlug = `product-${p.id}`;
    
    let productSlug = baseSlug;
    if (usedSlugs.has(productSlug)) {
      productSlug = `${baseSlug}-${p.id}`;
    }
    usedSlugs.add(productSlug);

    const isPopular = popularSet.has(p.id);
    const isDeal = dealsSet.has(p.id);

    const product = await prisma.product.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        slug: productSlug,
        description: p.description,
        sold: p.sold,
        thumbnail: p.image,
        categoryId,
        isPopular,
        isDeal,
      },
      create: {
        id: p.id,
        name: p.name,
        slug: productSlug,
        description: p.description,
        sold: p.sold,
        thumbnail: p.image,
        categoryId,
        isPopular,
        isDeal,
      },
    });

    // Refresh images
    await prisma.productImage.deleteMany({
      where: { productId: product.id },
    });

    if (p.images && p.images.length > 0) {
      await prisma.productImage.createMany({
        data: p.images.map((imgUrl, index) => ({
          productId: product.id,
          image: imgUrl,
          sortOrder: index + 1,
        })),
      });
    }

    console.log(`[Product] #${product.id} ${product.name}`);
  }

  // 3. Seed HeroSlides
  for (const slide of heroSlides) {
    await prisma.heroSlide.upsert({
      where: { id: slide.id },
      update: {
        title: slide.title,
        description: slide.description,
        desktopImage: slide.desktopImage,
        mobileImage: slide.mobileImage,
      },
      create: {
        id: slide.id,
        title: slide.title,
        description: slide.description,
        desktopImage: slide.desktopImage,
        mobileImage: slide.mobileImage,
      },
    });
  }
  console.log(`[HeroSlide] Seeded ${heroSlides.length} slides`);

  // 4. Seed Member Testimonials
  for (const m of memberTestimonials) {
    await prisma.testimonial.create({
      data: {
        type: TestimonialType.MEMBER,
        name: m.name,
        role: m.role,
        review: m.message,
      },
    });
  }

  // Seed Marketplace Testimonials
  for (const mp of testimonialMarketplace) {
    await prisma.testimonial.create({
      data: {
        type: TestimonialType.MARKETPLACE,
        name: mp.name,
        review: mp.review,
        avatar: mp.avatar,
      },
    });
  }
  console.log("[Testimonial] Seeded member & marketplace testimonials");

  // Reset PostgreSQL sequences to max(id)
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Product"', 'id'), coalesce(max(id), 1)) FROM "Product";`);
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Category"', 'id'), coalesce(max(id), 1)) FROM "Category";`);
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"HeroSlide"', 'id'), coalesce(max(id), 1)) FROM "HeroSlide";`);
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Testimonial"', 'id'), coalesce(max(id), 1)) FROM "Testimonial";`);
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"User"', 'id'), coalesce(max(id), 1)) FROM "User";`);
  console.log("PostgreSQL auto-increment sequences resynchronized!");

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
