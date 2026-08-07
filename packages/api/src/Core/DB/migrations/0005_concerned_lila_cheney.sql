PRAGMA foreign_keys=OFF;
CREATE TABLE `__new_ramps` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`type` text DEFAULT 'sell' NOT NULL,
	`amount` real DEFAULT 0,
	`org_id` text,
	`metadata` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`org_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE no action
);

INSERT INTO `__new_ramps`("id", "reference", "type", "amount", "org_id", "metadata", "created_at", "updated_at") SELECT "id", "reference", "type", "amount", "org_id", "metadata", "created_at", "updated_at" FROM `ramps`;
DROP TABLE `ramps`;
ALTER TABLE `__new_ramps` RENAME TO `ramps`;
PRAGMA foreign_keys=ON;
CREATE INDEX `ramp_reference_Idx` ON `ramps` (`reference`);