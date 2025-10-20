-- DoorDash Delivery Tracking Tables
-- This schema stores delivery records for admin dashboard

CREATE TABLE IF NOT EXISTS deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    delivery_id VARCHAR(255) NOT NULL, -- DoorDash delivery ID
    provider VARCHAR(50) NOT NULL DEFAULT 'doordash',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    pickup_address TEXT NOT NULL,
    dropoff_address TEXT NOT NULL,
    pickup_phone VARCHAR(20),
    dropoff_phone VARCHAR(20),
    pickup_business_name VARCHAR(255),
    dropoff_business_name VARCHAR(255),
    driver_name VARCHAR(255),
    driver_phone VARCHAR(20),
    driver_vehicle_info TEXT,
    tracking_url TEXT,
    estimated_pickup_time TIMESTAMP,
    estimated_delivery_time TIMESTAMP,
    actual_pickup_time TIMESTAMP,
    actual_delivery_time TIMESTAMP,
    special_instructions TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_delivery_id ON deliveries(delivery_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_provider ON deliveries(provider);
CREATE INDEX IF NOT EXISTS idx_deliveries_created_at ON deliveries(created_at);

-- Delivery status history for tracking changes
CREATE TABLE IF NOT EXISTS delivery_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW(),
    driver_name VARCHAR(255),
    driver_phone VARCHAR(20),
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_delivery_status_history_delivery_id ON delivery_status_history(delivery_id);
CREATE INDEX IF NOT EXISTS idx_delivery_status_history_timestamp ON delivery_status_history(timestamp);