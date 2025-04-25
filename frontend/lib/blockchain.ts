import { ethers } from 'ethers';

// Contract ABIs
import RWAFarmersTokenABI from '../contracts/abis/RWAFarmersToken.json';
import FarmlandRegistryABI from '../contracts/abis/IndonesianFarmlandRegistry.json';
import MarketplaceABI from '../contracts/abis/MakmurTaniMarketplace.json';
import LendingABI from '../contracts/abis/MakmurTaniLending.json';

// Contract addresses from environment variables
const RWA_FARMERS_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_RWAFARMERSTOKEN_ADDRESS || '';
const FARMLAND_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_FARMLANDREGISTRY_ADDRESS || '';
const MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || '';
const LENDING_ADDRESS = process.env.NEXT_PUBLIC_LENDING_ADDRESS || '';
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc-testnet.lisk.com';

// Initialize provider
let provider: ethers.JsonRpcProvider;
let signer: ethers.Signer | null = null;

// Asset types enum
export enum AssetType {
  Farmland,
  Crop,
  Equipment
}

// Supply chain stage enum
export enum SupplyChainStage {
  Production,
  Processing,
  Distribution,
  Completed
}

// Loan status enum
export enum LoanStatus {
  Active,
  Repaid,
  Defaulted,
  Liquidated
}

// Initialize provider
const getProvider = () => {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(RPC_URL);
  }
  return provider;
};

// Initialize signer
const getSigner = async (): Promise<ethers.Signer | null> => {
  if (typeof window === 'undefined') return null;
  
  try {
    if (window.ethereum) {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
      return signer;
    }
  } catch (error) {
    console.error('Error getting signer:', error);
  }
  
  return null;
};

// Get contract instances
const getRWAFarmersTokenContract = async (useSigner = false) => {
  const provider = getProvider();
  const contractSigner = useSigner ? await getSigner() : provider;
  
  if (!contractSigner) return null;
  
  return new ethers.Contract(
    RWA_FARMERS_TOKEN_ADDRESS,
    RWAFarmersTokenABI,
    contractSigner
  );
};

const getFarmlandRegistryContract = async (useSigner = false) => {
  const provider = getProvider();
  const contractSigner = useSigner ? await getSigner() : provider;
  
  if (!contractSigner) return null;
  
  return new ethers.Contract(
    FARMLAND_REGISTRY_ADDRESS,
    FarmlandRegistryABI,
    contractSigner
  );
};

const getMarketplaceContract = async (useSigner = false) => {
  const provider = getProvider();
  const contractSigner = useSigner ? await getSigner() : provider;
  
  if (!contractSigner) return null;
  
  return new ethers.Contract(
    MARKETPLACE_ADDRESS,
    MarketplaceABI,
    contractSigner
  );
};

const getLendingContract = async (useSigner = false) => {
  const provider = getProvider();
  const contractSigner = useSigner ? await getSigner() : provider;
  
  if (!contractSigner) return null;
  
  return new ethers.Contract(
    LENDING_ADDRESS,
    LendingABI,
    contractSigner
  );
};

// Utility functions for contract interactions
export const getWalletAddress = async (): Promise<string | null> => {
  const signer = await getSigner();
  if (!signer) return null;
  
  return await signer.getAddress();
};

// RWAFarmersToken functions
export const createAsset = async (
  investmentAmount: string,
  investmentToken: string,
  uri: string,
  location: string,
  area: number,
  assetName: string,
  assetType: AssetType,
  yieldPercentage: number,
  duration: number
) => {
  try {
    const contract = await getRWAFarmersTokenContract(true);
    if (!contract) throw new Error('Contract not initialized');
    
    const tx = await contract.createAsset(
      investmentAmount,
      investmentToken,
      uri,
      location,
      area,
      assetName,
      assetType,
      yieldPercentage,
      duration
    );
    
    return await tx.wait();
  } catch (error) {
    console.error('Error creating asset:', error);
    throw error;
  }
};

export const getAssetParams = async (tokenId: number) => {
  try {
    const contract = await getRWAFarmersTokenContract();
    if (!contract) throw new Error('Contract not initialized');
    
    return await contract.getParams(tokenId);
  } catch (error) {
    console.error('Error getting asset params:', error);
    throw error;
  }
};

export const makeInvestment = async (tokenId: number) => {
  try {
    const contract = await getRWAFarmersTokenContract(true);
    if (!contract) throw new Error('Contract not initialized');
    
    const tx = await contract.makeInvestment(tokenId);
    return await tx.wait();
  } catch (error) {
    console.error('Error making investment:', error);
    throw error;
  }
};

