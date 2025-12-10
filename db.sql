-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Stores table
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT,
    phone_number TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Store owners table (corrected reference and removed password - handled by Supabase Auth)
CREATE TABLE store_owners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE, -- References Supabase auth.users(id)
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Admins table (new - for admin user management)
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE, -- References Supabase auth.users(id)
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    is_super_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Customers/Borrowers table (corrected and enhanced)
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone_number TEXT NOT NULL, -- Changed from INT to TEXT (phone numbers can have +, -, spaces)
    cid_number TEXT, -- Bhutanese Citizenship ID (optional)
    address TEXT,
    email TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(store_id, phone_number) -- Unique per store
);

-- Credit transactions table (corrected and enhanced)
CREATE TABLE credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL, -- Changed from INT to DECIMAL for precise financial calculations
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit_given', 'payment_received')),
    transaction_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, -- Fixed camelCase to snake_case
    description TEXT,
    journal_number TEXT, -- Changed to TEXT and made nullable
    reference_number TEXT, -- Additional reference for payments
    created_by UUID REFERENCES store_owners(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Customer balance summary table (new - for efficient balance tracking)
CREATE TABLE customer_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    total_credit_given DECIMAL(12, 2) DEFAULT 0,
    total_payments_received DECIMAL(12, 2) DEFAULT 0,
    outstanding_balance DECIMAL(12, 2) DEFAULT 0,
    last_transaction_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(customer_id, store_id)
);

-- SMS notifications table (new - for tracking notification history)
CREATE TABLE sms_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('monthly_reminder', 'credit_given', 'payment_received', 'custom')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'delivered')) DEFAULT 'pending',
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- SMS notification schedule table (new - for managing monthly reminders)
CREATE TABLE sms_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE, -- NULL means all customers
    notification_type TEXT NOT NULL DEFAULT 'monthly_reminder',
    day_of_month INT CHECK (day_of_month BETWEEN 1 AND 31),
    is_active BOOLEAN DEFAULT true,
    last_sent_at TIMESTAMPTZ,
    next_scheduled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Audit log table (new - for tracking all system changes)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- Can reference store_owners or admins
    user_type TEXT NOT NULL CHECK (user_type IN ('store_owner', 'admin')),
    action TEXT NOT NULL, -- 'create', 'update', 'delete', 'login', etc.
    entity_type TEXT NOT NULL, -- 'customer', 'credit', 'store', etc.
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization
CREATE INDEX idx_store_owners_store_id ON store_owners(store_id);
CREATE INDEX idx_store_owners_user_id ON store_owners(user_id);
CREATE INDEX idx_customers_store_id ON customers(store_id);
CREATE INDEX idx_customers_phone_number ON customers(phone_number);
CREATE INDEX idx_credits_customer_id ON credits(customer_id);
CREATE INDEX idx_credits_store_id ON credits(store_id);
CREATE INDEX idx_credits_transaction_date ON credits(transaction_date);
CREATE INDEX idx_customer_balances_customer_id ON customer_balances(customer_id);
CREATE INDEX idx_sms_notifications_customer_id ON sms_notifications(customer_id);
CREATE INDEX idx_sms_notifications_status ON sms_notifications(status);
CREATE INDEX idx_sms_schedules_next_scheduled ON sms_schedules(next_scheduled_at) WHERE is_active = true;
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_modified_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.modified_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_stores_modified_at BEFORE UPDATE ON stores
    FOR EACH ROW EXECUTE FUNCTION update_modified_at_column();

CREATE TRIGGER update_store_owners_modified_at BEFORE UPDATE ON store_owners
    FOR EACH ROW EXECUTE FUNCTION update_modified_at_column();

CREATE TRIGGER update_admins_modified_at BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION update_modified_at_column();

CREATE TRIGGER update_customers_modified_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_modified_at_column();

CREATE TRIGGER update_credits_modified_at BEFORE UPDATE ON credits
    FOR EACH ROW EXECUTE FUNCTION update_modified_at_column();

CREATE TRIGGER update_customer_balances_modified_at BEFORE UPDATE ON customer_balances
    FOR EACH ROW EXECUTE FUNCTION update_modified_at_column();

CREATE TRIGGER update_sms_notifications_modified_at BEFORE UPDATE ON sms_notifications
    FOR EACH ROW EXECUTE FUNCTION update_modified_at_column();

CREATE TRIGGER update_sms_schedules_modified_at BEFORE UPDATE ON sms_schedules
    FOR EACH ROW EXECUTE FUNCTION update_modified_at_column();