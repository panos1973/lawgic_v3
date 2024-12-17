ALTER TABLE "contract_sections_drafts" RENAME TO "contract_drafts";--> statement-breakpoint
ALTER TABLE "contract_drafts" ADD COLUMN "contract_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "contract_drafts" DROP COLUMN IF EXISTS "description";--> statement-breakpoint
ALTER TABLE "contract_drafts" DROP COLUMN IF EXISTS "section_draft";--> statement-breakpoint
ALTER TABLE "contract_drafts" DROP COLUMN IF EXISTS "contract_ids";--> statement-breakpoint
ALTER TABLE "contract_drafts" DROP COLUMN IF EXISTS "contract_section_ids";