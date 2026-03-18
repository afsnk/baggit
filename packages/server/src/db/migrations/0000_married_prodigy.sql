CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`amount` real NOT NULL,
	`callback_url` text DEFAULT 'https://webhook.site/a6428992-34ce-4b09-90c0-7fe778d762e4' NOT NULL,
	`status` text DEFAULT 'pending',
	`network` text DEFAULT 'base' NOT NULL,
	`asset` text NOT NULL,
	`metadata` text NOT NULL,
	`merchant_metadata` text,
	`created_at` integer,
	`updated_at` integer
);
