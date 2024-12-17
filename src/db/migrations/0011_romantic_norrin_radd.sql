CREATE TABLE IF NOT EXISTS "chat_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" numeric NOT NULL,
	"file_content" text NOT NULL,
	"file_blob" text,
	"created_at" timestamp (6) with time zone DEFAULT now(),
	"chat_id" uuid NOT NULL
);
