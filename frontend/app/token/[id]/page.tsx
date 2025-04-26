'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  MapPin,
  TrendingUp,
  Calendar,
  Users,
  FileText,
  BarChart3,
  ExternalLink,
  Clock,
  Share2,
  ChevronLeft,
  Leaf,
  Check,
  Info,
  AlertCircle
} from 'lucide-react';

// Define the TokenAsset type
interface TokenAsset {
  id: string;
  type: 'LAND' | 'CROP' | 'EQUIPMENT';
  name: string;
  symbol: string;
  description: string;
  location: string;
  imageUrl: string;
  price: number;
  supply: number;
  soldPercentage: number;
  creator: {
    name: string;
    rating: number;
    imageUrl: string;
    address: string;
  };
  tags: string[];
  yield?: number;
  area?: number;
  harvestDate?: string;
  contractAddress: string;
  tokenStandard: string;
  history: {
    date: string;
    event: string;
    txHash: string;
  }[];
  details: {
    [key: string]: string;
  };
  documents: {
    title: string;
    url: string;
    type: string;
  }[];
  gallery: string[];
}

// Mock token data - in a real app, this would be fetched from the backend
const demoToken: TokenAsset = {
  id: '1',
  type: 'LAND',
  name: 'Paddy Field in Ubud',
  symbol: 'UBUD',
  description: 'This fertile paddy field is located in Ubud, Bali, featuring a comprehensive irrigation system and organic certification. The land has been cultivated for rice production for over 30 years and has consistently demonstrated high yields. The property includes access to natural water sources and is part of a traditional Balinese Subak irrigation system.',
  location: 'Ubud, Bali',
  imageUrl: '/farms/paddy_field.webp',
  price: 12000,
  supply: 1000,
  soldPercentage: 67,
  creator: {
    name: 'Wayan Dharma',
    rating: 4.8,
    imageUrl: '/farmers/farmer1.jpg',
    address: '0x3D9d0caA5F8e7282EFB219f5F11AdE5E8b0D2768'
  },
  tags: ['Organic', 'Paddy', 'Irrigation', 'Sustainable'],
  yield: 7.5,
  area: 2.5,
  contractAddress: '0x8f5Ba0C8f90Dd3E270d2C56F15D46fD7FaCF1cAd',
  tokenStandard: 'ERC-1155',
  history: [
    { date: '2023-07-15', event: 'Asset Tokenized', txHash: '0x1a2b3c4d5e6f' },
    { date: '2023-07-16', event: 'First Investment', txHash: '0xabcdef1234' },
    { date: '2023-07-20', event: 'Verification Complete', txHash: '0x5678abcdef' }
  ],
  details: {
    'Soil Type': 'Alluvial',
    'Irrigation': 'Subak System',
    'Certification': 'Organic (2022)',
    'Ownership Rights': 'Full Hereditary Rights',
    'Annual Production': '5.2 tons/hectare',
    'Land Registration': 'SKPT #12345-B/2020'
  },
  documents: [
    { title: 'Land Certificate', url: '/documents/land-certificate.pdf', type: 'pdf' },
    { title: 'Organic Certification', url: '/documents/organic-cert.pdf', type: 'pdf' },
    { title: 'Yield History', url: '/documents/yield-history.xlsx', type: 'excel' }
  ],
  gallery: [
    '/farms/paddy_field_2.jpg',
    '/farms/paddy_field_3.jpeg',
    '/farms/paddy_field_4.jpeg',
  ]
};

