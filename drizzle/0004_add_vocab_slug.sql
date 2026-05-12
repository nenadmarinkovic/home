ALTER TABLE `vocab_entries` ADD `slug` text;--> statement-breakpoint
UPDATE `vocab_entries` SET `slug` = lower(hex(randomblob(6))) WHERE `slug` IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `vocab_entries_slug_unique` ON `vocab_entries` (`slug`);
