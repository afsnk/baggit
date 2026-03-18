ALTER TABLE `transactions` ALTER COLUMN "network" TO "network" text NOT NULL DEFAULT 'base';--> statement-breakpoint
ALTER TABLE `transactions` ADD `merchant_metadata` text;