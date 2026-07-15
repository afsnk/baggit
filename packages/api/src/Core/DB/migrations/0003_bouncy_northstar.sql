PRAGMA foreign_keys=OFF;
CREATE TABLE `__new_payments` (
	`id` text PRIMARY KEY NOT NULL,
	`currency` text NOT NULL,
	`method` text DEFAULT 'bank-transfer' NOT NULL,
	`callback_url` text NOT NULL,
	`amount` real DEFAULT 0 NOT NULL,
	`currency_rate` real DEFAULT 1395,
	`org_id` text NOT NULL,
	`invoice_id` text NOT NULL,
	`metadata` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`org_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoice`(`id`) ON UPDATE no action ON DELETE restrict
);

INSERT INTO `__new_payments`("id", "currency", "method", "callback_url", "amount", "currency_rate", "org_id", "invoice_id", "metadata", "created_at", "updated_at") SELECT "id", "currency", "method", "callback_url", "amount", "currency_rate", "org_id", "invoice_id", "metadata", "created_at", "updated_at" FROM `payments`;
DROP TABLE `payments`;
ALTER TABLE `__new_payments` RENAME TO `payments`;
PRAGMA foreign_keys=ON;
CREATE INDEX `invoice_idx` ON `payments` (`invoice_id`);
CREATE INDEX `currency_idx` ON `payments` (`currency`);
CREATE INDEX `method_idx` ON `payments` (`method`);