export default function TokenDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tokenId = params.id as string;

  const [token, setToken] = useState<TokenAsset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [investmentAmount, setInvestmentAmount] = useState(1);
  const [totalCost, setTotalCost] = useState(0);
  const [isInvesting, setIsInvesting] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  // Fetch token data
  useEffect(() => {
    // Simulate API call
    const fetchToken = async () => {
      // In a real app, this would be an API call like: 
      // const response = await fetch(`/api/tokens/${tokenId}`);
      // const data = await response.json();

      // Using demo data for now
      setTimeout(() => {
        setToken(demoToken);
        setSelectedImage(demoToken.imageUrl);
        setIsLoading(false);
      }, 800);
    };

    fetchToken();
  }, [tokenId]);

  // Calculate total cost when investment amount changes
  useEffect(() => {
    if (token) {
      setTotalCost(investmentAmount * token.price);
    }
  }, [investmentAmount, token]);

  // Handle investment submission
  const handleInvest = async () => {
    setIsInvesting(true);

    // Simulate blockchain transaction
    setTimeout(() => {
      setIsInvesting(false);
      router.push('/investment/success?amount=' + investmentAmount + '&tokenId=' + tokenId);
    }, 2000);
  };

  // Handle investment amount changes
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= (token ? token.supply - (token.supply * token.soldPercentage / 100) : 100)) {
      setInvestmentAmount(value);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-4">Token Not Found</h1>
        <p className="mb-6">The token you are looking for does not exist or has been removed.</p>
        <Link href="/marketplace" className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const availableTokens = token.supply - (token.supply * token.soldPercentage / 100);

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Back button */}
      <div className="container mx-auto px-4 py-4">
        <Link href="/marketplace" className="inline-flex items-center text-gray-600 hover:text-gray-800">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Marketplace
        </Link>
      </div>

      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Hero section */}
          <div className="md:flex">
            {/* Left: Image Gallery */}
            <div className="md:w-1/2">
              <div className="relative h-64 md:h-96 w-full">
                <Image
                  src={selectedImage}
                  alt={token.name}
                  className="object-cover"
                  fill
                  priority
                />
                <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-medium">
                  {token.type}
                </div>
              </div>

              {/* Thumbnail gallery */}
              <div className="p-4 flex space-x-2 overflow-x-auto">
                <div
                  className={`relative h-16 w-16 rounded-md overflow-hidden cursor-pointer border-2 ${selectedImage === token.imageUrl ? 'border-green-600' : 'border-transparent'}`}
                  onClick={() => setSelectedImage(token.imageUrl)}
                >
                  <Image src={token.imageUrl} alt="Main" fill className="object-cover" />
                </div>
                {token.gallery.map((img, index) => (
                  <div
                    key={index}
                    className={`relative h-16 w-16 rounded-md overflow-hidden cursor-pointer border-2 ${selectedImage === img ? 'border-green-600' : 'border-transparent'}`}
                    onClick={() => setSelectedImage(img)}
                  >
                    <Image src={img} alt={`Gallery ${index + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Token Details */}
            <div className="md:w-1/2 p-6">
              <div className="flex items-center mb-2">
                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded mr-2">
                  ${token.symbol}
                </span>
                <span className="text-sm text-gray-600">
                  Token ID: {token.id}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold mb-2">{token.name}</h1>

              <div className="flex items-center text-sm text-gray-600 mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{token.location}</span>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {token.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Token Price</div>
                  <div className="font-semibold text-green-700">
                    {new Intl.NumberFormat('id-ID').format(token.price)} IDR
                  </div>
                </div>

                {token.yield && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-500">Est. Annual Yield</div>
                    <div className="font-semibold text-green-700 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {token.yield}%
                    </div>
                  </div>
                )}

                {token.area && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-500">Land Area</div>
                    <div className="font-semibold text-gray-800">
                      {token.area} hectares
                    </div>
                  </div>
                )}

                {token.harvestDate && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-500">Harvest Date</div>
                    <div className="font-semibold text-gray-800 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {token.harvestDate}
                    </div>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{token.soldPercentage}% Sold</span>
                  <span>{availableTokens} of {token.supply} Available</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-600 h-2.5 rounded-full"
                    style={{ width: `${token.soldPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Creator info */}
              <div className="flex items-center p-3 bg-gray-50 rounded-lg mb-6">
                <div className="relative h-12 w-12 rounded-full overflow-hidden mr-3">
                  <Image
                    src={token.creator.imageUrl}
                    alt={token.creator.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-medium">Tokenized by {token.creator.name}</div>
                  <div className="text-sm text-gray-600 flex items-center">
                    <span className="flex items-center mr-2">
                      ⭐ {token.creator.rating}/5.0
                    </span>
                    <span className="text-xs text-gray-500 truncate max-w-[150px]">
                      {token.creator.address}
                    </span>
                  </div>
                </div>
              </div>

              {/* Investment form */}
              <div className="border border-gray-200 rounded-lg p-4 mb-4">
                <h3 className="font-medium mb-3">Invest in this asset</h3>

                <div className="mb-4">
                  <label htmlFor="amount" className="block text-sm text-gray-600 mb-1">
                    Number of tokens to purchase:
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      id="amount"
                      min="1"
                      max={availableTokens}
                      value={investmentAmount}
                      onChange={handleAmountChange}
                      className="border border-gray-300 rounded-lg py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Max: {availableTokens} tokens
                  </p>
                </div>

                <div className="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Total cost:</span>
                  <span className="font-bold text-green-700">
                    {new Intl.NumberFormat('id-ID').format(totalCost)} IDR
                  </span>
                </div>

                <button
                  onClick={handleInvest}
                  disabled={isInvesting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isInvesting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    'Invest Now'
                  )}
                </button>
              </div>

              <div className="text-sm text-gray-500 flex items-start">
                <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <p>
                  By investing, you agree to our terms and conditions. All investments involve risk, including the possible loss of principal.
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-gray-200">
            <div className="flex overflow-x-auto">
              <button
                className={`px-6 py-3 font-medium text-sm border-b-2 ${activeTab === 'overview' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-600 hover:text-gray-800'}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`px-6 py-3 font-medium text-sm border-b-2 ${activeTab === 'details' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-600 hover:text-gray-800'}`}
                onClick={() => setActiveTab('details')}
              >
                Asset Details
              </button>
              <button
                className={`px-6 py-3 font-medium text-sm border-b-2 ${activeTab === 'documents' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-600 hover:text-gray-800'}`}
                onClick={() => setActiveTab('documents')}
              >
                Documents
              </button>
              <button
                className={`px-6 py-3 font-medium text-sm border-b-2 ${activeTab === 'history' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-600 hover:text-gray-800'}`}
                onClick={() => setActiveTab('history')}
              >
                Transaction History
              </button>
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div>
                  <h2 className="text-xl font-bold mb-4">About This Asset</h2>
                  <p className="text-gray-700 mb-6">
                    {token.description}
                  </p>

                  <h3 className="text-lg font-semibold mb-2">Tokenization Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-start">
                      <FileText className="h-5 w-5 mr-2 text-gray-500" />
                      <div>
                        <div className="font-medium">Contract Address</div>
                        <div className="text-sm text-gray-600 break-words">
                          {token.contractAddress}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FileText className="h-5 w-5 mr-2 text-gray-500" />
                      <div>
                        <div className="font-medium">Token Standard</div>
                        <div className="text-sm text-gray-600">
                          {token.tokenStandard}
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mb-2">Investment Highlights</h3>
                  <ul className="list-none space-y-3 mb-6">
                    <li className="flex items-start">
                      <div className="bg-green-100 p-1 rounded-full text-green-600 mr-2">
                        <Check className="h-4 w-4" />
                      </div>
                      <span>Verified land ownership with legal documentation</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-green-100 p-1 rounded-full text-green-600 mr-2">
                        <Check className="h-4 w-4" />
                      </div>
                      <span>Organic certification provides premium market access</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-green-100 p-1 rounded-full text-green-600 mr-2">
                        <Check className="h-4 w-4" />
                      </div>
                      <span>Established irrigation system reduces climate risk</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-green-100 p-1 rounded-full text-green-600 mr-2">
                        <Check className="h-4 w-4" />
                      </div>
                      <span>Consistent historical yields of over 5 tons per hectare</span>
                    </li>
                  </ul>

                  <div className="flex justify-between mt-4">
                    <Link
                      href={`https://explorer.lisk.com/tx/${token.history[0].txHash}`}
                      target="_blank"
                      className="text-green-600 hover:text-green-700 flex items-center text-sm"
                    >
                      View on Explorer <ExternalLink className="h-3 w-3 ml-1" />
                    </Link>
                    <button
                      className="text-green-600 hover:text-green-700 flex items-center text-sm"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Link copied to clipboard!');
                      }}
                    >
                      Share <Share2 className="h-3 w-3 ml-1" />
                    </button>
                  </div>
                </div>
              )}

              {/* Details Tab */}
              {activeTab === 'details' && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Asset Specifications</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {Object.entries(token.details).map(([key, value]) => (
                      <div key={key} className="border-b border-gray-100 pb-3">
                        <div className="text-sm text-gray-500">{key}</div>
                        <div className="font-medium">{value}</div>
                      </div>
                    ))}
                  </div>

                  {token.type === 'LAND' && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">Location Map</h3>
                      <div className="bg-gray-100 h-80 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500">Interactive map would be embedded here</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Legal Documents & Certifications</h2>

                  <div className="space-y-4 mb-6">
                    {token.documents.map((doc, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-gray-100 p-2 rounded-lg mr-3">
                            <FileText className="h-6 w-6 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium">{doc.title}</div>
                            <div className="text-xs text-gray-500 uppercase">{doc.type}</div>
                          </div>
                        </div>
                        <Link
                          href={doc.url}
                          target="_blank"
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm py-2 px-4 rounded-lg"
                        >
                          View
                        </Link>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm flex items-start">
                    <Info className="h-5 w-5 mr-2 flex-shrink-0" />
                    <p>
                      All documents have been verified by our legal team and stored on IPFS for immutable record-keeping.
                      Each document is linked to the token smart contract for maximum transparency.
                    </p>
                  </div>
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Transaction History</h2>

                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                    {/* Timeline events */}
                    <div className="space-y-6">
                      {token.history.map((event, index) => (
                        <div key={index} className="flex items-start">
                          <div className="bg-green-100 rounded-full p-1.5 z-10 mr-4">
                            <Clock className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="bg-white border border-gray-200 rounded-lg p-4 flex-grow shadow-sm">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{event.event}</div>
                                <div className="text-sm text-gray-500">{event.date}</div>
                              </div>
                              <Link
                                href={`https://explorer.lisk.com/tx/${event.txHash}`}
                                target="_blank"
                                className="text-xs text-green-600 hover:text-green-700 flex items-center"
                              >
                                {event.txHash.substring(0, 6)}...{event.txHash.substring(event.txHash.length - 4)}
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Similar Assets */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Leaf className="mr-2 h-5 w-5 text-green-600" />
            Similar Assets
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Placeholder cards for similar assets */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="relative h-48 w-full">
                  <div className="absolute top-0 left-0 bg-green-600 text-white px-3 py-1 rounded-br-lg z-10">
                    LAND
                  </div>
                  <div className="bg-gray-200 h-full w-full"></div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold">Similar Farmland {i}</h3>
                  <div className="flex items-center text-sm text-gray-600 my-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>Nearby Location</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-semibold text-green-700">
                      {new Intl.NumberFormat('id-ID').format(10000 + i * 1000)} IDR
                    </div>
                    <div className="text-sm text-gray-600">Yield: {6 + i}%</div>
                  </div>
                  <Link
                    href={`/token/${i + 10}`}
                    className="block bg-green-600 hover:bg-green-700 text-white text-center py-2 px-3 rounded-lg transition-colors mt-3"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 