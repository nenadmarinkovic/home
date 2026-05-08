CREATE TABLE `review_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`card_id` integer NOT NULL,
	`rating` integer NOT NULL,
	`state` integer NOT NULL,
	`due` integer NOT NULL,
	`stability` real NOT NULL,
	`difficulty` real NOT NULL,
	`elapsed_days` real NOT NULL,
	`last_elapsed_days` real NOT NULL,
	`scheduled_days` real NOT NULL,
	`learning_steps` integer DEFAULT 0 NOT NULL,
	`review` integer NOT NULL,
	`duration_ms` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`card_id`) REFERENCES `srs_cards`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `review_log_card_idx` ON `review_log` (`card_id`);--> statement-breakpoint
CREATE TABLE `srs_cards` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entry_id` integer NOT NULL,
	`direction` text NOT NULL,
	`due` integer NOT NULL,
	`stability` real DEFAULT 0 NOT NULL,
	`difficulty` real DEFAULT 0 NOT NULL,
	`elapsed_days` real DEFAULT 0 NOT NULL,
	`scheduled_days` real DEFAULT 0 NOT NULL,
	`reps` integer DEFAULT 0 NOT NULL,
	`lapses` integer DEFAULT 0 NOT NULL,
	`state` integer DEFAULT 0 NOT NULL,
	`learning_steps` integer DEFAULT 0 NOT NULL,
	`last_review` integer,
	`suspended` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`entry_id`) REFERENCES `vocab_entries`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `srs_cards_entry_direction_unique` ON `srs_cards` (`entry_id`,`direction`);--> statement-breakpoint
CREATE INDEX `srs_cards_due_idx` ON `srs_cards` (`due`);--> statement-breakpoint
CREATE TABLE `vocab_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`term` text NOT NULL,
	`lemma` text NOT NULL,
	`pos` text NOT NULL,
	`gender` text,
	`plural` text,
	`aux` text,
	`separable` integer,
	`level` text,
	`translation_sr` text DEFAULT '' NOT NULL,
	`examples` text DEFAULT '[]' NOT NULL,
	`conjugations` text DEFAULT '{}' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`tags` text DEFAULT '' NOT NULL,
	`source` text DEFAULT 'manual' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vocab_entries_lemma_pos_unique` ON `vocab_entries` (`lemma`,`pos`);--> statement-breakpoint
CREATE INDEX `vocab_entries_lemma_idx` ON `vocab_entries` (`lemma`);