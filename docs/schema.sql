-- ============================================================
-- Philanthroffee Ordering System — Complete PostgreSQL DDL Script
-- Execute this entire script directly in Supabase SQL Editor
-- ============================================================

-- 1. TABLES & SCHEMAS

CREATE TABLE IF NOT EXISTS branches (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    slug            VARCHAR(50) NOT NULL UNIQUE,
    address         TEXT,
    phone           VARCHAR(20),
    is_active       BOOLEAN NOT NULL DEFAULT true,
    ordering_paused BOOLEAN NOT NULL DEFAULT false,
    dine_in_enabled BOOLEAN NOT NULL DEFAULT true,
    pickup_enabled  BOOLEAN NOT NULL DEFAULT true,
    default_prep_time_minutes INTEGER NOT NULL DEFAULT 8,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    branch_id       UUID NOT NULL REFERENCES branches(id),
    email           VARCHAR(255) NOT NULL UNIQUE,
    full_name       VARCHAR(100) NOT NULL,
    role            VARCHAR(20) NOT NULL CHECK (role IN ('OWNER','ADMIN','CASHIER','BARISTA')),
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_branch ON users(branch_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE TABLE IF NOT EXISTS tables (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id       UUID NOT NULL REFERENCES branches(id),
    table_number    VARCHAR(10) NOT NULL,
    qr_token        VARCHAR(64) NOT NULL UNIQUE,
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','DISABLED')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(branch_id, table_number)
);

CREATE INDEX IF NOT EXISTS idx_tables_branch ON tables(branch_id);
CREATE INDEX IF NOT EXISTS idx_tables_token ON tables(qr_token);

CREATE TABLE IF NOT EXISTS categories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id       UUID NOT NULL REFERENCES branches(id),
    name            VARCHAR(50) NOT NULL,
    slug            VARCHAR(50) NOT NULL,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(branch_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_categories_branch ON categories(branch_id);

CREATE TABLE IF NOT EXISTS products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id       UUID NOT NULL REFERENCES branches(id),
    category_id     UUID NOT NULL REFERENCES categories(id),
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    image_url       TEXT,
    base_price      INTEGER NOT NULL CHECK (base_price >= 0),
    availability    VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' 
                    CHECK (availability IN ('AVAILABLE','SOLD_OUT','HIDDEN')),
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_branch ON products(branch_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_availability ON products(availability);

CREATE TABLE IF NOT EXISTS product_variants (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id          UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name                VARCHAR(50) NOT NULL,
    price_adjustment    INTEGER NOT NULL DEFAULT 0,
    sort_order          INTEGER NOT NULL DEFAULT 0,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);

CREATE TABLE IF NOT EXISTS modifier_groups (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id       UUID NOT NULL REFERENCES branches(id),
    name            VARCHAR(50) NOT NULL,
    selection_type  VARCHAR(20) NOT NULL CHECK (selection_type IN ('SINGLE','MULTIPLE')),
    is_required     BOOLEAN NOT NULL DEFAULT false,
    min_selections  INTEGER NOT NULL DEFAULT 0,
    max_selections  INTEGER,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_modifier_groups_branch ON modifier_groups(branch_id);

CREATE TABLE IF NOT EXISTS modifiers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modifier_group_id   UUID NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
    name                VARCHAR(50) NOT NULL,
    price_adjustment    INTEGER NOT NULL DEFAULT 0,
    sort_order          INTEGER NOT NULL DEFAULT 0,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_modifiers_group ON modifiers(modifier_group_id);

CREATE TABLE IF NOT EXISTS product_modifier_groups (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id          UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    modifier_group_id   UUID NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
    sort_order          INTEGER NOT NULL DEFAULT 0,
    UNIQUE(product_id, modifier_group_id)
);

CREATE INDEX IF NOT EXISTS idx_pmg_product ON product_modifier_groups(product_id);
CREATE INDEX IF NOT EXISTS idx_pmg_modifier_group ON product_modifier_groups(modifier_group_id);

CREATE TABLE IF NOT EXISTS orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id           UUID NOT NULL REFERENCES branches(id),
    order_number        VARCHAR(20) NOT NULL UNIQUE,
    order_type          VARCHAR(20) NOT NULL CHECK (order_type IN ('DINE_IN','PICKUP')),
    table_id            UUID REFERENCES tables(id),
    customer_name       VARCHAR(100) NOT NULL,
    customer_phone      VARCHAR(20),
    status              VARCHAR(20) NOT NULL DEFAULT 'WAITING_PAYMENT'
                        CHECK (status IN ('WAITING_PAYMENT','PAID','PREPARING','READY','COMPLETED','CANCELLED')),
    subtotal            INTEGER NOT NULL CHECK (subtotal >= 0),
    total               INTEGER NOT NULL CHECK (total >= 0),
    notes               TEXT,
    idempotency_key     VARCHAR(64) UNIQUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_dine_in_table CHECK (
        (order_type = 'DINE_IN' AND table_id IS NOT NULL) OR
        (order_type = 'PICKUP' AND table_id IS NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_orders_branch ON orders(branch_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_table ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_branch_status ON orders(branch_id, status);

CREATE TABLE IF NOT EXISTS order_items (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id                UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id              UUID REFERENCES products(id),
    product_variant_id      UUID REFERENCES product_variants(id),
    product_name_snapshot   VARCHAR(100) NOT NULL,
    variant_name_snapshot   VARCHAR(50),
    base_price_snapshot     INTEGER NOT NULL,
    variant_price_snapshot  INTEGER NOT NULL DEFAULT 0,
    quantity                INTEGER NOT NULL CHECK (quantity > 0),
    unit_price              INTEGER NOT NULL CHECK (unit_price >= 0),
    subtotal                INTEGER NOT NULL CHECK (subtotal >= 0),
    notes                   TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

CREATE TABLE IF NOT EXISTS order_item_modifiers (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id               UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    modifier_id                 UUID REFERENCES modifiers(id),
    modifier_group_id           UUID REFERENCES modifier_groups(id),
    modifier_name_snapshot      VARCHAR(50) NOT NULL,
    modifier_group_name_snapshot VARCHAR(50) NOT NULL,
    price_adjustment_snapshot   INTEGER NOT NULL DEFAULT 0,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_oim_order_item ON order_item_modifiers(order_item_id);

CREATE TABLE IF NOT EXISTS payments (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id                    UUID NOT NULL REFERENCES orders(id),
    payment_method              VARCHAR(20) NOT NULL 
                                CHECK (payment_method IN ('QRIS','E_WALLET','PAY_AT_CASHIER')),
    status                      VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                                CHECK (status IN ('PENDING','PAID','FAILED','EXPIRED','REFUNDED')),
    amount                      INTEGER NOT NULL CHECK (amount > 0),
    provider_transaction_id     VARCHAR(100) UNIQUE,
    provider_status             VARCHAR(50),
    snap_token                  TEXT,
    payment_url                 TEXT,
    paid_at                     TIMESTAMPTZ,
    expired_at                  TIMESTAMPTZ,
    confirmed_by                UUID REFERENCES users(id),
    last_reconciled_at          TIMESTAMPTZ,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_one_per_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_provider_tx ON payments(provider_transaction_id);

CREATE TABLE IF NOT EXISTS payment_events (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id              UUID NOT NULL REFERENCES payments(id),
    event_type              VARCHAR(50) NOT NULL,
    provider_status         VARCHAR(50),
    provider_event_id       VARCHAR(100),
    raw_payload             JSONB,
    source                  VARCHAR(20) NOT NULL CHECK (source IN ('WEBHOOK','RECONCILIATION','MANUAL','SYSTEM')),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_events_payment ON payment_events(payment_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_events_provider_event
    ON payment_events(payment_id, event_type, provider_event_id);

CREATE TABLE IF NOT EXISTS order_status_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    from_status     VARCHAR(20),
    to_status       VARCHAR(20) NOT NULL,
    changed_by      UUID REFERENCES users(id),
    source          VARCHAR(20) NOT NULL DEFAULT 'SYSTEM'
                    CHECK (source IN ('SYSTEM','STAFF','WEBHOOK','RECONCILIATION')),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_osh_order ON order_status_history(order_id);

CREATE TABLE IF NOT EXISTS order_number_sequences (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id       UUID NOT NULL REFERENCES branches(id),
    order_date      DATE NOT NULL,
    last_number     INTEGER NOT NULL DEFAULT 0,
    UNIQUE(branch_id, order_date)
);

CREATE TABLE IF NOT EXISTS branch_settings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id       UUID NOT NULL REFERENCES branches(id) UNIQUE,
    timezone        VARCHAR(50) NOT NULL DEFAULT 'Asia/Jakarta',
    currency        VARCHAR(3) NOT NULL DEFAULT 'IDR',
    tax_rate        DECIMAL(5,2) NOT NULL DEFAULT 0,
    tax_included    BOOLEAN NOT NULL DEFAULT true,
    receipt_header  TEXT,
    receipt_footer  TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS operating_hours (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id       UUID NOT NULL REFERENCES branches(id),
    day_of_week     INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    open_time       TIME NOT NULL,
    close_time      TIME NOT NULL,
    is_closed       BOOLEAN NOT NULL DEFAULT false,
    UNIQUE(branch_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS special_operating_hours (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id       UUID NOT NULL REFERENCES branches(id),
    date            DATE NOT NULL,
    open_time       TIME,
    close_time      TIME,
    is_closed       BOOLEAN NOT NULL DEFAULT false,
    reason          VARCHAR(200),
    UNIQUE(branch_id, date)
);

CREATE TABLE IF NOT EXISTS idempotency_keys (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key             VARCHAR(64) NOT NULL UNIQUE,
    endpoint        VARCHAR(100) NOT NULL,
    response_status INTEGER NOT NULL,
    response_body   JSONB NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours'
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    action          VARCHAR(50) NOT NULL,
    entity_type     VARCHAR(50) NOT NULL,
    entity_id       UUID,
    old_value       JSONB,
    new_value       JSONB,
    ip_address      INET,
    user_agent      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. FUNCTIONS & TRIGGERS

CREATE OR REPLACE FUNCTION next_order_number(p_branch_id UUID, p_date DATE)
RETURNS INTEGER AS $$
DECLARE
    next_num INTEGER;
BEGIN
    INSERT INTO order_number_sequences (branch_id, order_date, last_number)
    VALUES (p_branch_id, p_date, 1)
    ON CONFLICT (branch_id, order_date)
    DO UPDATE SET last_number = order_number_sequences.last_number + 1
    RETURNING last_number INTO next_num;
    
    RETURN next_num;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_order_atomic(
    p_branch_id UUID,
    p_order_type VARCHAR,
    p_table_id UUID,
    p_customer_name VARCHAR,
    p_customer_phone VARCHAR,
    p_subtotal INTEGER,
    p_total INTEGER,
    p_idempotency_key VARCHAR,
    p_items JSONB
) RETURNS JSONB AS $$
DECLARE
    created_order orders%ROWTYPE;
    item JSONB;
    modifier JSONB;
    created_item_id UUID;
    result_body JSONB;
BEGIN
    IF p_idempotency_key IS NOT NULL THEN
        PERFORM pg_advisory_xact_lock(hashtext(p_idempotency_key));
        SELECT stored.response_body INTO result_body
        FROM idempotency_keys AS stored
        WHERE stored.key = p_idempotency_key;
        IF result_body IS NOT NULL THEN
            RETURN result_body;
        END IF;
    END IF;

    INSERT INTO orders (
        branch_id, order_number, order_type, table_id, customer_name,
        customer_phone, status, subtotal, total, idempotency_key
    ) VALUES (
        p_branch_id,
        'PH' || LPAD(next_order_number(p_branch_id, CURRENT_DATE)::TEXT, 4, '0'),
        p_order_type, p_table_id, p_customer_name, p_customer_phone,
        'WAITING_PAYMENT', p_subtotal, p_total, p_idempotency_key
    ) RETURNING * INTO created_order;

    FOR item IN SELECT value FROM jsonb_array_elements(p_items)
    LOOP
        INSERT INTO order_items (
            order_id, product_id, product_variant_id, product_name_snapshot,
            variant_name_snapshot, base_price_snapshot, variant_price_snapshot,
            quantity, unit_price, subtotal, notes
        ) VALUES (
            created_order.id, (item->>'product_id')::UUID,
            NULLIF(item->>'variant_id', '')::UUID, item->>'product_name',
            item->>'variant_name', (item->>'base_price')::INTEGER,
            (item->>'variant_price')::INTEGER, (item->>'quantity')::INTEGER,
            (item->>'unit_price')::INTEGER, (item->>'subtotal')::INTEGER,
            item->>'notes'
        ) RETURNING id INTO created_item_id;

        FOR modifier IN SELECT value FROM jsonb_array_elements(item->'modifier_details')
        LOOP
            INSERT INTO order_item_modifiers (
                order_item_id, modifier_id, modifier_group_id,
                modifier_name_snapshot, modifier_group_name_snapshot,
                price_adjustment_snapshot
            ) VALUES (
                created_item_id, (modifier->>'modifier_id')::UUID,
                (modifier->>'modifier_group_id')::UUID,
                modifier->>'modifier_name', modifier->>'group_name',
                (modifier->>'price_adjustment')::INTEGER
            );
        END LOOP;
    END LOOP;

    INSERT INTO order_status_history (order_id, from_status, to_status, source, notes)
    VALUES (created_order.id, NULL, 'WAITING_PAYMENT', 'SYSTEM', 'Order created');

    result_body := jsonb_build_object(
        'success', true,
        'data', jsonb_build_object(
            'id', created_order.id,
            'order_number', created_order.order_number,
            'order_type', created_order.order_type,
            'status', created_order.status,
            'total', created_order.total,
            'created_at', created_order.created_at
        )
    );

    IF p_idempotency_key IS NOT NULL THEN
        INSERT INTO idempotency_keys (key, endpoint, response_status, response_body)
        VALUES (p_idempotency_key, '/api/orders', 200, result_body)
        ON CONFLICT (key) DO UPDATE SET response_body = EXCLUDED.response_body;
    END IF;

    RETURN result_body;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION create_order_atomic(UUID, VARCHAR, UUID, VARCHAR, VARCHAR, INTEGER, INTEGER, VARCHAR, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_order_atomic(UUID, VARCHAR, UUID, VARCHAR, VARCHAR, INTEGER, INTEGER, VARCHAR, JSONB) TO service_role;

CREATE OR REPLACE FUNCTION validate_order_transition()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;
    
    IF NOT (
        (OLD.status = 'WAITING_PAYMENT' AND NEW.status IN ('PAID', 'CANCELLED')) OR
        (OLD.status = 'PAID' AND NEW.status IN ('PREPARING', 'CANCELLED')) OR
        (OLD.status = 'PREPARING' AND NEW.status = 'READY') OR
        (OLD.status = 'READY' AND NEW.status = 'COMPLETED')
    ) THEN
        RAISE EXCEPTION 'Invalid order status transition: % → %', OLD.status, NEW.status;
    END IF;
    
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_order_transition ON orders;
CREATE TRIGGER trg_validate_order_transition
    BEFORE UPDATE OF status ON orders
    FOR EACH ROW
    EXECUTE FUNCTION validate_order_transition();

CREATE OR REPLACE FUNCTION validate_payment_transition()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;
    
    IF NOT (
        (OLD.status = 'PENDING' AND NEW.status IN ('PAID', 'FAILED', 'EXPIRED')) OR
        (OLD.status = 'PAID' AND NEW.status = 'REFUNDED')
    ) THEN
        RAISE EXCEPTION 'Invalid payment status transition: % → %', OLD.status, NEW.status;
    END IF;
    
    IF NEW.status = 'PAID' THEN
        NEW.paid_at = NOW();
    END IF;
    
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_payment_transition ON payments;
CREATE TRIGGER trg_validate_payment_transition
    BEFORE UPDATE OF status ON payments
    FOR EACH ROW
    EXECUTE FUNCTION validate_payment_transition();

-- 3. SEED INITIAL DATA

INSERT INTO branches (id, name, slug) VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Philanthroffee', 'philanthroffee')
ON CONFLICT (id) DO NOTHING;

INSERT INTO operating_hours (branch_id, day_of_week, open_time, close_time) VALUES
    ('00000000-0000-0000-0000-000000000001', 0, '08:00', '22:00'),
    ('00000000-0000-0000-0000-000000000001', 1, '08:00', '22:00'),
    ('00000000-0000-0000-0000-000000000001', 2, '08:00', '22:00'),
    ('00000000-0000-0000-0000-000000000001', 3, '08:00', '22:00'),
    ('00000000-0000-0000-0000-000000000001', 4, '08:00', '22:00'),
    ('00000000-0000-0000-0000-000000000001', 5, '09:00', '23:00'),
    ('00000000-0000-0000-0000-000000000001', 6, '09:00', '23:00')
ON CONFLICT (branch_id, day_of_week) DO NOTHING;

INSERT INTO branch_settings (branch_id) VALUES 
    ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (branch_id) DO NOTHING;

INSERT INTO categories (branch_id, name, slug, sort_order) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Coffee', 'coffee', 1),
    ('00000000-0000-0000-0000-000000000001', 'Non Coffee', 'non-coffee', 2),
    ('00000000-0000-0000-0000-000000000001', 'Tea', 'tea', 3),
    ('00000000-0000-0000-0000-000000000001', 'Herbs & Spices', 'herbs-spices', 4),
    ('00000000-0000-0000-0000-000000000001', 'Food', 'food', 5),
    ('00000000-0000-0000-0000-000000000001', 'Snack', 'snack', 6)
ON CONFLICT (branch_id, slug) DO NOTHING;
