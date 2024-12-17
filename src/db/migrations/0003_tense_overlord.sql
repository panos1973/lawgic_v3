CREATE TABLE IF NOT EXISTS "contract" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"created_at" timestamp (6) with time zone DEFAULT now(),
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contract_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"section" text NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now(),
	"contract_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contract_sections_drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"section_draft" text NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now(),
	"contract_ids" text[] NOT NULL,
	"contract_section_ids" text[] NOT NULL
);
--> statement-breakpoint
DROP TABLE "contract_chat";--> statement-breakpoint
DROP TABLE "contract_chat_files";--> statement-breakpoint
DROP TABLE "contract_chat_messages";--> statement-breakpoint
DROP TABLE "contract_draft";--> statement-breakpoint
DROP TABLE "contract_draft_files";--> statement-breakpoint
DROP TABLE "contract_draft_messages";