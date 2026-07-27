import { db } from "./db";
import { heroSlides as staticHeroSlides } from "@/data/heroSlides";
import { categories as staticCategories } from "@/data/categories";
import { allProducts as staticProducts } from "@/data/Products";
import { testimonials as staticMemberTestimonials } from "@/data/testimoniMember";
import staticTestimonialMarketplace from "@/data/testimonialMarketplace";

export async function getPublicHeroSlides() {
  try {
    const slides = await db.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    if (slides && slides.length > 0) return slides;
  } catch (e) {
    console.error("Error fetching db heroSlides, using static fallback:", e);
  }
  return staticHeroSlides;
}

export async function getPublicCategories() {
  try {
    const dbCategories = await db.category.findMany({
      orderBy: { name: "asc" },
    });
    if (dbCategories && dbCategories.length > 0) {
      return dbCategories.map((c) => c.name);
    }
  } catch (e) {
    console.error("Error fetching db categories, using static fallback:", e);
  }
  return staticCategories;
}

export async function getPublicProducts() {
  try {
    const dbProducts = await db.product.findMany({
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { id: "asc" },
    });

    if (dbProducts && dbProducts.length > 0) {
      return dbProducts.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        category: p.category.name,
        description: p.description,
        sold: p.sold,
        image: p.thumbnail,
        images: p.images.map((img) => img.image),
        isPopular: p.isPopular,
        isDeal: p.isDeal,
      }));
    }
  } catch (e) {
    console.error("Error fetching db products, using static fallback:", e);
  }
  return staticProducts;
}

export async function getPublicProductById(id: number) {
  try {
    const p = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (p) {
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        category: p.category.name,
        description: p.description,
        sold: p.sold,
        image: p.thumbnail,
        images: p.images.map((img) => img.image),
        isPopular: p.isPopular,
        isDeal: p.isDeal,
      };
    }
  } catch (e) {
    console.error("Error fetching db product by id:", e);
  }
  return staticProducts.find((p) => p.id === id) || null;
}

export async function getPublicTestimonials() {
  try {
    const dbTestimonials = await db.testimonial.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    if (dbTestimonials && dbTestimonials.length > 0) {
      const member = dbTestimonials
        .filter((t) => t.type === "MEMBER")
        .map((t) => ({ name: t.name, role: t.role || "", message: t.review }));

      const marketplace = dbTestimonials
        .filter((t) => t.type === "MARKETPLACE")
        .map((t) => ({ name: t.name, review: t.review, avatar: t.avatar || "/assets/avatar/user.png" }));

      return {
        member: member.length > 0 ? member : staticMemberTestimonials,
        marketplace: marketplace.length > 0 ? marketplace : staticTestimonialMarketplace,
      };
    }
  } catch (e) {
    console.error("Error fetching db testimonials, using static fallback:", e);
  }

  return {
    member: staticMemberTestimonials,
    marketplace: staticTestimonialMarketplace,
  };
}
