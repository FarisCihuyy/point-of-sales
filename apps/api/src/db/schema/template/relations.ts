import { relations } from "drizzle-orm/_relations";
import { payments } from "./payments";
import { stores } from "./stores";
import { users } from "./users";
import { transactions } from "./transactions";
import { inventoryMovements } from "./inventory_movements";
import { shifts } from "./shifts";
import { products } from "./products";
import { productVariants } from "./product-variants";
import { categories } from "./categories";
import { transactionItems } from "./transaction-items";

export const storesRelations = relations(stores, ({ many }) => ({
  users: many(users),
  transactions: many(transactions),
  inventoryMovements: many(inventoryMovements),
  shifts: many(shifts),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  variants: many(productVariants),
}));

export const productVariantsRelations = relations(
  productVariants,
  ({ one }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
  }),
);

export const transactionsRelations = relations(
  transactions,
  ({ one, many }) => ({
    store: one(stores, {
      fields: [transactions.storeId],
      references: [stores.id],
    }),
    cashier: one(users, {
      fields: [transactions.cashierId],
      references: [users.id],
    }),
    items: many(transactionItems),
    payments: many(payments),
  }),
);

export const transactionItemsRelations = relations(
  transactionItems,
  ({ one }) => ({
    transaction: one(transactions, {
      fields: [transactionItems.transactionId],
      references: [transactions.id],
    }),
    product: one(products, {
      fields: [transactionItems.productId],
      references: [products.id],
    }),
  }),
);

export const paymentsRelations = relations(payments, ({ one }) => ({
  transaction: one(transactions, {
    fields: [payments.transactionId],
    references: [transactions.id],
  }),
}));
