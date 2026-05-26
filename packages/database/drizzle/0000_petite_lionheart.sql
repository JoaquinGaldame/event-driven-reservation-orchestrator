CREATE TABLE "audit_logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"entity_id" varchar(255) NOT NULL,
	"action" varchar(100) NOT NULL,
	"actor_type" varchar(50) NOT NULL,
	"actor_id" uuid,
	"metadata" jsonb,
	"correlation_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "domain_events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"event_id" uuid NOT NULL,
	"aggregate_type" varchar(100) NOT NULL,
	"aggregate_id" varchar(255) NOT NULL,
	"event_type" varchar(150) NOT NULL,
	"payload" jsonb NOT NULL,
	"correlation_id" uuid,
	"causation_id" uuid,
	"occurred_at" timestamp with time zone NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "countries_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" varchar(10) NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "countries_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "currencies" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "currencies_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" varchar(3) NOT NULL,
	"name" varchar(100) NOT NULL,
	"symbol" varchar(10) NOT NULL,
	"decimal_places" integer DEFAULT 2 NOT NULL,
	CONSTRAINT "currencies_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "languages" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "languages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code_iso" varchar(2) NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "languages_code_iso_unique" UNIQUE("code_iso")
);
--> statement-breakpoint
CREATE TABLE "provinces" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "provinces_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"country_id" integer NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(150) NOT NULL,
	CONSTRAINT "provinces_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "commission_types" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "commission_types_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "commission_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "owner_statuses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "owner_statuses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" varchar(50) NOT NULL,
	CONSTRAINT "owner_statuses_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "owner_types" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "owner_types_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" varchar(20) NOT NULL,
	CONSTRAINT "owner_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "property_statuses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "property_statuses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	CONSTRAINT "property_statuses_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "property_types" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "property_types_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "property_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "unit_statuses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "unit_statuses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" varchar(50) NOT NULL,
	CONSTRAINT "unit_statuses_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "unit_types" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "unit_types_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "unit_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "charges_types" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "charges_types_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "charges_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "channel_statuses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "channel_statuses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "channel_statuses_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "channel_types" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "channel_types_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "channel_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "channels" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"type_id" integer NOT NULL,
	"status_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "guests" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100),
	"email" varchar(255),
	"phone" varchar(50),
	"document_type" varchar(50),
	"document_number" varchar(100),
	"nationality_id" integer,
	"language_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "guests_contact_check" CHECK ("guests"."email" IS NOT NULL OR "guests"."phone" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "owners" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100),
	"legal_name" varchar(255),
	"trading_name" varchar(255),
	"tax_id" varchar(100),
	"type_id" integer NOT NULL,
	"email" varchar(255),
	"phone" varchar(50),
	"billing_email" varchar(255),
	"preferred_language" varchar(2) DEFAULT 'en',
	"document_type" varchar(50),
	"document_number" varchar(100),
	"status_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "property_owner_commission_rules" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"property_id" bigint NOT NULL,
	"commission_type_id" integer NOT NULL,
	"value" integer NOT NULL,
	"valid_from" timestamp with time zone NOT NULL,
	"valid_to" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "unit_daily_rates" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"unit_id" bigint NOT NULL,
	"date" timestamp NOT NULL,
	"currency_id" integer NOT NULL,
	"price_per_night" integer NOT NULL,
	"min_stay_nights" integer,
	"max_stay_nights" integer,
	"is_available" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"displayName" text NOT NULL,
	"slug" text NOT NULL,
	"owner_id" bigint NOT NULL,
	"timezone" text DEFAULT 'America/Argentina/Buenos_Aires' NOT NULL,
	"currency_id" integer NOT NULL,
	"province_id" integer NOT NULL,
	"type_id" integer NOT NULL,
	"address" text,
	"status_id" integer NOT NULL,
	"max_guests" integer NOT NULL,
	"default_check_in_minutes" integer DEFAULT 900 NOT NULL,
	"default_check_out_minutes" integer DEFAULT 660 NOT NULL,
	"allow_overbooking" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "units" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"property_id" bigint NOT NULL,
	"unit_type_id" integer NOT NULL,
	"status_id" integer NOT NULL,
	"name" varchar(150) NOT NULL,
	"code" varchar(80) NOT NULL,
	"max_guests" integer NOT NULL,
	"bedrooms" integer,
	"bathrooms" integer,
	"base_price_per_night" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "owner_contacts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"owner_id" bigint NOT NULL,
	"contact_type" varchar(50) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100),
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"mobile" varchar(50),
	"is_primary" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "owner_bank_accounts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"owner_id" bigint NOT NULL,
	"account_name" varchar(255) NOT NULL,
	"bank_name" varchar(255) NOT NULL,
	"bank_country" varchar(2) NOT NULL,
	"account_number" varchar(255) NOT NULL,
	"account_currency_id" bigint NOT NULL,
	"routing_number" varchar(255),
	"swift_bic" varchar(20),
	"iban" varchar(50),
	"is_default" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"beneficiary_name" varchar(255),
	"beneficiary_tax_id" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_lock_types" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "inventory_lock_types_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "inventory_lock_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "inventory_lock_statuses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "inventory_lock_statuses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "inventory_lock_statuses_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "inventory_locks" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"reservation_id" bigint NOT NULL,
	"property_id" bigint NOT NULL,
	"unit_id" bigint NOT NULL,
	"lock_type_id" integer NOT NULL,
	"status_id" integer NOT NULL,
	"check_in" timestamp with time zone NOT NULL,
	"check_out" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone,
	"released_at" timestamp with time zone,
	"correlation_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_locks_date_range_check" CHECK ("inventory_locks"."check_out" > "inventory_locks"."check_in")
);
--> statement-breakpoint
CREATE TABLE "reservation_charges" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"reservation_id" bigint NOT NULL,
	"charge_type_id" integer NOT NULL,
	"description" text,
	"amount" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reservation_financials" (
	"reservation_id" bigint PRIMARY KEY NOT NULL,
	"gross_amount" numeric(12, 2) NOT NULL,
	"discount_amount" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"tax_amount" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"platform_commission_amount" numeric(12, 2) NOT NULL,
	"owner_payout_amount" numeric(12, 2) NOT NULL,
	"currency_id" integer NOT NULL,
	"calculated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"code" uuid DEFAULT gen_random_uuid() NOT NULL,
	"property_id" bigint NOT NULL,
	"unit_id" bigint NOT NULL,
	"guest_id" bigint,
	"channel_id" bigint NOT NULL,
	"currency_id" bigint NOT NULL,
	"reservation_number" varchar(50) NOT NULL,
	"check_in" date NOT NULL,
	"check_out" date NOT NULL,
	"status" integer NOT NULL,
	"total_amount" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"rejection_reason" text,
	"idempotency_key" varchar(150) NOT NULL,
	"correlation_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "reservations_dates_check" CHECK ("reservations"."check_out" > "reservations"."check_in")
);
--> statement-breakpoint
CREATE TABLE "reservation_statuses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "reservation_statuses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "reservation_statuses_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "payments_attempts_statuses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "payments_attempts_statuses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" varchar(30) NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "payments_attempts_statuses_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "payment_attempts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"payment_id" bigint NOT NULL,
	"attempt_number" integer NOT NULL,
	"provider" varchar(50) NOT NULL,
	"request_payload" jsonb,
	"response_payload" jsonb,
	"status_id" integer NOT NULL,
	"error_code" varchar(100),
	"error_message" text,
	"correlation_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payment_attempts_attempt_number_check" CHECK ("payment_attempts"."attempt_number" > 0)
);
--> statement-breakpoint
CREATE TABLE "payments_statuses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "payments_statuses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" varchar(30) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(255) NOT NULL,
	CONSTRAINT "payments_statuses_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"internal_code" uuid DEFAULT gen_random_uuid() NOT NULL,
	"reservation_id" bigint NOT NULL,
	"provider" varchar(50) NOT NULL,
	"provider_payment_id" varchar(255),
	"provider_reference" varchar(255),
	"external_receipt_number" varchar(255),
	"currency_id" bigint NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"status_id" integer NOT NULL,
	"causation_id" uuid,
	"authorized_at" timestamp with time zone,
	"captured_at" timestamp with time zone,
	"failed_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"correlation_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_amount_check" CHECK ("payments"."amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "inventory_movements" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"property_id" bigint NOT NULL,
	"unit_id" bigint NOT NULL,
	"reservation_id" bigint NOT NULL,
	"movement_type_id" integer NOT NULL,
	"sub_type" varchar(50),
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"reason" text,
	"reference_code" varchar(100),
	"description" text,
	"overbooked_alternative_unitid" bigint,
	"compensation_amount" numeric(12, 2),
	"currency_id" bigint,
	"initiated_by" varchar(100),
	"initiated_by_users_id" bigint,
	"correlation_id" uuid NOT NULL,
	"causation_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reservations_dates_check" CHECK ("inventory_movements"."end_date" > "inventory_movements"."start_date")
);
--> statement-breakpoint
CREATE TABLE "owner_payouts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"owner_id" bigint NOT NULL,
	"property_id" bigint NOT NULL,
	"reservation_id" bigint NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"currency_id" bigint NOT NULL,
	"platform_commission" numeric(12, 2) NOT NULL,
	"taxes_withheld" numeric(12, 2) NOT NULL,
	"adjustments" numeric(12, 2) DEFAULT '0' NOT NULL,
	"net_amount" numeric(12, 2) NOT NULL,
	"status_id" integer NOT NULL,
	"scheduled_date" timestamp with time zone NOT NULL,
	"processed_date" timestamp with time zone,
	"failed_date" timestamp with time zone,
	"failure_reason" text,
	"provider" varchar(50),
	"provider_payout_id" varchar(255),
	"provider_reference" varchar(255),
	"split_sequence" integer DEFAULT 1 NOT NULL,
	"split_total" integer DEFAULT 1 NOT NULL,
	"correlation_id" uuid NOT NULL,
	"causation_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "net_amount_check" CHECK ("owner_payouts"."net_amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "movement_types" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "movement_types_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" varchar(50) NOT NULL,
	CONSTRAINT "movement_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "owner_payout_statuses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "owner_payout_statuses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" varchar(50) NOT NULL,
	CONSTRAINT "owner_payout_statuses_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "account_movements" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"reservation_id" bigint NOT NULL,
	"payment_id" bigint NOT NULL,
	"owner_payout_id" bigint,
	"account_type_id" integer NOT NULL,
	"account_identifier" varchar(255) NOT NULL,
	"movement_type" varchar(50) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency_id" bigint NOT NULL,
	"description" text,
	"ledger_entry_type_id" integer NOT NULL,
	"reversed_at" timestamp with time zone,
	"reversed_by_movement_id" bigint,
	"correlation_id" uuid NOT NULL,
	"causation_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_amount_check" CHECK ("account_movements"."amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "account_movement_types" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "account_movement_types_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "account_movement_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "ledger_entry_types" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ledger_entry_types_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" varchar(50) NOT NULL,
	CONSTRAINT "ledger_entry_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "idempotency_keys" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"scope" varchar(100) NOT NULL,
	"idempotency_key" varchar(255) NOT NULL,
	"request_hash" varchar(255) NOT NULL,
	"response_payload" jsonb,
	"status" varchar(50) DEFAULT 'PROCESSING' NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "idempotency_keys_status_check" CHECK ("idempotency_keys"."status" IN ('PROCESSING', 'COMPLETED', 'FAILED', 'EXPIRED'))
);
--> statement-breakpoint
CREATE TABLE "outbox_events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"event_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"aggregate_type" varchar(100) NOT NULL,
	"aggregate_id" varchar(255) NOT NULL,
	"event_type" varchar(150) NOT NULL,
	"payload" jsonb NOT NULL,
	"status" varchar(50) DEFAULT 'PENDING' NOT NULL,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"available_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone,
	"correlation_id" uuid NOT NULL,
	"causation_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "outbox_events_retry_check" CHECK ("outbox_events"."retry_count" >= 0),
	CONSTRAINT "outbox_events_status_check" CHECK ("outbox_events"."status" IN ('PENDING', 'PROCESSING', 'PUBLISHED', 'FAILED'))
);
--> statement-breakpoint
CREATE TABLE "dead_letter_events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"event_id" uuid NOT NULL,
	"event_type" varchar(150) NOT NULL,
	"payload" jsonb NOT NULL,
	"error_message" text,
	"retry_count" integer NOT NULL,
	"failed_service" varchar(100) NOT NULL,
	"correlation_id" uuid,
	"causation_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "dead_letter_events_retry_check" CHECK ("dead_letter_events"."retry_count" >= 0)
);
--> statement-breakpoint
ALTER TABLE "provinces" ADD CONSTRAINT "provinces_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channels" ADD CONSTRAINT "channels_type_id_channel_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."channel_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channels" ADD CONSTRAINT "channels_status_id_channel_statuses_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."channel_statuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guests" ADD CONSTRAINT "guests_nationality_id_countries_id_fk" FOREIGN KEY ("nationality_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guests" ADD CONSTRAINT "guests_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owners" ADD CONSTRAINT "owners_type_id_owner_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."owner_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owners" ADD CONSTRAINT "owners_status_id_owner_statuses_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."owner_statuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_owner_commission_rules" ADD CONSTRAINT "property_owner_commission_rules_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_owner_commission_rules" ADD CONSTRAINT "property_owner_commission_rules_commission_type_id_commission_types_id_fk" FOREIGN KEY ("commission_type_id") REFERENCES "public"."commission_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unit_daily_rates" ADD CONSTRAINT "unit_daily_rates_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unit_daily_rates" ADD CONSTRAINT "unit_daily_rates_currency_id_currencies_id_fk" FOREIGN KEY ("currency_id") REFERENCES "public"."currencies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_currency_id_currencies_id_fk" FOREIGN KEY ("currency_id") REFERENCES "public"."currencies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_province_id_provinces_id_fk" FOREIGN KEY ("province_id") REFERENCES "public"."provinces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_type_id_property_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."property_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_status_id_property_statuses_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."property_statuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_unit_type_id_unit_types_id_fk" FOREIGN KEY ("unit_type_id") REFERENCES "public"."unit_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_status_id_unit_statuses_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."unit_statuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_contacts" ADD CONSTRAINT "owner_contacts_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_bank_accounts" ADD CONSTRAINT "owner_bank_accounts_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_bank_accounts" ADD CONSTRAINT "owner_bank_accounts_account_currency_id_currencies_id_fk" FOREIGN KEY ("account_currency_id") REFERENCES "public"."currencies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_locks" ADD CONSTRAINT "inventory_locks_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_locks" ADD CONSTRAINT "inventory_locks_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_locks" ADD CONSTRAINT "inventory_locks_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_locks" ADD CONSTRAINT "inventory_locks_lock_type_id_inventory_lock_types_id_fk" FOREIGN KEY ("lock_type_id") REFERENCES "public"."inventory_lock_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_locks" ADD CONSTRAINT "inventory_locks_status_id_inventory_lock_statuses_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."inventory_lock_statuses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation_charges" ADD CONSTRAINT "reservation_charges_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation_charges" ADD CONSTRAINT "reservation_charges_charge_type_id_charges_types_id_fk" FOREIGN KEY ("charge_type_id") REFERENCES "public"."charges_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation_financials" ADD CONSTRAINT "reservation_financials_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation_financials" ADD CONSTRAINT "reservation_financials_currency_id_currencies_id_fk" FOREIGN KEY ("currency_id") REFERENCES "public"."currencies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_currency_id_currencies_id_fk" FOREIGN KEY ("currency_id") REFERENCES "public"."currencies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_status_reservation_statuses_id_fk" FOREIGN KEY ("status") REFERENCES "public"."reservation_statuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_attempts" ADD CONSTRAINT "payment_attempts_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_attempts" ADD CONSTRAINT "payment_attempts_status_id_payments_attempts_statuses_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."payments_attempts_statuses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_currency_id_currencies_id_fk" FOREIGN KEY ("currency_id") REFERENCES "public"."currencies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_status_id_payments_statuses_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."payments_statuses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_movement_type_id_movement_types_id_fk" FOREIGN KEY ("movement_type_id") REFERENCES "public"."movement_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_overbooked_alternative_unitid_units_id_fk" FOREIGN KEY ("overbooked_alternative_unitid") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_currency_id_currencies_id_fk" FOREIGN KEY ("currency_id") REFERENCES "public"."currencies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_payouts" ADD CONSTRAINT "owner_payouts_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_payouts" ADD CONSTRAINT "owner_payouts_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_payouts" ADD CONSTRAINT "owner_payouts_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_payouts" ADD CONSTRAINT "owner_payouts_currency_id_currencies_id_fk" FOREIGN KEY ("currency_id") REFERENCES "public"."currencies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_payouts" ADD CONSTRAINT "owner_payouts_status_id_owner_payout_statuses_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."owner_payout_statuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_movements" ADD CONSTRAINT "account_movements_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_movements" ADD CONSTRAINT "account_movements_account_type_id_account_movement_types_id_fk" FOREIGN KEY ("account_type_id") REFERENCES "public"."account_movement_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_movements" ADD CONSTRAINT "account_movements_currency_id_currencies_id_fk" FOREIGN KEY ("currency_id") REFERENCES "public"."currencies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_movements" ADD CONSTRAINT "account_movements_ledger_entry_type_id_ledger_entry_types_id_fk" FOREIGN KEY ("ledger_entry_type_id") REFERENCES "public"."ledger_entry_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_logs_actor_idx" ON "audit_logs" USING btree ("actor_type","actor_id");--> statement-breakpoint
CREATE INDEX "audit_logs_correlation_idx" ON "audit_logs" USING btree ("correlation_id");--> statement-breakpoint
CREATE UNIQUE INDEX "domain_events_event_id_idx" ON "domain_events" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "domain_events_aggregate_idx" ON "domain_events" USING btree ("aggregate_type","aggregate_id");--> statement-breakpoint
CREATE INDEX "domain_events_event_type_idx" ON "domain_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "domain_events_correlation_idx" ON "domain_events" USING btree ("correlation_id");--> statement-breakpoint
CREATE UNIQUE INDEX "channels_id_idx" ON "channels" USING btree ("id");--> statement-breakpoint
CREATE UNIQUE INDEX "channels_code_idx" ON "channels" USING btree ("code");--> statement-breakpoint
CREATE INDEX "guests_email_idx" ON "guests" USING btree ("email");--> statement-breakpoint
CREATE INDEX "guests_document_idx" ON "guests" USING btree ("document_type","document_number");--> statement-breakpoint
CREATE UNIQUE INDEX "owners_tax_id_idx" ON "owners" USING btree ("tax_id");--> statement-breakpoint
CREATE INDEX "owners_owner_type_idx" ON "owners" USING btree ("type_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unit_daily_rates_unit_date_idx" ON "unit_daily_rates" USING btree ("unit_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "properties_public_id_idx" ON "properties" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "properties_slug_idx" ON "properties" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "units_property_code_idx" ON "units" USING btree ("property_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "owner_contacts_only_one_primary_idx" ON "owner_contacts" USING btree ("owner_id") WHERE "owner_contacts"."is_primary" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_locks_reservation_idx" ON "inventory_locks" USING btree ("reservation_id");--> statement-breakpoint
CREATE INDEX "inventory_locks_unit_dates_idx" ON "inventory_locks" USING btree ("unit_id","check_in","check_out");--> statement-breakpoint
CREATE INDEX "inventory_locks_status_idx" ON "inventory_locks" USING btree ("status_id");--> statement-breakpoint
CREATE INDEX "inventory_locks_type_idx" ON "inventory_locks" USING btree ("lock_type_id");--> statement-breakpoint
CREATE INDEX "inventory_locks_correlation_idx" ON "inventory_locks" USING btree ("correlation_id");--> statement-breakpoint
CREATE UNIQUE INDEX "reservations_code_idx" ON "reservations" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "reservations_number_idx" ON "reservations" USING btree ("reservation_number");--> statement-breakpoint
CREATE UNIQUE INDEX "reservations_channel_idempotency_idx" ON "reservations" USING btree ("channel_id","idempotency_key");--> statement-breakpoint
CREATE INDEX "reservations_unit_dates_idx" ON "reservations" USING btree ("unit_id","check_in","check_out");--> statement-breakpoint
CREATE INDEX "payment_attempts_payment_idx" ON "payment_attempts" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "payment_attempts_status_id_idx" ON "payment_attempts" USING btree ("status_id");--> statement-breakpoint
CREATE INDEX "payment_attempts_correlation_idx" ON "payment_attempts" USING btree ("correlation_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_internal_code_idx" ON "payments" USING btree ("internal_code");--> statement-breakpoint
CREATE INDEX "payments_reservation_idx" ON "payments" USING btree ("reservation_id");--> statement-breakpoint
CREATE INDEX "payments_provider_payment_idx" ON "payments" USING btree ("provider","provider_payment_id");--> statement-breakpoint
CREATE INDEX "payments_status_id_idx" ON "payments" USING btree ("status_id");--> statement-breakpoint
CREATE INDEX "payments_correlation_idx" ON "payments" USING btree ("correlation_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idempotency_keys_public_id_idx" ON "idempotency_keys" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idempotency_keys_scope_key_idx" ON "idempotency_keys" USING btree ("scope","idempotency_key");--> statement-breakpoint
CREATE INDEX "idempotency_keys_status_idx" ON "idempotency_keys" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "outbox_events_event_id_idx" ON "outbox_events" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "outbox_events_status_available_idx" ON "outbox_events" USING btree ("status","available_at");--> statement-breakpoint
CREATE INDEX "outbox_events_event_type_idx" ON "outbox_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "outbox_events_correlation_idx" ON "outbox_events" USING btree ("correlation_id");--> statement-breakpoint
CREATE INDEX "dead_letter_events_event_type_idx" ON "dead_letter_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "dead_letter_events_failed_service_idx" ON "dead_letter_events" USING btree ("failed_service");--> statement-breakpoint
CREATE INDEX "dead_letter_events_correlation_idx" ON "dead_letter_events" USING btree ("correlation_id");