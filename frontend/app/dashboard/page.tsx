'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getWalletAddress } from '@/lib/blockchain';
import { getUserByWallet, getFarmlandsByOwner, getListingsBySeller, getLoansByBorrower, User, FarmlandRecord, MarketplaceListing, Loan } from '@/lib/supabase';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [farmlands, setFarmlands] = useState<FarmlandRecord[]>([]);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [activeTab, setActiveTab] = useState('assets');

  // Fetch user data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get wallet address
        const address = await getWalletAddress();
        if (!address) {
          setLoading(false);
          return;
        }

        // Get user data
        const userData = await getUserByWallet(address);
        if (userData) {
          setUser(userData);
          
          // Get user's farmlands
          const farmlandsData = await getFarmlandsByOwner(userData.id);
          setFarmlands(farmlandsData);
          
          // Get user's marketplace listings
          const listingsData = await getListingsBySeller(userData.id);
          setListings(listingsData);
          
          // Get user's loans
          const loansData = await getLoansByBorrower(userData.id);
          setLoans(loansData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle wallet connection
  const connectWallet = async () => {
    try {
      const address = await getWalletAddress();
      if (address) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-2xl font-semibold">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <h1 className="text-3xl font-bold mb-6">Welcome to MakmurTani Dashboard</h1>
          <p className="text-xl mb-8">Connect your wallet to access your assets, listings, and loans</p>
          <button
            onClick={connectWallet}
            className="bg-green-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* User Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Account Info</h2>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div>
            <p><span className="font-medium">Wallet:</span> {user.wallet_address.substring(0, 6)}...{user.wallet_address.substring(user.wallet_address.length - 4)}</p>
            {user.full_name && <p><span className="font-medium">Name:</span> {user.full_name}</p>}
            <p><span className="font-medium">Status:</span> {user.is_verified ? 'Verified' : 'Unverified'}</p>
          </div>
          <div className="md:ml-auto">
            <button className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium hover:bg-green-200 transition-colors">
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-3 px-6 font-medium ${activeTab === 'assets' ? 'text-green-800 border-b-2 border-green-800' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('assets')}
        >
          My Assets
        </button>
        <button
          className={`py-3 px-6 font-medium ${activeTab === 'listings' ? 'text-green-800 border-b-2 border-green-800' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('listings')}
        >
          My Listings
        </button>
        <button
          className={`py-3 px-6 font-medium ${activeTab === 'loans' ? 'text-green-800 border-b-2 border-green-800' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('loans')}
        >
          My Loans
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'assets' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">My Assets</h2>
              <Link href="/farmland/register" className="bg-green-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                Register Farmland
              </Link>
            </div>
            
            {farmlands.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No registered assets yet.</p>
                <p className="mt-2">Register your first farmland or crop to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {farmlands.map((farmland) => (
                  <div key={farmland.id} className="border rounded-lg overflow-hidden">
                    <div className="h-40 bg-gray-200"></div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2">
                        Farmland: {farmland.district}, {farmland.province}
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Area:</span> {farmland.area} m²
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Soil Type:</span> {farmland.soil_type}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Status:</span> {farmland.is_verified ? 'Verified' : 'Pending Verification'}
                      </p>
                      <div className="mt-4 flex justify-end">
                        <Link href={`/farmland/${farmland.id}`} className="text-green-800 hover:underline">
                          View Details →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'listings' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">My Listings</h2>
              <Link href="/marketplace/create" className="bg-green-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                Create Listing
              </Link>
            </div>
            
            {listings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No active listings.</p>
                <p className="mt-2">List one of your assets on the marketplace to start selling.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Listed On</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {listings.map((listing) => (
                      <tr key={listing.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{listing.token_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{listing.price}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${listing.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {listing.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(listing.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link href={`/marketplace/listing/${listing.id}`} className="text-green-800 hover:underline">
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeTab === 'loans' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">My Loans</h2>
              <Link href="/lending/apply" className="bg-green-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                Apply for Loan
              </Link>
            </div>
            
            {loans.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No active loans.</p>
                <p className="mt-2">Use your verified assets as collateral to apply for a loan.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loans.map((loan) => (
                      <tr key={loan.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{loan.loan_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{loan.principal_amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            loan.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                            loan.status === 'REPAID' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {loan.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{loan.duration_days} days</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link href={`/lending/loan/${loan.id}`} className="text-green-800 hover:underline">
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
 