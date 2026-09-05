import "dotenv/config";
import { db } from "./index";
import { categories, products, productVariants } from "./schema/template";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Mulai seeding produk...");

  // 1. Pastikan kategori tersedia (atau buat baru)
  let category = await db.query.categories.findFirst({
    where: eq(categories.name, "Pizza"),
  });

  if (!category) {
    const [newCat] = await db
      .insert(categories)
      .values({
        name: "Pizza",
      })
      .returning();
    category = newCat!;
    console.log(`✅ Kategori dibuat: ${category.name} (${category.id})`);
  } else {
    console.log(`ℹ️ Kategori sudah ada: ${category.name} (${category.id})`);
  }

  // 2. Cek apakah produk sudah ada
  let product = await db.query.products.findFirst({
    where: eq(products.name, "Pizza Margherita"),
  });

  if (!product) {
    const [newProd] = await db
      .insert(products)
      .values({
        categoryId: category.id,
        name: "Pizza Margherita",
        sku: "PZ-MG-001",
        barcode: "899123456701",
        basePrice: 45000,
        costPrice: 22000,
        isActive: true,
      })
      .returning();

    product = newProd!;
    console.log(`✅ Produk berhasil di-seed: ${product.name} (Rp ${product.basePrice})`);

    // Tambah varian
    await db.insert(productVariants).values([
      {
        productId: product.id,
        name: "Regular (8 Inch)",
        priceAdjustment: 0,
        sku: "PZ-MG-001-REG",
        isActive: true,
      },
      {
        productId: product.id,
        name: "Large (12 Inch)",
        priceAdjustment: 25000,
        sku: "PZ-MG-001-LRG",
        isActive: true,
      },
    ]);
    console.log("✅ Varian produk berhasil ditambahkan.");
  } else {
    console.log(`ℹ️ Produk "${product.name}" sudah ada di database.`);
  }

  console.log("🎉 Seeding produk selesai!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding gagal:", err);
  process.exit(1);
});
