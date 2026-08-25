CREATE TABLE `tenants` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`owner_email` text NOT NULL,
	`owner_name` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tenants_slug_unique` ON `tenants` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `tenants_owner_email_unique` ON `tenants` (`owner_email`);--> statement-breakpoint
CREATE TABLE `tenant_db_credentials` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`turso_db_name` text NOT NULL,
	`db_url` text NOT NULL,
	`auth_token` text NOT NULL,
	`region` text,
	`provisioned_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tenant_db_credentials_tenant_id_unique` ON `tenant_db_credentials` (`tenant_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `tenant_db_credentials_turso_db_name_unique` ON `tenant_db_credentials` (`turso_db_name`);--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`price_per_store` real NOT NULL,
	`billing_cycle` text DEFAULT 'monthly' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`current_period_start` integer NOT NULL,
	`current_period_end` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `billing_invoices` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`subscription_id` text NOT NULL,
	`active_stores_count` integer NOT NULL,
	`amount` real NOT NULL,
	`status` text DEFAULT 'unpaid' NOT NULL,
	`issued_at` integer DEFAULT (unixepoch()) NOT NULL,
	`due_at` integer NOT NULL,
	`paid_at` integer,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON UPDATE no action ON DELETE cascade
);
