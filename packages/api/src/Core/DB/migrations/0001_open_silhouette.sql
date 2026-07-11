PRAGMA foreign_keys=OFF;
CREATE TABLE `__new_invoice` (
	`id` text PRIMARY KEY NOT NULL,
	`to` text NOT NULL,
	`from` text NOT NULL,
	`amount` real NOT NULL,
	`reference` text NOT NULL,
	`memo` text,
	`metadata` text NOT NULL,
	`created_at` integer,
	`updated_at` integer
);

INSERT INTO `__new_invoice`("id", "to", "from", "amount", "reference", "memo", "metadata", "created_at", "updated_at") SELECT "id", "to", "from", "amount", "reference", "memo", "metadata", "created_at", "updated_at" FROM `invoice`;
DROP TABLE `invoice`;
ALTER TABLE `__new_invoice` RENAME TO `invoice`;
PRAGMA foreign_keys=ON;
CREATE INDEX `invoice_reference_idx` ON `invoice` (`reference`);
CREATE INDEX `transactions_paymentId_idx` ON `transactions` (`payment_id`);