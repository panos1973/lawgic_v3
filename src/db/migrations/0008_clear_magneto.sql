CREATE TABLE IF NOT EXISTS "standard_contract" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"created_at" timestamp (6) with time zone DEFAULT now(),
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "standard_contract_data_fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"field_name" text NOT NULL,
	"field_type" text NOT NULL,
	"value" text,
	"created_at" timestamp (6) with time zone DEFAULT now(),
	"standard_contract_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "standard_contract_drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now(),
	"standard_contract_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "standard_contract_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" numeric NOT NULL,
	"file_content" text NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now(),
	"standard_contract_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "standard_contract_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"created_at" timestamp (6) with time zone DEFAULT now(),
	"standard_contract_id" text NOT NULL
);
