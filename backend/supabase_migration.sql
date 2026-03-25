-- =====================================================
-- Supabase Migration: MongoDB → PostgreSQL
-- 7 Super City Retail System
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'cashier' CHECK (role IN ('admin', 'manager', 'cashier')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. CUSTOMERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    loyalty_points INTEGER DEFAULT 0 CHECK (loyalty_points >= 0),
    total_purchases INTEGER DEFAULT 0 CHECK (total_purchases >= 0),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. SUPPLIERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) DEFAULT '',
    email VARCHAR(255) DEFAULT '',
    phone VARCHAR(50) DEFAULT '',
    address TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4A. CUSTOMER FEEDBACKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS customer_feedbacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. PRODUCTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    category_id UUID NOT NULL REFERENCES categories(id),
    description TEXT DEFAULT '',
    cost_price NUMERIC(12, 2) NOT NULL CHECK (cost_price >= 0),
    selling_price NUMERIC(12, 2) NOT NULL CHECK (selling_price >= 0),
    minimum_stock_level INTEGER DEFAULT 10 CHECK (minimum_stock_level >= 0),
    is_active BOOLEAN DEFAULT true,
    product_image TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. PRODUCT_SUPPLIERS (many-to-many junction table)
-- =====================================================
CREATE TABLE IF NOT EXISTS product_suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    UNIQUE(product_id, supplier_id)
);

-- =====================================================
-- 7. SUPPLIER_SUPPLIED_PRODUCTS (junction table)
-- =====================================================
CREATE TABLE IF NOT EXISTS supplier_supplied_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(supplier_id, product_id)
);

-- =====================================================
-- 8. INVENTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
    current_stock INTEGER DEFAULT 0 CHECK (current_stock >= 0),
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. COUPONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type VARCHAR(20) NOT NULL DEFAULT 'Percentage' CHECK (discount_type IN ('Percentage', 'Fixed')),
    discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value >= 0),
    expiry_date TIMESTAMPTZ NOT NULL,
    is_used BOOLEAN DEFAULT false,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 10. PURCHASES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_number VARCHAR(50) UNIQUE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    purchase_date TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled')),
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 11. PURCHASE_ITEMS TABLE (embedded array in MongoDB)
-- =====================================================
CREATE TABLE IF NOT EXISTS purchase_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_id UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 1),
    cost_price NUMERIC(12, 2) NOT NULL CHECK (cost_price >= 0),
    total NUMERIC(12, 2) NOT NULL CHECK (total >= 0)
);

-- =====================================================
-- 12. SALES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    customer_name VARCHAR(255) NOT NULL,
    customer_id UUID REFERENCES customers(id),
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    tax NUMERIC(12, 2) DEFAULT 0,
    grand_total NUMERIC(12, 2) NOT NULL CHECK (grand_total >= 0),
    total_cost NUMERIC(12, 2) DEFAULT 0,
    total_profit NUMERIC(12, 2) DEFAULT 0,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('Cash', 'Card')),
    coupon_used UUID REFERENCES coupons(id) ON DELETE SET NULL,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 13. SALE_ITEMS TABLE (embedded array in MongoDB)
-- =====================================================
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 1),
    cost_price NUMERIC(12, 2) NOT NULL CHECK (cost_price >= 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    total NUMERIC(12, 2) NOT NULL
);

-- =====================================================
-- 14. STOCK_TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS stock_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('stock-in', 'stock-out')),
    reference_type VARCHAR(20) DEFAULT 'manual' CHECK (reference_type IN ('purchase', 'manual', 'sale')),
    reference_id UUID DEFAULT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 1),
    date TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES for performance
-- =====================================================
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_sales_invoice ON sales(invoice_number);
CREATE INDEX idx_sales_created ON sales(created_at);
CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product ON sale_items(product_id);
CREATE INDEX idx_purchases_supplier ON purchases(supplier_id);
CREATE INDEX idx_purchases_date ON purchases(purchase_date);
CREATE INDEX idx_purchase_items_purchase ON purchase_items(purchase_id);
CREATE INDEX idx_stock_transactions_product ON stock_transactions(product_id);
CREATE INDEX idx_stock_transactions_type ON stock_transactions(type);
CREATE INDEX idx_coupons_customer ON coupons(customer_id);
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_feedback_customer ON customer_feedbacks(customer_id);
CREATE INDEX idx_feedback_status ON customer_feedbacks(status);

