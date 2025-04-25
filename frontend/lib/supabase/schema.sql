-- MakmurTani Supabase Schema

-- Enable the "uuid-ossp" extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL UNIQUE,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_verified BOOLEAN DEFAULT FALSE,
  roles TEXT[]
);

-- Farmlands Table
CREATE TABLE IF NOT EXISTS farmlands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  certificate_id TEXT NOT NULL UNIQUE,
  token_id BIGINT NOT NULL UNIQUE,
  owner_id UUID NOT NULL REFERENCES users(id),
  area NUMERIC NOT NULL,
  latitude TEXT NOT NULL,
  longitude TEXT NOT NULL,
  province TEXT NOT NULL,
  district TEXT NOT NULL,
  sub_district TEXT NOT NULL,
  postal_code TEXT,
  soil_type TEXT,
  crops TEXT[],
  is_verified BOOLEAN DEFAULT FALSE,
  verifier_id UUID REFERENCES users(id),
  ipfs_uri TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketplace Listings Table
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id BIGINT NOT NULL UNIQUE,
  token_id BIGINT NOT NULL REFERENCES farmlands(token_id),
  seller_id UUID NOT NULL REFERENCES users(id),
  price TEXT NOT NULL,  -- Using TEXT to handle large numbers (wei)
  payment_token TEXT NOT NULL,  -- Token address
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loans Table
CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id BIGINT NOT NULL UNIQUE,
  borrower_id UUID NOT NULL REFERENCES users(id),
  lender_id UUID REFERENCES users(id),
  token_id BIGINT NOT NULL REFERENCES farmlands(token_id),
  principal_amount TEXT NOT NULL,  -- Using TEXT to handle large numbers (wei)
  interest_rate NUMERIC NOT NULL,  -- Stored as basis points (e.g., 500 = 5%)
  duration_days INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'REPAID', 'DEFAULTED', 'LIQUIDATED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  funded_at TIMESTAMP WITH TIME ZONE,
  repaid_at TIMESTAMP WITH TIME ZONE
);

-- Supply Chain Tracking Table
CREATE TABLE IF NOT EXISTS supply_chain_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_id BIGINT NOT NULL REFERENCES farmlands(token_id),
  stage TEXT NOT NULL CHECK (stage IN ('PRODUCTION', 'PROCESSING', 'DISTRIBUTION', 'COMPLETED')),
  transaction_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_farmlands_owner ON farmlands(owner_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_seller ON marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_loans_borrower ON loans(borrower_id);
CREATE INDEX IF NOT EXISTS idx_loans_lender ON loans(lender_id);
CREATE INDEX IF NOT EXISTS idx_supply_chain_token ON supply_chain_events(token_id);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create update triggers
CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_farmlands_timestamp
BEFORE UPDATE ON farmlands
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_marketplace_timestamp
BEFORE UPDATE ON marketplace_listings
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmlands ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE supply_chain_events ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Farmlands table policies
CREATE POLICY "Anyone can view verified farmlands" ON farmlands
  FOR SELECT USING (is_verified = TRUE);

CREATE POLICY "Owners can view their farmlands" ON farmlands
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Owners can update their farmlands" ON farmlands
  FOR UPDATE USING (owner_id = auth.uid());

-- Marketplace listings policies
CREATE POLICY "Anyone can view active listings" ON marketplace_listings
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Sellers can view their listings" ON marketplace_listings
  FOR SELECT USING (seller_id = auth.uid());

CREATE POLICY "Sellers can update their listings" ON marketplace_listings
  FOR UPDATE USING (seller_id = auth.uid());

-- Loans policies
CREATE POLICY "Borrowers can view their loans" ON loans
  FOR SELECT USING (borrower_id = auth.uid());

CREATE POLICY "Lenders can view loans they funded" ON loans
  FOR SELECT USING (lender_id = auth.uid());

-- Supply chain events policies
CREATE POLICY "Anyone can view supply chain events" ON supply_chain_events
  FOR SELECT USING (TRUE); 