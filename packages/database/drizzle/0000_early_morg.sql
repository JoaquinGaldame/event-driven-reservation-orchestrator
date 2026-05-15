CREATE TABLE "reservations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"property_id" varchar(255) NOT NULL,
	"unit_id" varchar(255) NOT NULL,
	"guest_name" varchar(255),
	"check_in" timestamp with time zone NOT NULL,
	"check_out" timestamp with time zone NOT NULL,
	"status" varchar(50) DEFAULT 'PENDING' NOT NULL,
	"rejection_reason" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_locks" (
	"id" uuid PRIMARY KEY NOT NULL,
	"reservation_id" uuid NOT NULL,
	"property_id" varchar(255) NOT NULL,
	"unit_id" varchar(255) NOT NULL,
	"check_in" timestamp with time zone NOT NULL,
	"check_out" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inventory_locks" ADD CONSTRAINT "inventory_locks_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE cascade ON UPDATE no action;