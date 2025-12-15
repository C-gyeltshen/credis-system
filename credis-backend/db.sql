-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- For password hashing

-- ==========================================
-- CORE ENTITIES
-- ==========================================

-- Stores table
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT,
    phone_number TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Store owners table (with local authentication)
CREATE TABLE store_owners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL, -- bcrypt hashed password
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Admins table (for system administration)
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_super_admin BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Customers/Borrowers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    cid_number TEXT, -- Bhutanese Citizenship ID (optional)
    address TEXT,
    email TEXT,
    credit_limit DECIMAL(12, 2), -- FR1.2: Optional maximum credit limit
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(store_id, phone_number) -- Unique phone per store
);

-- ==========================================
-- AUTHENTICATION & SECURITY
-- ==========================================

-- OTP codes table for customer authentication (FR4.1)
CREATE TABLE otp_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number TEXT NOT NULL,
    otp_code TEXT NOT NULL, -- 6-digit code
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    is_used BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Customer sessions table (after OTP verification)
CREATE TABLE customer_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- TRANSACTION MANAGEMENT
-- ==========================================

-- Credit transactions table (FR2.1, FR2.2)
CREATE TABLE credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit_given', 'payment_received')),
    transaction_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    items_description TEXT, -- FR2.1: Item(s) purchased
    journal_number TEXT,
    reference_number TEXT,
    created_by_owner_id UUID REFERENCES store_owners(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Payment submissions table (FR4.3, FR4.4, FR4.5, FR5.x)
-- For customer-initiated payments pending validation
CREATE TABLE payment_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    screenshot_url TEXT NOT NULL, -- Path to uploaded screenshot
    screenshot_filename TEXT NOT NULL,
    payment_method TEXT, -- e.g., 'bank_transfer', 'mobile_money', 'cash'
    payment_reference TEXT, -- Transaction ID from screenshot
    notes TEXT, -- Customer notes
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending', -- FR5.3, FR5.4
    submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    validated_at TIMESTAMPTZ,
    validated_by_owner_id UUID REFERENCES store_owners(id),
    rejection_reason TEXT, -- FR5.4: Reason for rejection
    linked_credit_id UUID REFERENCES credits(id), -- FR6.1: Links to created credit transaction
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Customer balance summary table (FR2.3)
CREATE TABLE customer_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    total_credit_given DECIMAL(12, 2) DEFAULT 0,
    total_payments_received DECIMAL(12, 2) DEFAULT 0,
    outstanding_balance DECIMAL(12, 2) DEFAULT 0,
    last_credit_date TIMESTAMPTZ, -- For FR3.3: Overdue tracking
    last_payment_date TIMESTAMPTZ,
    last_transaction_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(customer_id, store_id)
);

-- ==========================================
-- NOTIFICATIONS
-- ==========================================

-- Unified notifications table (FR6.2, FR6.3)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    notification_channel TEXT NOT NULL CHECK (notification_channel IN ('sms', 'email', 'both')),
    recipient_phone TEXT,
    recipient_email TEXT,
    subject TEXT, -- For emails
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN (
        'payment_approved', 
        'payment_rejected', 
        'credit_given', 
        'payment_received',
        'monthly_reminder', 
        'overdue_reminder',
        'credit_limit_warning',
        'custom'
    )),
    related_payment_submission_id UUID REFERENCES payment_submissions(id),
    related_credit_id UUID REFERENCES credits(id),
    status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'delivered')) DEFAULT 'pending',
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    error_message TEXT,
    retry_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Notification schedules table
CREATE TABLE notification_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE, -- NULL = all customers
    notification_type TEXT NOT NULL DEFAULT 'monthly_reminder',
    notification_channel TEXT NOT NULL DEFAULT 'sms',
    day_of_month INT CHECK (day_of_month BETWEEN 1 AND 31),
    is_active BOOLEAN DEFAULT true,
    last_sent_at TIMESTAMPTZ,
    next_scheduled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- AUDITING & LOGGING
-- ==========================================

-- Audit log table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    user_type TEXT NOT NULL CHECK (user_type IN ('store_owner', 'admin', 'customer')),
    action TEXT NOT NULL, -- 'create', 'update', 'delete', 'login', 'validate_payment', etc.
    entity_type TEXT NOT NULL, -- 'customer', 'credit', 'payment_submission', etc.
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- Store owners indexes
CREATE INDEX idx_store_owners_store_id ON store_owners(store_id);
CREATE INDEX idx_store_owners_email ON store_owners(email);

