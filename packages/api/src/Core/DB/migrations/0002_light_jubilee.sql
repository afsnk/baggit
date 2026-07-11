CREATE TABLE `jwks` (
	`id` text PRIMARY KEY NOT NULL,
	`public_key` text NOT NULL,
	`private_key` text NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer
);

PRAGMA foreign_keys=OFF;
CREATE TABLE `__new_payments` (
	`id` text PRIMARY KEY NOT NULL,
	`currency` text NOT NULL,
	`method` text DEFAULT 'crypto' NOT NULL,
	`callback_url` text NOT NULL,
	`org_id` text NOT NULL,
	`invoice_id` text NOT NULL,
	`metadata` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`org_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoice`(`id`) ON UPDATE no action ON DELETE restrict
);

INSERT INTO `__new_payments`("id", "currency", "method", "callback_url", "org_id", "invoice_id", "metadata", "created_at", "updated_at") SELECT "id", "currency", "method", "callback_url", "org_id", "invoice_id", "metadata", "created_at", "updated_at" FROM `payments`;
DROP TABLE `payments`;
ALTER TABLE `__new_payments` RENAME TO `payments`;
PRAGMA foreign_keys=ON;
CREATE INDEX `invoice_idx` ON `payments` (`invoice_id`);
CREATE INDEX `currency_idx` ON `payments` (`currency`);
CREATE INDEX `method_idx` ON `payments` (`method`);
ALTER TABLE `invoice` ADD `currency` text NOT NULL;
ALTER TABLE `invoice` ADD `org_id` text NOT NULL REFERENCES organization(id);