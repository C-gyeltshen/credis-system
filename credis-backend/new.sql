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

-- Store owners table
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

-- Admins table
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE, -- References Supabase auth.users(id)
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    is_super_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Customers table (UPDATED - added user_id for portal access)
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    user_id UUID UNIQUE, -- NEW: References Supabase auth.users(id) for customer portal login
    name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    cid_number TEXT,
    address TEXT,
    email TEXT,
    is_active BOOLEAN DEFAULT true,
    portal_access_enabled BOOLEAN DEFAULT false, -- NEW: Whether customer can access portal
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(store_id, phone_number)
);

-- OTP verification table (NEW - for customer login via OTP)
CREATE TABLE otp_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    expires_at TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ,
    ip_address TEXT,
    attempts INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Payment submissions table (NEW - for customer-initiated payments with screenshots)
CREATE TABLE payment_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('bank_transfer', 'mobile_wallet', 'other')),
    screenshot_url TEXT NOT NULL, -- Supabase storage URL
    screenshot_filename TEXT NOT NULL,
    reference_number TEXT, -- Customer-provided reference
    notes TEXT, -- Customer notes
    status TEXT NOT NULL CHECK (status IN ('pending_validation', 'approved', 'rejected')) DEFAULT 'pending_validation',
    submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    validated_at TIMESTAMPTZ,
    validated_by UUID REFERENCES store_owners(id),
    rejection_reason TEXT,
    credit_transaction_id UUID REFERENCES credits(id), -- Links to credits table after approval
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Credit transactions table (UPDATED - added payment_submission_id reference)
CREATE TABLE credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit_given', 'payment_received')),
    transaction_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    journal_number TEXT,
    reference_number TEXT,
    payment_submission_id UUID REFERENCES payment_submissions(id), -- NEW: Links to customer submission
    created_by UUID REFERENCES store_owners(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Customer balance summary table
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

-- SMS/Email notifications table (UPDATED - added payment validation notifications)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    phone_number TEXT,
    email TEXT,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN (
        'monthly_reminder', 
        'credit_given', 
        'payment_received', 
        'payment_approved', -- NEW
        'payment_rejected', -- NEW
        'otp_code', -- NEW
        'custom'
    )),
    delivery_method TEXT NOT NULL CHECK (delivery_method IN ('sms', 'email', 'both')) DEFAULT 'sms',
    status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'delivered')) DEFAULT 'pending',
    payment_submission_id UUID REFERENCES payment_submissions(id), -- NEW: Link to payment submission
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- SMS notification schedule table
CREATE TABLE sms_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL DEFAULT 'monthly_reminder',
    day_of_month INT CHECK (day_of_month BETWEEN 1 AND 31),
    is_active BOOLEAN DEFAULT true,
    last_sent_at TIMESTAMPTZ,
    next_scheduled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Audit log table (UPDATED - added customer actions)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    user_type TEXT NOT NULL CHECK (user_type IN ('store_owner', 'admin', 'customer')), -- UPDATED
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
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
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_credits_customer_id ON credits(customer_id);
CREATE INDEX idx_credits_store_id ON credits(store_id);
CREATE INDEX idx_credits_transaction_date ON credits(transaction_date);
CREATE INDEX idx_credits_payment_submission_id ON credits(payment_submission_id);
CREATE INDEX idx_customer_balances_customer_id ON customer_balances(customer_id);
CREATE INDEX idx_notifications_customer_id ON notifications(customer_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_sms_schedules_next_scheduled ON sms_schedules(next_scheduled_at) WHERE is_active = true;
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- NEW INDEXES for customer portal features
CREATE INDEX idx_otp_phone_number ON otp_verifications(phone_number, created_at DESC);
CREATE INDEX idx_otp_expires_at ON otp_verifications(expires_at) WHERE is_verified = false;
CREATE INDEX idx_payment_submissions_customer_id ON payment_submissions(customer_id);
CREATE INDEX idx_payment_submissions_store_id ON payment_submissions(store_id);
CREATE INDEX idx_payment_submissions_status ON payment_submissions(status, submitted_at DESC);
CREATE INDEX idx_payment_submissions_pending ON payment_submissions(store_id, status) WHERE status = 'pending_validation';

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

CREATE TRIGGER update_notifications_modified_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_modified_at_column();

CREATE TRIGGER update_sms_schedules_modified_at BEFORE UPDATE ON sms_schedules
    FOR EACH ROW EXECUTE FUNCTION update_modified_at_column();

CREATE TRIGGER update_payment_submissions_modified_at BEFORE UPDATE ON payment_submissions
    FOR EACH ROW EXECUTE FUNCTION update_modified_at_column();

-- Function to automatically update customer balance after payment approval
CREATE OR REPLACE FUNCTION update_balance_on_payment_approval()
RETURNS TRIGGER AS $$
BEGIN
    -- Only proceed if status changed to 'approved'
    IF NEW.status = 'approved' AND OLD.status = 'pending_validation' THEN
        -- Update customer balance
        UPDATE customer_balances
        SET 
            total_payments_received = total_payments_received + NEW.amount,
            outstanding_balance = outstanding_balance - NEW.amount,
            last_transaction_date = NEW.validated_at,
            modified_at = CURRENT_TIMESTAMP
        WHERE customer_id = NEW.customer_id AND store_id = NEW.store_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_balance_on_approval 
AFTER UPDATE ON payment_submissions
FOR EACH ROW EXECUTE FUNCTION update_balance_on_payment_approval();

-- Function to clean up expired OTPs (call this periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
    DELETE FROM otp_verifications
    WHERE expires_at < CURRENT_TIMESTAMP - INTERVAL '1 hour'
    AND is_verified = false;
END;
$$ language 'plpgsql';