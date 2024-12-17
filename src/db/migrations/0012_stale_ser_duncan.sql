CREATE TABLE IF NOT EXISTS "chat_files_collection" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now(),
	"cmetadata" json
);