-- Customers indexes
CREATE INDEX idx_customers_store_id ON customers(store_id);
CREATE INDEX idx_customers_phone_number ON customers(phone_number);
CREATE INDEX idx_customers_active ON customers(is_active) WHERE is_active = true;

-- OTP codes indexes
CREATE INDEX idx_otp_codes_phone ON otp_codes(phone_number);
CREATE INDEX idx_otp_codes_expires ON otp_codes(expires_at) WHERE is_used = false;

-- Customer sessions indexes
CREATE INDEX idx_customer_sessions_token ON customer_sessions(session_token);
CREATE INDEX idx_customer_sessions_customer_id ON customer_sessions(customer_id);

-- Credits indexes
CREATE INDEX idx_credits_customer_id ON credits(customer_id);
CREATE INDEX idx_credits_store_id ON credits(store_id);
CREATE INDEX idx_credits_transaction_date ON credits(transaction_date);
CREATE INDEX idx_credits_type ON credits(transaction_type);

-- Payment submissions indexes
CREATE INDEX idx_payment_submissions_customer_id ON payment_submissions(customer_id);
CREATE INDEX idx_payment_submissions_store_id ON payment_submissions(store_id);
CREATE INDEX idx_payment_submissions_status ON payment_submissions(status);
CREATE INDEX idx_payment_submissions_submitted_at ON payment_submissions(submitted_at);

-- Customer balances indexes
CREATE INDEX idx_customer_balances_customer_id ON customer_balances(customer_id);
CREATE INDEX idx_customer_balances_store_id ON customer_balances(store_id);
CREATE INDEX idx_customer_balances_outstanding ON customer_balances(outstanding_balance) WHERE outstanding_balance > 0;

-- Notifications indexes
CREATE INDEX idx_notifications_customer_id ON notifications(customer_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_at) WHERE status = 'pending';

-- Notification schedules indexes
CREATE INDEX idx_notification_schedules_next ON notification_schedules(next_scheduled_at) WHERE is_active = true;

-- Audit logs indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ==========================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ==========================================

-- Function to update modified_at timestamp
CREATE OR REPLACE FUNCTION update_modified_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.modified_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all relevant tables
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

CREATE TRIGGER update_payment_submissions_modified_at BEFORE UPDATE ON payment_submissions
    FOR EACH ROW EXECUTE FUNCTION update_modified_at_column();

CREATE TRIGGER update_customer_balances_modified_at BEFORE UPDATE ON customer_balances
    FOR EACH ROW EXECUTE FUNCTION update_modified_at_column();

CREATE TRIGGER update_notifications_modified_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_modified_at_column();

CREATE TRIGGER update_notification_schedules_modified_at BEFORE UPDATE ON notification_schedules
    FOR EACH ROW EXECUTE FUNCTION update_modified_at_column();

-- ==========================================
-- HELPER FUNCTIONS
-- ==========================================

-- Function to calculate customer balance (FR2.3)
CREATE OR REPLACE FUNCTION calculate_customer_balance(p_customer_id UUID, p_store_id UUID)
RETURNS DECIMAL(12, 2) AS $$
DECLARE
    v_total_credit DECIMAL(12, 2);
    v_total_payments DECIMAL(12, 2);
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO v_total_credit
    FROM credits
    WHERE customer_id = p_customer_id 
        AND store_id = p_store_id 
        AND transaction_type = 'credit_given';
    
    SELECT COALESCE(SUM(amount), 0) INTO v_total_payments
    FROM credits
    WHERE customer_id = p_customer_id 
        AND store_id = p_store_id 
        AND transaction_type = 'payment_received';
    
    RETURN v_total_credit - v_total_payments;
END;
$$ LANGUAGE plpgsql;

-- Function to update customer balance summary (FR2.3, FR6.1)
CREATE OR REPLACE FUNCTION update_customer_balance_summary()
RETURNS TRIGGER AS $$
DECLARE
    v_total_credit DECIMAL(12, 2);
    v_total_payments DECIMAL(12, 2);
    v_last_credit_date TIMESTAMPTZ;
    v_last_payment_date TIMESTAMPTZ;
