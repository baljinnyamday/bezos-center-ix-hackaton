-- Create companies table for demand tracking
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_email TEXT,
  priority_level INTEGER DEFAULT 1, -- 1=high, 2=medium, 3=low
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create demand_orders table
CREATE TABLE IF NOT EXISTS demand_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity_requested INTEGER NOT NULL,
  urgency_level INTEGER DEFAULT 2, -- 1=urgent, 2=normal, 3=low
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create production_metrics table
CREATE TABLE IF NOT EXISTS production_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_line TEXT NOT NULL,
  current_rate DECIMAL(10,2) NOT NULL, -- units per hour
  target_rate DECIMAL(10,2) NOT NULL,
  efficiency_percentage DECIMAL(5,2),
  status TEXT DEFAULT 'active', -- active, maintenance, offline
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create supply_allocations table for AI decisions
CREATE TABLE IF NOT EXISTS supply_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demand_order_id UUID NOT NULL REFERENCES demand_orders(id) ON DELETE CASCADE,
  allocated_quantity INTEGER NOT NULL,
  production_line TEXT NOT NULL,
  priority_score DECIMAL(5,2), -- AI-calculated priority
  allocation_reason TEXT, -- AI reasoning
  weather_factor DECIMAL(3,2) DEFAULT 1.0,
  market_factor DECIMAL(3,2) DEFAULT 1.0,
  news_sentiment_factor DECIMAL(3,2) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create external_data_cache table for AI inputs
CREATE TABLE IF NOT EXISTS external_data_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_type TEXT NOT NULL, -- weather, news, trading, market
  data_content JSONB NOT NULL,
  relevance_score DECIMAL(3,2),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_decisions table for tracking AI reasoning
CREATE TABLE IF NOT EXISTS ai_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_type TEXT NOT NULL, -- allocation, priority_adjustment, production_recommendation
  input_data JSONB NOT NULL,
  output_data JSONB NOT NULL,
  confidence_score DECIMAL(3,2),
  reasoning TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data for companies
INSERT INTO companies (name, contact_email, priority_level) VALUES
('Company A', 'orders@companya.com', 1),
('Company B', 'procurement@companyb.com', 2),
('Company C', 'supply@companyc.com', 1)
ON CONFLICT DO NOTHING;

-- Insert sample demand orders
INSERT INTO demand_orders (company_id, product_name, quantity_requested, urgency_level, due_date) 
SELECT 
  c.id,
  CASE 
    WHEN c.name = 'Company A' THEN 'Premium Widgets'
    WHEN c.name = 'Company B' THEN 'Standard Components'
    ELSE 'Custom Parts'
  END,
  CASE 
    WHEN c.name = 'Company A' THEN 500
    WHEN c.name = 'Company B' THEN 750
    ELSE 300
  END,
  CASE 
    WHEN c.name = 'Company A' THEN 1
    WHEN c.name = 'Company B' THEN 2
    ELSE 1
  END,
  NOW() + INTERVAL '7 days'
FROM companies c
ON CONFLICT DO NOTHING;

-- Insert sample production metrics
INSERT INTO production_metrics (production_line, current_rate, target_rate, efficiency_percentage, status) VALUES
('Line A - Premium', 45.5, 50.0, 91.0, 'active'),
('Line B - Standard', 78.2, 80.0, 97.8, 'active'),
('Line C - Custom', 25.8, 30.0, 86.0, 'maintenance')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_demand_orders_company_id ON demand_orders(company_id);
CREATE INDEX IF NOT EXISTS idx_demand_orders_status ON demand_orders(status);
CREATE INDEX IF NOT EXISTS idx_supply_allocations_demand_order_id ON supply_allocations(demand_order_id);
CREATE INDEX IF NOT EXISTS idx_production_metrics_recorded_at ON production_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_external_data_cache_data_type ON external_data_cache(data_type);
CREATE INDEX IF NOT EXISTS idx_external_data_cache_expires_at ON external_data_cache(expires_at);
