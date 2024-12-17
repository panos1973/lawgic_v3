CREATE TABLE IF NOT EXISTS "user_case_research_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"include_greek_laws" boolean DEFAULT true NOT NULL,
	"include_greek_court_decisions" boolean DEFAULT false NOT NULL,
	"include_european_laws" boolean DEFAULT false NOT NULL,
	"include_european_court_decisions" boolean DEFAULT false NOT NULL,
	"include_greek_bibliography" boolean DEFAULT false NOT NULL,
	"include_foreign_bibliography" boolean DEFAULT false NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now(),
	"updated_at" timestamp (6) with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_contract_chat_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"include_greek_laws" boolean DEFAULT true NOT NULL,
	"include_greek_court_decisions" boolean DEFAULT false NOT NULL,
	"include_european_laws" boolean DEFAULT false NOT NULL,
	"include_european_court_decisions" boolean DEFAULT false NOT NULL,
	"include_greek_bibliography" boolean DEFAULT false NOT NULL,
	"include_foreign_bibliography" boolean DEFAULT false NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now(),
	"updated_at" timestamp (6) with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_lawbot_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"include_greek_laws" boolean DEFAULT true NOT NULL,
	"include_greek_court_decisions" boolean DEFAULT false NOT NULL,
	"include_european_laws" boolean DEFAULT false NOT NULL,
	"include_european_court_decisions" boolean DEFAULT false NOT NULL,
	"include_greek_bibliography" boolean DEFAULT false NOT NULL,
	"include_foreign_bibliography" boolean DEFAULT false NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now(),
	"updated_at" timestamp (6) with time zone DEFAULT now()
);
