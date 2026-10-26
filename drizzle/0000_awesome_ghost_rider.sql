CREATE TABLE `ai_daily_usage` (
	`day` text PRIMARY KEY NOT NULL,
	`requests` integer DEFAULT 0 NOT NULL
);
