-- Add company locations table
CREATE TABLE IF NOT EXISTS company_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) DEFAULT 0,
  longitude DECIMAL(11, 8) DEFAULT 0,
  type VARCHAR(50) DEFAULT 'warehouse' CHECK (type IN ('headquarters', 'warehouse', 'factory', 'supplier')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add AI settings table
CREATE TABLE IF NOT EXISTS ai_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  preferences JSONB DEFAULT '[]',
  ai_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_settings_row CHECK (id = 1)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_company_locations_type ON company_locations(type);
CREATE INDEX IF NOT EXISTS idx_company_locations_created_at ON company_locations(created_at);

-- Insert default AI settings if none exist
INSERT INTO ai_settings (id, preferences, ai_settings) 
VALUES (1, '[]', '{}') 
ON CONFLICT (id) DO NOTHING;
