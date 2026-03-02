CREATE TABLE "sellers_reports" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sellers_reports_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"seller_id" integer NOT NULL,
	"started_at" timestamp NOT NULL,
	"activity_type" "activity_type",
	"customer" varchar(255) NOT NULL,
	"additional_info" varchar(1000)
);
--> statement-breakpoint
ALTER TABLE "sellers_reports" ADD CONSTRAINT "sellers_reports_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;