// Farmland Registry functions
export const registerFarmland = async (
  landCertificateId: string,
  area: number,
  latitude: string,
  longitude: string,
  province: string,
  district: string,
  subDistrict: string,
  postalCode: string,
  soilType: string,
  crops: string[],
  tokenURI: string
) => {
  try {
    const contract = await getFarmlandRegistryContract(true);
    if (!contract) throw new Error('Contract not initialized');
    
    const tx = await contract.registerFarmland(
      landCertificateId,
      area,
      latitude,
      longitude,
      province,
      district,
      subDistrict,
      postalCode,
      soilType,
      crops,
      tokenURI
    );
    
    return await tx.wait();
  } catch (error) {
    console.error('Error registering farmland:', error);
    throw error;
  }
};

export const getFarmlandDetails = async (farmlandId: number) => {
  try {
    const contract = await getFarmlandRegistryContract();
    if (!contract) throw new Error('Contract not initialized');
    
    return await contract.getFarmlandDetails(farmlandId);
  } catch (error) {
    console.error('Error getting farmland details:', error);
    throw error;
  }
};

export const getFarmlandsByOwner = async (owner: string) => {
  try {
    const contract = await getFarmlandRegistryContract();
    if (!contract) throw new Error('Contract not initialized');
    
    return await contract.getFarmlandsByOwner(owner);
  } catch (error) {
    console.error('Error getting farmlands by owner:', error);
    throw error;
  }
};

// Marketplace functions
export const createListing = async (
  tokenId: number,
  paymentToken: string,
  price: string
) => {
  try {
    const contract = await getMarketplaceContract(true);
    if (!contract) throw new Error('Contract not initialized');
    
    const tx = await contract.createListing(tokenId, paymentToken, price);
    return await tx.wait();
  } catch (error) {
    console.error('Error creating listing:', error);
    throw error;
  }
};

export const getActiveListings = async () => {
  try {
    const contract = await getMarketplaceContract();
    if (!contract) throw new Error('Contract not initialized');
    
    return await contract.getActiveListings();
  } catch (error) {
    console.error('Error getting active listings:', error);
    throw error;
  }
};

export const purchaseListing = async (listingId: number, value: string = '0') => {
  try {
    const contract = await getMarketplaceContract(true);
    if (!contract) throw new Error('Contract not initialized');
    
    const tx = await contract.purchaseListing(listingId, { value });
    return await tx.wait();
  } catch (error) {
    console.error('Error purchasing listing:', error);
    throw error;
  }
};

// Lending functions
export const createLoan = async (
  tokenId: number,
  loanToken: string,
  principalAmount: string,
  durationDays: number
) => {
  try {
    const contract = await getLendingContract(true);
    if (!contract) throw new Error('Contract not initialized');
    
    const tx = await contract.createLoan(
      tokenId,
      loanToken,
      principalAmount,
      durationDays
    );
    
    return await tx.wait();
  } catch (error) {
    console.error('Error creating loan:', error);
    throw error;
  }
};

export const fundLoan = async (loanId: number) => {
  try {
    const contract = await getLendingContract(true);
    if (!contract) throw new Error('Contract not initialized');
    
    const tx = await contract.fundLoan(loanId);
    return await tx.wait();
  } catch (error) {
    console.error('Error funding loan:', error);
    throw error;
  }
};

export const repayLoan = async (loanId: number, amount: string) => {
  try {
    const contract = await getLendingContract(true);
    if (!contract) throw new Error('Contract not initialized');
    
    const tx = await contract.repayLoan(loanId, amount);
    return await tx.wait();
  } catch (error) {
    console.error('Error repaying loan:', error);
    throw error;
  }
};

export const getBorrowerLoans = async (borrower: string) => {
  try {
    const contract = await getLendingContract();
    if (!contract) throw new Error('Contract not initialized');
    
    return await contract.getBorrowerLoans(borrower);
  } catch (error) {
    console.error('Error getting borrower loans:', error);
    throw error;
  }
};

export const getLenderLoans = async (lender: string) => {
  try {
    const contract = await getLendingContract();
    if (!contract) throw new Error('Contract not initialized');
    
    return await contract.getLenderLoans(lender);
  } catch (error) {
    console.error('Error getting lender loans:', error);
    throw error;
  }
}; 