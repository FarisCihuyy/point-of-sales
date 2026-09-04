import { eq } from "drizzle-orm";
import { status } from "elysia";
import { db } from "../../db";
import { products, productVariants } from "../../db/schema/template";
import type { CreateProductBody, UpdateProductBody } from "./model";

export class ProductService {
  static async getAll() {
    return await db.query.products.findMany({
      with: {
        category: true,
        variants: true,
        modifiers: true,
      },
    });
  }

  static async getById(id: string) {
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: {
        category: true,
        variants: true,
        modifiers: true,
      },
    });

    if (!product) {
      return status(404, { message: "Produk tidak ditemukan" });
    }

    return product;
  }

  static async create(data: CreateProductBody) {
    const [newProduct] = await db
      .insert(products)
      .values({
        name: data.name,
        categoryId: data.categoryId ?? null,
        sku: data.sku ?? null,
        barcode: data.barcode ?? null,
        basePrice: data.basePrice,
        costPrice: data.costPrice ?? 0,
        imageUrl: data.imageUrl ?? null,
        isActive: data.isActive ?? true,
      })
      .returning();

    if (!newProduct) {
      return status(500, { message: "Gagal membuat produk" });
    }

    if (data.variants && data.variants.length > 0) {
      await db.insert(productVariants).values(
        data.variants.map((v) => ({
          productId: newProduct.id,
          name: v.name,
          priceAdjustment: v.priceAdjustment ?? 0,
          sku: v.sku ?? null,
          isActive: v.isActive ?? true,
        }))
      );
    }

    const created = await db.query.products.findFirst({
      where: eq(products.id, newProduct.id),
      with: {
        category: true,
        variants: true,
        modifiers: true,
      },
    });

    return status(201, created);
  }

  static async update(id: string, data: UpdateProductBody) {
    const updates: Record<string, unknown> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.categoryId !== undefined) updates.categoryId = data.categoryId;
    if (data.sku !== undefined) updates.sku = data.sku;
    if (data.barcode !== undefined) updates.barcode = data.barcode;
    if (data.basePrice !== undefined) updates.basePrice = data.basePrice;
    if (data.costPrice !== undefined) updates.costPrice = data.costPrice;
    if (data.imageUrl !== undefined) updates.imageUrl = data.imageUrl;
    if (data.isActive !== undefined) updates.isActive = data.isActive;

    const [updated] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();

    if (!updated) {
      return status(404, { message: "Produk tidak ditemukan" });
    }

    if (data.variants !== undefined) {
      await db.delete(productVariants).where(eq(productVariants.productId, id));
      if (data.variants.length > 0) {
        await db.insert(productVariants).values(
          data.variants.map((v) => ({
            productId: id,
            name: v.name,
            priceAdjustment: v.priceAdjustment ?? 0,
            sku: v.sku ?? null,
            isActive: v.isActive ?? true,
          }))
        );
      }
    }

    const result = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: {
        category: true,
        variants: true,
        modifiers: true,
      },
    });

    return result;
  }

  static async delete(id: string) {
    const [deleted] = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning();

    if (!deleted) {
      return status(404, { message: "Produk tidak ditemukan" });
    }

    return { success: true, id };
  }
}
