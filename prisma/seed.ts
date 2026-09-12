// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // --- Admin user ---
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  await prisma.user.upsert({
    where: { email: "admin@bdshop.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@bdshop.com",
      phone: "01700000001",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // --- Demo customer ---
  const customerPassword = await bcrypt.hash("Customer@123", 10);
  await prisma.user.upsert({
    where: { email: "customer@bdshop.com" },
    update: {},
    create: {
      name: "Karim Ahmed",
      email: "customer@bdshop.com",
      phone: "01700000002",
      password: customerPassword,
      role: "CUSTOMER",
    },
  });

  // --- Demo staff (order management only — no product/coupon/review access) ---
  const staffPassword = await bcrypt.hash("Staff@123", 10);
  await prisma.user.upsert({
    where: { email: "staff@bdshop.com" },
    update: {},
    create: {
      name: "Order Staff",
      email: "staff@bdshop.com",
      phone: "01700000003",
      password: staffPassword,
      role: "STAFF",
    },
  });

  // --- Categories ---
  const categoryData = [
    { name: "ইলেকট্রনিক্স", slug: "electronics" },
    { name: "ফ্যাশন", slug: "fashion" },
    { name: "হোম অ্যান্ড লিভিং", slug: "home-living" },
    { name: "বিউটি", slug: "beauty" },
  ];

  const categories = [];
  for (const c of categoryData) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    categories.push(cat);
  }

  // --- Products ---
  const productData = [
    {
      name: "ওয়্যারলেস ব্লুটুথ হেডফোন",
      slug: "wireless-bluetooth-headphone",
      description: "উচ্চ মানের সাউন্ড ও দীর্ঘস্থায়ী ব্যাটারি লাইফ সহ ওয়্যারলেস হেডফোন।",
      price: 1990,
      discountPrice: 1490,
      stock: 25,
      categorySlug: "electronics",
      isFeatured: true,
    },
    {
      name: "স্মার্ট ওয়াচ প্রো",
      slug: "smart-watch-pro",
      description: "হার্ট রেট মনিটর, স্টেপ কাউন্টার ও কল নোটিফিকেশন সহ স্মার্ট ওয়াচ।",
      price: 3500,
      stock: 15,
      categorySlug: "electronics",
      isFeatured: true,
    },
    {
      name: "পুরুষদের কটন পাঞ্জাবি",
      slug: "mens-cotton-panjabi",
      description: "আরামদায়ক ১০০% সুতি কাপড়ে তৈরি পাঞ্জাবি।",
      price: 1200,
      stock: 40,
      categorySlug: "fashion",
      isFeatured: true,
      variants: [
        { label: "M", stock: 15 },
        { label: "L", stock: 15 },
        { label: "XL", price: 1300, stock: 10 },
      ],
    },
    {
      name: "সিরামিক ডিনার সেট (১৬ পিস)",
      slug: "ceramic-dinner-set-16pcs",
      description: "আধুনিক ডিজাইনের সিরামিক ডিনার সেট, ৪ জনের জন্য উপযুক্ত।",
      price: 2800,
      discountPrice: 2400,
      stock: 10,
      categorySlug: "home-living",
      isFeatured: false,
    },
    {
      name: "অর্গানিক ফেস সিরাম",
      slug: "organic-face-serum",
      description: "প্রাকৃতিক উপাদানে তৈরি ত্বক উজ্জ্বলকারী ফেস সিরাম।",
      price: 890,
      stock: 3,
      categorySlug: "beauty",
      isFeatured: true,
    },
  ];

  for (const p of productData) {
    const category = categories.find((c) => c.slug === p.categorySlug)!;
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        discountPrice: p.discountPrice,
        stock: p.stock,
        categoryId: category.id,
        images: ["/placeholder.png"],
        isFeatured: p.isFeatured,
      },
    });

    if ("variants" in p && p.variants) {
      const existingCount = await prisma.productVariant.count({
        where: { productId: product.id },
      });
      if (existingCount === 0) {
        for (const v of p.variants) {
          await prisma.productVariant.create({
            data: {
              productId: product.id,
              label: v.label,
              price: "price" in v ? v.price : null,
              stock: v.stock,
            },
          });
        }
      }
    }
  }

  console.log("Seed complete.");
  console.log("Admin login: admin@bdshop.com / Admin@123");
  console.log("Staff login: staff@bdshop.com / Staff@123");
  console.log("Customer login: customer@bdshop.com / Customer@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
