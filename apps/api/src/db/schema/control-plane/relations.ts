import { relations } from "drizzle-orm/_relations";
import { tenants } from "./tenants";
import { tenantDbCredentials } from "./tenant-credentials";
import { subscriptions } from "./subscriptions";
import { billingInvoices } from "./billing-invoices";

export const tenantsRelations = relations(tenants, ({ one, many }) => ({
  dbCredentials: one(tenantDbCredentials, {
    fields: [tenants.id],
    references: [tenantDbCredentials.tenantId],
  }),
  subscriptions: many(subscriptions),
  invoices: many(billingInvoices),
}));

export const subscriptionsRelations = relations(
  subscriptions,
  ({ one, many }) => ({
    tenant: one(tenants, {
      fields: [subscriptions.tenantId],
      references: [tenants.id],
    }),
    invoices: many(billingInvoices),
  }),
);

export const billingInvoicesRelations = relations(
  billingInvoices,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [billingInvoices.tenantId],
      references: [tenants.id],
    }),
    subscription: one(subscriptions, {
      fields: [billingInvoices.subscriptionId],
      references: [subscriptions.id],
    }),
  }),
);
