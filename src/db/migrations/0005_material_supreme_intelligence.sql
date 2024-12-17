CREATE TABLE IF NOT EXISTS "contract_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" numeric NOT NULL,
	"file_content" text NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now(),
	"contract_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contract_data_fields" ADD COLUMN "value" text;