BEGIN
    -- Calculate totals
    SELECT 
        COALESCE(SUM(CASE WHEN transaction_type = 'credit_given' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN transaction_type = 'payment_received' THEN amount ELSE 0 END), 0),
        MAX(CASE WHEN transaction_type = 'credit_given' THEN transaction_date END),
        MAX(CASE WHEN transaction_type = 'payment_received' THEN transaction_date END)
    INTO v_total_credit, v_total_payments, v_last_credit_date, v_last_payment_date
    FROM credits
    WHERE customer_id = NEW.customer_id AND store_id = NEW.store_id;
    
    -- Upsert balance summary
    INSERT INTO customer_balances (
        customer_id, 
        store_id, 
        total_credit_given, 
        total_payments_received, 
        outstanding_balance,
        last_credit_date,
        last_payment_date,
        last_transaction_date
    ) VALUES (
        NEW.customer_id,
        NEW.store_id,
        v_total_credit,
        v_total_payments,
        v_total_credit - v_total_payments,
        v_last_credit_date,
        v_last_payment_date,
        GREATEST(v_last_credit_date, v_last_payment_date)
    )
    ON CONFLICT (customer_id, store_id) 
    DO UPDATE SET
        total_credit_given = v_total_credit,
        total_payments_received = v_total_payments,
        outstanding_balance = v_total_credit - v_total_payments,
        last_credit_date = v_last_credit_date,
        last_payment_date = v_last_payment_date,
        last_transaction_date = GREATEST(v_last_credit_date, v_last_payment_date),
        modified_at = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update balance after credit transaction
CREATE TRIGGER trigger_update_balance_after_credit
    AFTER INSERT OR UPDATE ON credits
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_balance_summary();

-- ==========================================
-- VIEWS FOR COMMON QUERIES
-- ==========================================

-- View for customer details with current balance (FR3.1)
CREATE OR REPLACE VIEW vw_customer_balances AS
SELECT 
    c.id as customer_id,
    c.store_id,
    c.name,
    c.phone_number,
    c.email,
    c.address,
    c.credit_limit,
    c.is_active,
    COALESCE(cb.outstanding_balance, 0) as outstanding_balance,
    COALESCE(cb.total_credit_given, 0) as total_credit_given,
    COALESCE(cb.total_payments_received, 0) as total_payments_received,
    cb.last_credit_date,
    cb.last_payment_date,
    cb.last_transaction_date,
    CASE 
        WHEN c.credit_limit IS NOT NULL AND COALESCE(cb.outstanding_balance, 0) >= c.credit_limit 
        THEN true 
        ELSE false 
    END as is_credit_limit_reached
FROM customers c
LEFT JOIN customer_balances cb ON c.id = cb.customer_id;

-- View for overdue customers (FR3.3)
CREATE OR REPLACE VIEW vw_overdue_customers AS
SELECT 
    c.id as customer_id,
    c.store_id,
    c.name,
    c.phone_number,
    c.email,
    cb.outstanding_balance,
    cb.last_payment_date,
    CURRENT_DATE - cb.last_payment_date::date as days_since_last_payment
FROM customers c
INNER JOIN customer_balances cb ON c.id = cb.customer_id
WHERE cb.outstanding_balance > 0
    AND c.is_active = true
    AND (
        cb.last_payment_date IS NULL 
        OR cb.last_payment_date < CURRENT_TIMESTAMP - INTERVAL '30 days'
    );

-- View for top debtors (FR3.4)
CREATE OR REPLACE VIEW vw_top_debtors AS
SELECT 
    c.id as customer_id,
    c.store_id,
    c.name,
    c.phone_number,
    c.email,
    cb.outstanding_balance,
    cb.last_transaction_date
FROM customers c
INNER JOIN customer_balances cb ON c.id = cb.customer_id
WHERE cb.outstanding_balance > 0
    AND c.is_active = true
ORDER BY cb.outstanding_balance DESC;

-- View for pending payment validations (FR5.1)
CREATE OR REPLACE VIEW vw_pending_payment_submissions AS
SELECT 
    ps.id as submission_id,
    ps.customer_id,
    ps.store_id,
    c.name as customer_name,
    c.phone_number,
    ps.amount,
    ps.screenshot_url,
    ps.screenshot_filename,
    ps.payment_method,
    ps.payment_reference,
    ps.notes,
    ps.submitted_at,
    cb.outstanding_balance as current_balance
FROM payment_submissions ps
INNER JOIN customers c ON ps.customer_id = c.id
LEFT JOIN customer_balances cb ON ps.customer_id = cb.customer_id
WHERE ps.status = 'pending'
ORDER BY ps.submitted_at ASC;