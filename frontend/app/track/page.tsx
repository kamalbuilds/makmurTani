'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Search, CheckCircle } from 'lucide-react';

interface SupplyChainEntry {
  stage: string;
  location: string;
  timestamp: string;
  verifier: string;
  transactionHash: string;
  details: string;
  verified: boolean;
  image?: string;
}

interface Product {
  id: string;
  name: string;
  origin: string;
  farmer: string;
  crop: string;
  harvest: string;
  image: string;
  supplyChain: SupplyChainEntry[];
}

export default function TrackPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setNotFound(false);
    
    // Simulate API call with timeout
    setTimeout(() => {
      if (searchQuery === '12345' || searchQuery.toLowerCase() === 'bt78901234') {
        setProduct({
          id: 'BT78901234',
          name: 'Premium Arabica Coffee Beans',
          origin: 'Gayo Highlands, Aceh',
          farmer: 'Cooperative Gayo Megah Berseri',
          crop: 'Coffee - Arabica',
          harvest: 'June 2025',
          image: 'https://placehold.co/600x400/1B5E20/FFFFFF.png?text=Coffee+Beans',
          supplyChain: [
            {
              stage: 'Harvesting',
              location: 'Gayo Highlands, Aceh',
              timestamp: 'June 15, 2025 08:25 AM',
              verifier: 'Pak Ahmad (Local Verifier)',
              transactionHash: '0x8f7d3c98a7b5f3c9a4b5e6f1g2h3i4j5k6l7m8n9o',
              details: 'Coffee cherries harvested at optimal ripeness',
              verified: true,
              image: 'https://placehold.co/600x400/1B5E20/FFFFFF.png?text=Harvesting'
            },
            {
              stage: 'Processing',
              location: 'Gayo Coffee Processing Center',
              timestamp: 'June 18, 2025 14:30 PM',
              verifier: 'Ibu Sari (Quality Controller)',
              transactionHash: '0x7e6d5c4b3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d',
              details: 'Wet-processed using clean water, fermented for 36 hours',
              verified: true,
              image: 'https://placehold.co/600x400/1B5E20/FFFFFF.png?text=Processing'
            },
            {
              stage: 'Drying',
              location: 'Gayo Coffee Processing Center',
              timestamp: 'June 25, 2025 11:15 AM',
              verifier: 'Pak Budi (Quality Controller)',
              transactionHash: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
              details: 'Sun-dried on raised beds for 14 days, reaching optimal moisture content of 11.5%',
              verified: true,
              image: 'https://placehold.co/600x400/1B5E20/FFFFFF.png?text=Drying'
            },
            {
              stage: 'Packaging',
              location: 'Gayo Coffee Collective Facility',
              timestamp: 'July 10, 2025 09:45 AM',
              verifier: 'Ibu Ratna (Packaging Supervisor)',
              transactionHash: '0x9s8r7q6p5o4n3m2l1k0j9i8h7g6f5e4d3c2b1a0',
              details: 'Packed in GrainPro bags to preserve freshness, batch number GC-2025-06-123',
              verified: true,
              image: 'https://placehold.co/600x400/1B5E20/FFFFFF.png?text=Packaging'
            },
            {
              stage: 'Distribution',
              location: 'Medan Export Terminal',
              timestamp: 'July 15, 2025 16:20 PM',
              verifier: 'PT Global Logistics (Shipping Provider)',
              transactionHash: '0x2s3d4f5g6h7j8k9l0p1o2i3u4y5t6r7e8w9q0z1x',
              details: 'Shipped via container MSCU7654321, estimated arrival in Jakarta on July 20, 2025',
              verified: true,
              image: 'https://placehold.co/600x400/1B5E20/FFFFFF.png?text=Distribution'
            },
            {
              stage: 'Retail',
              location: 'Jakarta Premium Coffee Market',
              timestamp: 'July 25, 2025 10:30 AM',
              verifier: 'Awaiting verification',
              transactionHash: 'Pending',
              details: 'Batch prepared for retail distribution',
              verified: false
            }
          ]
        });
      } else {
        setProduct(null);
        setNotFound(true);
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Track &amp; Trace</h1>
        <p className="text-gray-600">
          Verify the authenticity and journey of agricultural products from farm to table. 
          Enter a product ID or scan a QR code to see the complete supply chain history.
        </p>
      </div>

      {/* Search Form */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="flex">
          <input
            type="text"
            placeholder="Enter Product ID (try '12345' or 'BT78901234')"
            className="flex-1 p-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-r-md flex items-center justify-center transition-colors"
            onClick={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <Search className="h-5 w-5" />
            )}
          </button>
        </div>
        {notFound && (
          <p className="text-red-500 mt-2">
            Product not found. Please check the ID and try again.
          </p>
        )}
      </div>

      {/* Product Details */}
      {product && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-4xl mx-auto mb-10">
          <div className="md:flex">
            <div className="md:w-1/3 relative h-60 md:h-auto">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="p-6 md:w-2/3">
              <div className="flex items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 mr-2">{product.name}</h2>
                <span className="bg-green-100 text-green-800 text-xs font-medium py-1 px-2 rounded-full">Verified</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Product ID</p>
                  <p className="font-medium">{product.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Origin</p>
                  <p className="font-medium">{product.origin}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Farmer</p>
                  <p className="font-medium">{product.farmer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Crop Type</p>
                  <p className="font-medium">{product.crop}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Harvest Date</p>
                  <p className="font-medium">{product.harvest}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Supply Chain Timeline */}
      {product && (
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Supply Chain Journey</h3>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-16 top-0 bottom-0 w-1 bg-green-200"></div>
            
            {/* Timeline entries */}
            <div className="space-y-8">
              {product.supplyChain.map((entry, index) => (
                <div key={index} className="relative flex items-start">
                  {/* Timeline dot */}
                  <div className="absolute left-16 -translate-x-1/2 w-6 h-6 rounded-full bg-white border-4 border-green-500 z-10"></div>
                  
                  {/* Timeline content */}
                  <div className="ml-24 bg-white rounded-lg shadow-md overflow-hidden flex-1">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-gray-900">{entry.stage}</h4>
                        <p className="text-sm text-gray-500">{entry.location} - {entry.timestamp}</p>
                      </div>
                      {entry.verified ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-5 w-5 mr-1" />
                          <span className="text-sm font-medium">Verified</span>
                        </div>
                      ) : (
                        <span className="text-sm text-yellow-600 font-medium">Pending</span>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {entry.image && (
                          <div className="relative h-48">
                            <Image
                              src={entry.image}
                              alt={entry.stage}
                              fill
                              className="object-cover rounded-md"
                              unoptimized
                            />
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-700 mb-3">{entry.details}</p>
                          
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-gray-500">Verified by</p>
                              <p className="text-sm font-medium">{entry.verifier}</p>
                            </div>
                            
                            {entry.verified && (
                              <div>
                                <p className="text-xs text-gray-500">Transaction Hash</p>
                                <p className="text-xs font-mono bg-gray-100 p-1 rounded overflow-x-auto">
                                  {entry.transactionHash}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 