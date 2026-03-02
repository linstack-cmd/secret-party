CREATE TABLE "api_client" (
	"id" bigint PRIMARY KEY DEFAULT unique_rowid(),
	"name" text NOT NULL,
	"public_key" text NOT NULL UNIQUE,
	"user_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" bigint PRIMARY KEY DEFAULT unique_rowid(),
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"action" text NOT NULL,
	"user_id" bigint,
	"api_client_id" bigint,
	"details" text
);
--> statement-breakpoint
CREATE TABLE "environment_access" (
	"environment_id" bigint,
	"client_id" bigint,
	"dek_wrapped_by_client_public_key" text NOT NULL,
	CONSTRAINT "environment_access_pkey" PRIMARY KEY("environment_id","client_id")
);
--> statement-breakpoint
CREATE TABLE "environment" (
	"id" bigint PRIMARY KEY DEFAULT unique_rowid(),
	"name" text NOT NULL,
	"project_id" bigint NOT NULL,
	"dek_wrapped_by_password" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project" (
	"id" bigint PRIMARY KEY DEFAULT unique_rowid(),
	"name" text NOT NULL,
	"owner_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "secret" (
	"environment_id" bigint,
	"key" text,
	"value_encrypted" text NOT NULL,
	CONSTRAINT "secret_pkey" PRIMARY KEY("environment_id","key")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" bigint PRIMARY KEY DEFAULT unique_rowid(),
	"user_id" bigint NOT NULL,
	"token" text NOT NULL UNIQUE,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" bigint PRIMARY KEY DEFAULT unique_rowid(),
	"email" text NOT NULL UNIQUE,
	"password_hash" text NOT NULL,
	"is_admin" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "api_client" ADD CONSTRAINT "api_client_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_api_client_id_api_client_id_fkey" FOREIGN KEY ("api_client_id") REFERENCES "api_client"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "environment_access" ADD CONSTRAINT "environment_access_environment_id_environment_id_fkey" FOREIGN KEY ("environment_id") REFERENCES "environment"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "environment_access" ADD CONSTRAINT "environment_access_client_id_api_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "api_client"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "environment" ADD CONSTRAINT "environment_project_id_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_owner_id_user_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "secret" ADD CONSTRAINT "secret_environment_id_environment_id_fkey" FOREIGN KEY ("environment_id") REFERENCES "environment"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;