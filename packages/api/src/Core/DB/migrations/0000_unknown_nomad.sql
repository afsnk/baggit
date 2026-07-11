CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `account_userId_idx` ON `account` (`user_id`);
CREATE TABLE `apikey` (
	`id` text PRIMARY KEY NOT NULL,
	`config_id` text DEFAULT 'default' NOT NULL,
	`name` text,
	`start` text,
	`reference_id` text NOT NULL,
	`prefix` text,
	`key` text NOT NULL,
	`refill_interval` integer,
	`refill_amount` integer,
	`last_refill_at` integer,
	`enabled` integer DEFAULT true,
	`rate_limit_enabled` integer DEFAULT true,
	`rate_limit_time_window` integer DEFAULT 86400000,
	`rate_limit_max` integer DEFAULT 10,
	`request_count` integer DEFAULT 0,
	`remaining` integer,
	`last_request` integer,
	`expires_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`permissions` text,
	`metadata` text
);

CREATE INDEX `apikey_configId_idx` ON `apikey` (`config_id`);
CREATE INDEX `apikey_referenceId_idx` ON `apikey` (`reference_id`);
CREATE INDEX `apikey_key_idx` ON `apikey` (`key`);
CREATE TABLE `invitation` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`email` text NOT NULL,
	`role` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`inviter_id` text NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`inviter_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `invitation_organizationId_idx` ON `invitation` (`organization_id`);
CREATE INDEX `invitation_email_idx` ON `invitation` (`email`);
CREATE TABLE `member` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `member_organizationId_idx` ON `member` (`organization_id`);
CREATE INDEX `member_userId_idx` ON `member` (`user_id`);
CREATE TABLE `organization` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`logo` text,
	`created_at` integer NOT NULL,
	`metadata` text
);

CREATE UNIQUE INDEX `organization_slug_unique` ON `organization` (`slug`);
CREATE UNIQUE INDEX `organization_slug_uidx` ON `organization` (`slug`);
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	`active_organization_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`is_anonymous` integer DEFAULT false,
	`image` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);

CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);

CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);
CREATE TABLE `invoice` (
	`id` text PRIMARY KEY NOT NULL,
	`to` text NOT NULL,
	`from` text NOT NULL,
	`amount` real NOT NULL,
	`reference` text NOT NULL,
	`memo` text,
	`metadata` text,
	`created_at` integer,
	`updated_at` integer
);

CREATE INDEX `invoice_reference_idx` ON `invoice` (`reference`);
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`currency` text NOT NULL,
	`method` text NOT NULL,
	`callback_url` text NOT NULL,
	`org_id` text NOT NULL,
	`invoice_id` text NOT NULL,
	`metadata` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`org_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoice`(`id`) ON UPDATE no action ON DELETE restrict
);

CREATE INDEX `invoice_idx` ON `payments` (`invoice_id`);
CREATE INDEX `currency_idx` ON `payments` (`currency`);
CREATE INDEX `method_idx` ON `payments` (`method`);
CREATE TABLE `ramps` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`type` text,
	`created_at` integer,
	`updated_at` integer
);

CREATE INDEX `ramp_reference_Idx` ON `ramps` (`reference`);
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'pending',
	`network` text DEFAULT 'base' NOT NULL,
	`asset` text NOT NULL,
	`payment_id` text,
	`ramp_id` text,
	`org_id` text,
	`metadata` text NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`ramp_id`) REFERENCES `ramps`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`org_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE INDEX `transactions_status_idx` ON `transactions` (`status`);
CREATE INDEX `transactions_network_idx` ON `transactions` (`network`);
CREATE INDEX `transactions_asset_idx` ON `transactions` (`asset`);