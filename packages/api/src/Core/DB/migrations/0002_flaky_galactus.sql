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
ALTER TABLE `payments` ADD `org_id` text REFERENCES organization(id);
ALTER TABLE `transactions` ADD `org_id` text REFERENCES organization(id);