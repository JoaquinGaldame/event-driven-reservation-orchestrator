/** 
CREATE TABLE refunds (
  id BIGSERIAL PRIMARY KEY,
  public_id UUID DEFAULT gen_random_uuid() NOT NULL,
  refund_code VARCHAR(100) NOT NULL,
  
  -- Relationships
  payment_id BIGINT NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
  reservation_id BIGINT NOT NULL REFERENCES reservations(id) ON DELETE RESTRICT,
  
  -- Refund details
  refund_type VARCHAR(50) NOT NULL, -- 'full', 'partial'
  amount NUMERIC(12, 2) NOT NULL,
  currency_id BIGINT NOT NULL REFERENCES currencies(id),
  original_payment_amount NUMERIC(12, 2) NOT NULL,
  remaining_balance NUMERIC(12, 2) NOT NULL, -- original - sum(refunds)
  
  -- Business context
  reason VARCHAR(100) NOT NULL, -- 'cancellation_by_guest', 'cancellation_by_host', 'overpayment', 'dispute', 'maintenance_issue'
  reason_detail TEXT,
  approval_required BOOLEAN DEFAULT FALSE,
  approved_by VARCHAR(255),
  approved_at TIMESTAMPTZ,
  
  -- Execution
  status VARCHAR(50) NOT NULL, -- 'requested', 'approved', 'processing', 'completed', 'failed', 'rejected'
  provider VARCHAR(50) NOT NULL, -- 'mercado_pago', 'stripe', 'paypal'
  provider_refund_id VARCHAR(255),
  provider_reference VARCHAR(255),
  processed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  
  -- Policy tracking
  cancellation_policy_applied VARCHAR(50), -- 'flexible', 'moderate', 'strict'
  penalty_amount NUMERIC(12, 2) DEFAULT 0,
  penalty_kept_by VARCHAR(50), -- 'platform', 'owner'
  
  -- Traceability
  correlation_id UUID NOT NULL,
  causation_id UUID,
  
  -- Timestamps
  requested_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT refund_amount_positive CHECK (amount > 0),
  CONSTRAINT remaining_balance_non_negative CHECK (remaining_balance >= 0)
);

CREATE INDEX idx_refunds_payment ON refunds(payment_id);
CREATE INDEX idx_refunds_reservation ON refunds(reservation_id);
CREATE INDEX idx_refunds_status ON refunds(status);
CREATE INDEX idx_refunds_provider_refund ON refunds(provider, provider_refund_id);
CREATE UNIQUE INDEX idx_refunds_code ON refunds(refund_code);
CREATE UNIQUE INDEX idx_refunds_public ON refunds(public_id);
CREATE INDEX idx_refunds_correlation ON refunds(correlation_id);
CREATE INDEX idx_refunds_requested_date ON refunds(requested_at);

*/