CREATE TABLE `attendances` (
	`id` text PRIMARY KEY NOT NULL,
	`store_id` text NOT NULL,
	`userId` text NOT NULL,
	`schedule_id` text,
	`clock_in` integer NOT NULL,
	`clock_out` integer,
	`status` text DEFAULT 'on_time' NOT NULL,
	`notes` text,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`schedule_id`) REFERENCES `shift_schedules`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`email` text,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `floor_areas` (
	`id` text PRIMARY KEY NOT NULL,
	`store_id` text NOT NULL,
	`name` text NOT NULL,
	`level` integer DEFAULT 1 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `inventory_items` (
	`id` text PRIMARY KEY NOT NULL,
	`store_id` text NOT NULL,
	`name` text NOT NULL,
	`sku` text,
	`category` text,
	`uom` text DEFAULT 'pcs' NOT NULL,
	`min_stock` integer DEFAULT 5 NOT NULL,
	`current_stock` integer DEFAULT 0 NOT NULL,
	`cost_price` real DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `product_modifiers` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`name` text NOT NULL,
	`price` real DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `purchase_order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`purchase_order_id` text NOT NULL,
	`inventory_item_id` text,
	`quantity_ordered` integer NOT NULL,
	`quantity_received` integer DEFAULT 0 NOT NULL,
	`unit_cost` real NOT NULL,
	`line_total` real NOT NULL,
	FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `purchase_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`store_id` text NOT NULL,
	`supplier_id` text,
	`po_number` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`total_amount` real DEFAULT 0 NOT NULL,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `reservations` (
	`id` text PRIMARY KEY NOT NULL,
	`store_id` text NOT NULL,
	`table_id` text,
	`customer_name` text NOT NULL,
	`customer_phone` text NOT NULL,
	`reserved_at` integer NOT NULL,
	`pax` integer DEFAULT 1 NOT NULL,
	`deposit_amount` real DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'booked' NOT NULL,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`table_id`) REFERENCES `tables`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `shift_schedules` (
	`id` text PRIMARY KEY NOT NULL,
	`store_id` text NOT NULL,
	`name` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `stock_opname_items` (
	`id` text PRIMARY KEY NOT NULL,
	`opname_id` text NOT NULL,
	`inventory_item_id` text NOT NULL,
	`system_stock` integer NOT NULL,
	`physical_stock` integer NOT NULL,
	`discrepancy` integer NOT NULL,
	`reason` text,
	FOREIGN KEY (`opname_id`) REFERENCES `stock_opnames`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `stock_opnames` (
	`id` text PRIMARY KEY NOT NULL,
	`store_id` text NOT NULL,
	`conducted_by` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`conducted_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `stock_transfer_items` (
	`id` text PRIMARY KEY NOT NULL,
	`transfer_id` text NOT NULL,
	`inventory_item_id` text NOT NULL,
	`quantity` integer NOT NULL,
	FOREIGN KEY (`transfer_id`) REFERENCES `stock_transfers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `stock_transfers` (
	`id` text PRIMARY KEY NOT NULL,
	`from_store_id` text NOT NULL,
	`to_store_id` text NOT NULL,
	`transfer_number` text NOT NULL,
	`status` text DEFAULT 'requested' NOT NULL,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`from_store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`to_store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`contact_person` text,
	`phone` text,
	`email` text,
	`address` text,
	`payment_terms` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tables` (
	`id` text PRIMARY KEY NOT NULL,
	`store_id` text NOT NULL,
	`area_id` text,
	`table_number` text NOT NULL,
	`capacity` integer DEFAULT 4 NOT NULL,
	`status` text DEFAULT 'available' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`area_id`) REFERENCES `floor_areas`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
DROP INDEX `product_variants_sku_unique`;--> statement-breakpoint
DROP INDEX `products_sku_unique`;--> statement-breakpoint
DROP INDEX `products_barcode_unique`;--> statement-breakpoint
ALTER TABLE `products` ADD `cost_price` real DEFAULT 0 NOT NULL;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_inventory_movements` (
	`id` text PRIMARY KEY NOT NULL,
	`store_id` text NOT NULL,
	`product_id` text,
	`variant_id` text,
	`inventory_item_id` text,
	`quantity_delta` integer NOT NULL,
	`reason` text NOT NULL,
	`reference_id` text,
	`note` text,
	`created_by` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_inventory_movements`("id", "store_id", "product_id", "variant_id", "inventory_item_id", "quantity_delta", "reason", "reference_id", "note", "created_by", "created_at") SELECT "id", "store_id", "product_id", "variant_id", NULL, "quantity_delta", "reason", "reference_id", "note", "created_by", "created_at" FROM `inventory_movements`;--> statement-breakpoint
DROP TABLE `inventory_movements`;--> statement-breakpoint
ALTER TABLE `__new_inventory_movements` RENAME TO `inventory_movements`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `payments` ADD `reference_number` text;--> statement-breakpoint
ALTER TABLE `payments` ADD `payment_status` text DEFAULT 'success' NOT NULL;--> statement-breakpoint
ALTER TABLE `shifts` ADD `expected_cash` real;--> statement-breakpoint
ALTER TABLE `shifts` ADD `discrepancy` real;--> statement-breakpoint
ALTER TABLE `shifts` ADD `note` text;--> statement-breakpoint
ALTER TABLE `stores` ADD `tax_rate` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `stores` ADD `service_charge_rate` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `transaction_items` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `transactions` ADD `customer_id` text REFERENCES customers(id);--> statement-breakpoint
ALTER TABLE `transactions` ADD `table_id` text REFERENCES tables(id);--> statement-breakpoint
ALTER TABLE `transactions` ADD `service_charge_total` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `pin` text;