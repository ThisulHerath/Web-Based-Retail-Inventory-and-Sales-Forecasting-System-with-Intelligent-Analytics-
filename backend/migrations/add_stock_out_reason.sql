-- Add reason tracking for stock-out transactions.
ALTER TABLE stock_transactions
ADD COLUMN IF NOT EXISTS stock_out_reason VARCHAR(20);

-- Enforce allowed reason values for consistency.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'stock_transactions_stock_out_reason_check'
    ) THEN
        ALTER TABLE stock_transactions
        ADD CONSTRAINT stock_transactions_stock_out_reason_check
        CHECK (stock_out_reason IN ('expired', 'damaged', 'other') OR stock_out_reason IS NULL);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_stock_transactions_stock_out_reason
ON stock_transactions(stock_out_reason);