-- =====================================================
-- 16. INVENTORY REPORTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    from_date TIMESTAMPTZ NOT NULL,
    to_date TIMESTAMPTZ NOT NULL,
    notes TEXT DEFAULT '',
    summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    transactions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT inventory_reports_valid_range CHECK (from_date <= to_date)
);

CREATE INDEX IF NOT EXISTS idx_inventory_reports_created_at ON inventory_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_reports_from_to ON inventory_reports(from_date, to_date);
CREATE INDEX IF NOT EXISTS idx_inventory_reports_created_by ON inventory_reports(created_by);

-- =====================================================
-- FUNCTION: Auto-update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_feedbacks_updated_at BEFORE UPDATE ON customer_feedbacks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_transactions_updated_at BEFORE UPDATE ON stock_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_reports_updated_at BEFORE UPDATE ON inventory_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- OLD MONGO ID MAPPING TABLE (for data migration)
-- =====================================================
CREATE TABLE IF NOT EXISTS mongo_id_map (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    mongo_id VARCHAR(100) NOT NULL,
    new_id UUID NOT NULL,
    UNIQUE(table_name, mongo_id)
);

-- =====================================================
-- PATCH: SALES DISCOUNT COLUMNS (Coupon visibility + invoice)
-- =====================================================
ALTER TABLE sales
    ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS discounted_subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0;

-- Backfill existing rows so old data remains consistent.
UPDATE sales
SET
    discount_amount = GREATEST(0, COALESCE(subtotal, 0) - (COALESCE(grand_total, 0) - COALESCE(tax, 0))),
    discounted_subtotal = (COALESCE(grand_total, 0) - COALESCE(tax, 0))
WHERE COALESCE(discounted_subtotal, 0) = 0;

-- =====================================================
-- PATCH: INVENTORY STOCK SPLIT (Displayed vs Stored)
-- =====================================================
ALTER TABLE inventory
    ADD COLUMN IF NOT EXISTS displayed_stock INTEGER NOT NULL DEFAULT 0 CHECK (displayed_stock >= 0),
    ADD COLUMN IF NOT EXISTS stored_stock INTEGER NOT NULL DEFAULT 0 CHECK (stored_stock >= 0);

-- Safe backfill: keep all legacy stock as displayed stock initially.
UPDATE inventory
SET
    displayed_stock = COALESCE(current_stock, 0),
    stored_stock = COALESCE(stored_stock, 0)
WHERE COALESCE(displayed_stock, 0) = 0 AND COALESCE(stored_stock, 0) = 0;

-- =====================================================
-- 15. AUDIT LOGS TABLE (Security & Compliance)
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255),
    user_role VARCHAR(50),
    action VARCHAR(20) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255),
    request_body JSONB,
    ip_address VARCHAR(45),
    status_code INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient audit queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- =====================================================
-- 16. SALES AUDIT LOGS TABLE (Enhanced Audit Trail)
-- =====================================================
CREATE TABLE IF NOT EXISTS sales_audit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(50),
    action VARCHAR(20) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'EXPORT')),
    changes JSONB DEFAULT '{}'::jsonb,
    reason TEXT DEFAULT NULL,
    ip_address VARCHAR(45),
    status_code INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient audit queries
CREATE INDEX IF NOT EXISTS idx_sales_audit_sale_id ON sales_audit(sale_id);
CREATE INDEX IF NOT EXISTS idx_sales_audit_user_id ON sales_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_audit_action ON sales_audit(action);
CREATE INDEX IF NOT EXISTS idx_sales_audit_created_at ON sales_audit(created_at DESC);

-- =====================================================
-- PATCH: COUPONS FK CASCADE FOR CUSTOMER DELETE
-- =====================================================
DO $$
BEGIN
    ALTER TABLE coupons DROP CONSTRAINT IF EXISTS coupons_customer_id_fkey;
EXCEPTION
    WHEN undefined_table THEN NULL;
END $$;

ALTER TABLE IF EXISTS coupons
    ADD CONSTRAINT coupons_customer_id_fkey
    FOREIGN KEY (customer_id)
    REFERENCES customers(id)
    ON DELETE CASCADE;

-- =====================================================
-- PATCH: SALES COUPON FK SET NULL ON COUPON DELETE
-- =====================================================
DO $$
BEGIN
    ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_coupon_used_fkey;
EXCEPTION
    WHEN undefined_table THEN NULL;
END $$;

ALTER TABLE IF EXISTS sales
    ADD CONSTRAINT sales_coupon_used_fkey
    FOREIGN KEY (coupon_used)
    REFERENCES coupons(id)
    ON DELETE SET NULL;
