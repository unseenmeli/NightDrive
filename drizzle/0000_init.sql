CREATE TYPE "public"."difficulty" AS ENUM('easy', 'moderate', 'challenging');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."route_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "routes" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"start_name" text NOT NULL,
	"end_name" text NOT NULL,
	"region" text NOT NULL,
	"distance_km" integer NOT NULL,
	"duration_min" integer NOT NULL,
	"scenery" integer NOT NULL,
	"road_quality" integer NOT NULL,
	"difficulty" "difficulty" NOT NULL,
	"best_for" text[] DEFAULT '{}' NOT NULL,
	"best_time" text,
	"description" text NOT NULL,
	"notes" text,
	"path" jsonb NOT NULL,
	"stops" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"status" "route_status" DEFAULT 'pending' NOT NULL,
	"reject_reason" text,
	"submitted_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "routes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;