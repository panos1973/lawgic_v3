CREATE TABLE IF NOT EXISTS "chat_files_embedding" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"embedding" vector(1536) NOT NULL,
	"document" text NOT NULL,
	"metadata" jsonb NOT NULL,
	"collection_id" uuid NOT NULL
);
