-- Create delivery tables based on DoorDash API response structure
-- This script creates tables to store actual DoorDash delivery data

-- Deliveries table - stores DoorDash delivery records
CREATE TABLE IF NOT EXISTS deliveries (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Order reference
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    -- DoorDash specific fields (from API response)
    external_delivery_id VARCHAR(255) NOT NULL, -- Our order ID sent to DoorDash
    doordash_delivery_id VARCHAR(255) NOT NULL, -- DoorDash's internal delivery ID
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, accepted, picked_up, delivered, cancelled
    
    -- Address information (from DoorDash API)
    pickup_address TEXT NOT NULL,
    dropoff_address TEXT NOT NULL,
    pickup_business_name VARCHAR(255),
    dropoff_business_name VARCHAR(255),
    pickup_phone_number VARCHAR(20),
    dropoff_phone_number VARCHAR(20),
    pickup_instructions TEXT,
    dropoff_instructions TEXT,
    
    -- Order details
    order_value INTEGER NOT NULL, -- Value in cents (as sent to DoorDash)
    
    -- Driver information (from DoorDash response)
    driver_name VARCHAR(255),
    driver_phone VARCHAR(20),
    driver_vehicle_info TEXT,
    
    -- Timing information
    pickup_time TIMESTAMP, -- Estimated pickup time
    dropoff_time TIMESTAMP, -- Estimated delivery time
    actual_pickup_time TIMESTAMP, -- When driver actually picked up
    actual_delivery_time TIMESTAMP, -- When driver actually delivered
    
    -- Tracking and status
    tracking_url TEXT,
    updated_at TIMESTAMP, -- Last update from DoorDash
    
    -- Our system fields
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at_system TIMESTAMP DEFAULT NOW()
);

-- Delivery status history - tracks all status changes
CREATE TABLE IF NOT EXISTS delivery_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW(),
    driver_name VARCHAR(255),
    driver_phone VARCHAR(20),
    notes TEXT,
    source VARCHAR(20) DEFAULT 'system' -- 'system', 'doordash_webhook', 'manual'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_external_delivery_id ON deliveries(external_delivery_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_doordash_delivery_id ON deliveries(doordash_delivery_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_created_at ON deliveries(created_at);

CREATE INDEX IF NOT EXISTS idx_delivery_status_history_delivery_id ON delivery_status_history(delivery_id);
CREATE INDEX IF NOT EXISTS idx_delivery_status_history_timestamp ON delivery_status_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_delivery_status_history_status ON delivery_status_history(status);