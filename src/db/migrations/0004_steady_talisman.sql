CREATE TABLE IF NOT EXISTS "contract_data_fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"field_name" text NOT NULL,
	"field_type" text NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now(),
	"contract_id" text NOT NULL
);
