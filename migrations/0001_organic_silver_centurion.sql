CREATE TABLE "deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"delivery_id" varchar(255) NOT NULL,
	"provider" varchar(50) DEFAULT 'doordash' NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"pickup_address" text NOT NULL,
	"dropoff_address" text NOT NULL,
	"pickup_phone" varchar(20),
	"dropoff_phone" varchar(20),
	"pickup_business_name" varchar(255),
	"dropoff_business_name" varchar(255),
	"driver_name" varchar(255),
	"driver_phone" varchar(20),
	"driver_vehicle_info" text,
	"tracking_url" text,
	"estimated_pickup_time" timestamp,
	"estimated_delivery_time" timestamp,
	"actual_pickup_time" timestamp,
	"actual_delivery_time" timestamp,
	"special_instructions" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "delivery_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"delivery_id" uuid NOT NULL,
	"status" varchar(50) NOT NULL,
	"timestamp" timestamp DEFAULT now(),
	"driver_name" varchar(255),
	"driver_phone" varchar(20),
	"notes" text
);
--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_status_history" ADD CONSTRAINT "delivery_status_history_delivery_id_deliveries_id_fk" FOREIGN KEY ("delivery_id") REFERENCES "public"."deliveries"("id") ON DELETE cascade ON UPDATE no action;