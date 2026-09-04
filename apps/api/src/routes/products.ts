import { Elysia, t } from "elysia";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { products, productVariants } from "../db/schema/template";

export const productsRoute = new Elysia({ prefix: "/products" })
  .get("/", async () => {
    return await db.query.products.findMany({
      with: {
        category: true,
        variants: true,
        modifiers: true,
      },
    });
  })
  .get("/:id", async ({ params: { id }, status }) => {
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: {
        category: true,
        variants: true,
        modifiers: true,
      },
    });
    if (!product) return status(404, { message: "Produk tidak ditemukan" });
    return product;
  }, {
    params: t.Object({ id: t.String() }),
  })
  .post("/", async ({ body, status }) => {
    const [newProduct] = await db
      .insert(products)
      .values({
        name: body.name,
        categoryId: body.categoryId ?? null,
        sku: body.sku ?? null,
        barcode: body.barcode ?? null,
        basePrice: body.basePrice,
        costPrice: body.costPrice ?? 0,
        imageUrl: body.imageUrl ?? null,
        isActive: body.isActive ?? true,
      })
      .returning();

    if (!newProduct) {
      return status(500, { message: "Gagal membuat produk" });
    }

    if (body.variants && body.variants.length > 0) {
      await db.insert(productVariants).values(
        body.variants.map((v) => ({
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
  }, {
    body: t.Object({
      name: t.String({ minLength: 1 }),
      categoryId: t.Optional(t.Nullable(t.String())),
      sku: t.Optional(t.Nullable(t.String())),
      barcode: t.Optional(t.Nullable(t.String())),
      basePrice: t.Number({ minimum: 0 }),
      costPrice: t.Optional(t.Number({ minimum: 0 })),
      imageUrl: t.Optional(t.Nullable(t.String())),
      isActive: t.Optional(t.Boolean()),
      variants: t.Optional(
        t.Array(
          t.Object({
            name: t.String({ minLength: 1 }),
            priceAdjustment: t.Optional(t.Number()),
            sku: t.Optional(t.Nullable(t.String())),
            isActive: t.Optional(t.Boolean()),
          })
        )
      ),
    }),
  })
  .put("/:id", async ({ params: { id }, body, status }) => {
    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.categoryId !== undefined) updates.categoryId = body.categoryId;
    if (body.sku !== undefined) updates.sku = body.sku;
    if (body.barcode !== undefined) updates.barcode = body.barcode;
    if (body.basePrice !== undefined) updates.basePrice = body.basePrice;
    if (body.costPrice !== undefined) updates.costPrice = body.costPrice;
    if (body.imageUrl !== undefined) updates.imageUrl = body.imageUrl;
    if (body.isActive !== undefined) updates.isActive = body.isActive;

    const [updated] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();

    if (!updated) return status(404, { message: "Produk tidak ditemukan" });

    if (body.variants !== undefined) {
      await db.delete(productVariants).where(eq(productVariants.productId, id));
      if (body.variants.length > 0) {
        await db.insert(productVariants).values(
          body.variants.map((v) => ({
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
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      name: t.Optional(t.String({ minLength: 1 })),
      categoryId: t.Optional(t.Nullable(t.String())),
      sku: t.Optional(t.Nullable(t.String())),
      barcode: t.Optional(t.Nullable(t.String())),
      basePrice: t.Optional(t.Number({ minimum: 0 })),
      costPrice: t.Optional(t.Number({ minimum: 0 })),
      imageUrl: t.Optional(t.Nullable(t.String())),
      isActive: t.Optional(t.Boolean()),
      variants: t.Optional(
        t.Array(
          t.Object({
            name: t.String({ minLength: 1 }),
            priceAdjustment: t.Optional(t.Number()),
            sku: t.Optional(t.Nullable(t.String())),
            isActive: t.Optional(t.Boolean()),
          })
        )
      ),
    }),
  })
  .delete("/:id", async ({ params: { id }, status }) => {
    const [deleted] = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning();
    if (!deleted) return status(404, { message: "Produk tidak ditemukan" });
    return { success: true, id };
  }, {
    params: t.Object({ id: t.String() }),
  });
