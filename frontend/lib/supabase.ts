import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a Supabase client for server-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type User = {
  id: string;
  wallet_address: string;
  full_name?: string;
  created_at: string;
  is_verified: boolean;
  roles?: string[];
};

export type FarmlandRecord = {
  id: string;
  certificate_id: string;
  token_id: number;
  owner_id: string;
  area: number;
  latitude: string;
  longitude: string;
  province: string;
  district: string;
  sub_district: string;
  postal_code: string;
  soil_type: string;
  crops: string[];
  is_verified: boolean;
  verifier_id?: string;
  ipfs_uri: string;
  created_at: string;
  updated_at: string;
};

export type MarketplaceListing = {
  id: string;
  listing_id: number;
  token_id: number;
  seller_id: string;
  price: string;
  payment_token: string;
  is_active: boolean;
  created_at: string;
};

export type Loan = {
  id: string;
  loan_id: number;
  borrower_id: string;
  lender_id?: string;
  token_id: number;
  principal_amount: string;
  interest_rate: number;
  duration_days: number;
  status: string;
  created_at: string;
  funded_at?: string;
  repaid_at?: string;
};

// Database operations
export const getUserByWallet = async (walletAddress: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('wallet_address', walletAddress.toLowerCase())
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return data as User;
};

export const createUser = async (walletAddress: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .insert([
      { wallet_address: walletAddress.toLowerCase() }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    return null;
  }

  return data as User;
};

export const getFarmlandsByOwner = async (ownerId: string): Promise<FarmlandRecord[]> => {
  const { data, error } = await supabase
    .from('farmlands')
    .select('*')
    .eq('owner_id', ownerId);

  if (error) {
    console.error('Error fetching farmlands:', error);
    return [];
  }

  return data as FarmlandRecord[];
};

export const createFarmlandRecord = async (farmland: Omit<FarmlandRecord, 'id' | 'created_at' | 'updated_at'>): Promise<FarmlandRecord | null> => {
  const { data, error } = await supabase
    .from('farmlands')
    .insert([farmland])
    .select()
    .single();

  if (error) {
    console.error('Error creating farmland record:', error);
    return null;
  }

  return data as FarmlandRecord;
};

export const getMarketplaceListings = async (activeOnly: boolean = true): Promise<MarketplaceListing[]> => {
  let query = supabase
    .from('marketplace_listings')
    .select('*');
    
  if (activeOnly) {
    query = query.eq('is_active', true);
  }
  
  const { data, error } = await query;

  if (error) {
    console.error('Error fetching marketplace listings:', error);
    return [];
  }

  return data as MarketplaceListing[];
};

export const getListingsBySeller = async (sellerId: string): Promise<MarketplaceListing[]> => {
  const { data, error } = await supabase
    .from('marketplace_listings')
    .select('*')
    .eq('seller_id', sellerId);

  if (error) {
    console.error('Error fetching seller listings:', error);
    return [];
  }

  return data as MarketplaceListing[];
};

export const getLoansByBorrower = async (borrowerId: string): Promise<Loan[]> => {
  const { data, error } = await supabase
    .from('loans')
    .select('*')
    .eq('borrower_id', borrowerId);

  if (error) {
    console.error('Error fetching borrower loans:', error);
    return [];
  }

  return data as Loan[];
};

export const getLoansByLender = async (lenderId: string): Promise<Loan[]> => {
  const { data, error } = await supabase
    .from('loans')
    .select('*')
    .eq('lender_id', lenderId);

  if (error) {
    console.error('Error fetching lender loans:', error);
    return [];
  }

  return data as Loan[];
};

export const getActiveLoanOffers = async (): Promise<Loan[]> => {
  const { data, error } = await supabase
    .from('loans')
    .select('*')
    .eq('status', 'ACTIVE')
    .is('lender_id', null);

  if (error) {
    console.error('Error fetching active loan offers:', error);
    return [];
  }

  return data as Loan[];
}; 