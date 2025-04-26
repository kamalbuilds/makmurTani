'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SearchIcon, Filter, MapPin, TrendingUp, Leaf } from 'lucide-react';

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
  };
  tags: string[];
  yield?: number; // Optional for some asset types
  area?: number; // For land (in hectares)
  harvestDate?: string; // For crops
}

// Demo data for the marketplace
const demoTokens: TokenAsset[] = [
  {
    id: '1',
    type: 'LAND',
    name: 'Paddy Field in Ubud',
    symbol: 'UBUD',
    description: 'Fertile paddy field with irrigation system in Ubud, Bali',
    location: 'Ubud, Bali',
    imageUrl: '/farms/paddy_field.webp',
    price: 12000,
    supply: 1000,
    soldPercentage: 67,
    creator: {
      name: 'Wayan Dharma',
      rating: 4.8,
      imageUrl: '/farmers/farmer1.jpg'
    },
    tags: ['Organic', 'Paddy', 'Irrigation'],
    yield: 7.5,
    area: 2.5
  },
  {
    id: '2',
    type: 'CROP',
    name: 'Coffee Harvest 2023',
    symbol: 'KOPI',
    description: 'Premium Arabica coffee beans from Toraja highlands',
    location: 'Toraja, Sulawesi',
    imageUrl: '/farms/coffee_toraja.webp',
    price: 8500,
    supply: 500,
    soldPercentage: 42,
    creator: {
      name: 'Abdul Rahman',
      rating: 4.6,
      imageUrl: '/farmers/farmer2.jpg'
    },
    tags: ['Arabica', 'Specialty', 'Export Quality'],
    yield: 9.2,
    harvestDate: '2023-08-15'
  },
  {
    id: '3',
    type: 'LAND',
    name: 'Spice Garden',
    symbol: 'SPICE',
    description: 'Traditional spice garden with vanilla, cloves and nutmeg',
    location: 'Ambon, Maluku',
    imageUrl: '/farms/spice_island.webp',
    price: 9500,
    supply: 750,
    soldPercentage: 28,
    creator: {
      name: 'Sarah Wulandari',
      rating: 4.3,
      imageUrl: '/farmers/farmer3.jpg'
    },
    tags: ['Spices', 'Vanilla', 'Cloves'],
    yield: 6.8,
    area: 1.8
  },
  {
    id: '4',
    type: 'CROP',
    name: 'Organic Cocoa',
    symbol: 'CACAO',
    description: 'Sustainably grown cocoa beans from West Papua',
    location: 'Manokwari, Papua',
    imageUrl: '/farms/cocoa.webp',
    price: 7800,
    supply: 800,
    soldPercentage: 51,
    creator: {
      name: 'Yusuf Papare',
      rating: 4.5,
      imageUrl: '/farmers/farmer4.jpg'
    },
    tags: ['Organic', 'Rainforest Alliance', 'Fair Trade'],
    yield: 8.4,
    harvestDate: '2023-09-30'
  },
  {
    id: '5',
    type: 'EQUIPMENT',
    name: 'Community Rice Mill',
    symbol: 'MILL',
    description: 'Modern rice mill serving farming communities in East Java',
    location: 'Malang, East Java',
    imageUrl: '/farms/rice_mill.webp',
    price: 15000,
    supply: 300,
    soldPercentage: 82,
    creator: {
      name: 'Farming Cooperative Malang',
      rating: 4.9,
      imageUrl: '/farmers/farmer5.jpg'
    },
    tags: ['Equipment', 'Milling', 'Community']
  },
  {
    id: '6',
    type: 'LAND',
    name: 'Fruit Orchard',
    symbol: 'FRUIT',
    description: 'Established fruit orchard with durian, mangosteen and rambutan',
    location: 'Bogor, West Java',
    imageUrl: '/farms/orchard.webp',
    price: 11200,
    supply: 650,
    soldPercentage: 39,
    creator: {
      name: 'Bambang Supriyadi',
      rating: 4.4,
      imageUrl: '/farmers/farmer6.jpg'
    },
    tags: ['Fruits', 'Durian', 'Mangosteen'],
    yield: 8.1,
    area: 3.2
  }
];

// Asset type filter options
const assetTypes = [
  { value: 'ALL', label: 'All Assets' },
  { value: 'LAND', label: 'Farmland' },
  { value: 'CROP', label: 'Crops' },
  { value: 'EQUIPMENT', label: 'Equipment' }
];

// Sort options
const sortOptions = [
  { value: 'NEWEST', label: 'Newest' },
  { value: 'PRICE_LOW', label: 'Price: Low to High' },
  { value: 'PRICE_HIGH', label: 'Price: High to Low' },
  { value: 'POPULARITY', label: 'Popularity' },
  { value: 'YIELD', label: 'Highest Yield' }
];

export default function MarketplacePage() {
  const [assets, setAssets] = useState<TokenAsset[]>(demoTokens);
  const [filteredAssets, setFilteredAssets] = useState<TokenAsset[]>(demoTokens);
  const [searchTerm, setSearchTerm] = useState('');
  const [assetTypeFilter, setAssetTypeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 20000]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  // Regions in Indonesia for filtering
  const regions = [
    'Bali', 'Java', 'Sumatra', 'Sulawesi', 'Kalimantan', 'Papua', 'Maluku'
  ];

  // Filter and sort assets when filters change
  useEffect(() => {
    let result = [...assets];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(asset =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply asset type filter
    if (assetTypeFilter !== 'ALL') {
      result = result.filter(asset => asset.type === assetTypeFilter);
    }

    // Apply price range filter
    result = result.filter(asset =>
      asset.price >= priceRange[0] && asset.price <= priceRange[1]
    );

    // Apply region filter
    if (selectedRegions.length > 0) {
      result = result.filter(asset =>
        selectedRegions.some(region => asset.location.includes(region))
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'PRICE_LOW':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'PRICE_HIGH':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'POPULARITY':
        result.sort((a, b) => b.soldPercentage - a.soldPercentage);
        break;
      case 'YIELD':
        result.sort((a, b) => (b.yield || 0) - (a.yield || 0));
        break;
      case 'NEWEST':
      default:
        // Assume id correlates with newness for demo purposes
        result.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        break;
    }

    setFilteredAssets(result);
  }, [assets, searchTerm, assetTypeFilter, sortBy, priceRange, selectedRegions]);

  // Asset card component
  const AssetCard = ({ asset }: { asset: TokenAsset }) => {
    console.log("Asset", asset);

    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-lg">
        <div className="relative h-48 w-full">
          <div className="absolute top-0 left-0 bg-green-600 text-white px-3 py-1 rounded-br-lg z-10">
            {asset.type}
          </div>
          <Image
            src={asset.imageUrl}
            alt={asset.name}
            className="object-cover"
            layout="fill"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFeAJ5jfZixgAAAABJRU5ErkJggg=="
          />
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold line-clamp-1">{asset.name}</h3>
            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded">
              ${asset.symbol}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-600 mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{asset.location}</span>
          </div>

          <p className="text-gray-700 text-sm mb-3 line-clamp-2">
            {asset.description}
          </p>

          <div className="flex flex-wrap gap-1 mb-3">
            {asset.tags.map((tag, i) => (
              <span
                key={i}
                className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-gray-500">Token Price</div>
              <div className="font-semibold text-green-700">
                {new Intl.NumberFormat('id-ID').format(asset.price)} IDR
              </div>
            </div>
            {asset.yield && (
              <div className="text-right">
                <div className="text-sm text-gray-500">Est. Yield</div>
                <div className="font-semibold text-green-700 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {asset.yield}%
                </div>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span>{asset.soldPercentage}% Sold</span>
              <span>{asset.supply} Total Supply</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${asset.soldPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t">
            <div className="flex items-center">
              <div className="relative h-6 w-6 rounded-full overflow-hidden mr-2">
                <Image
                  src={asset.creator.imageUrl}
                  alt={asset.creator.name}
                  layout="fill"
                  className="object-cover"
                />
              </div>
              <span className="text-xs text-gray-600">
                by {asset.creator.name}
              </span>
            </div>
            <Link
              href={`/token/${asset.id}`}
              className="bg-green-600 hover:bg-green-700 text-white text-sm py-1 px-3 rounded-lg transition-colors"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Hero section */}
      <div className="bg-green-800 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Invest in Indonesian Agriculture
          </h1>
          <p className="text-green-100 text-lg max-w-2xl mb-8">
            Browse tokenized agricultural assets from farmers across Indonesia.
            Support sustainable farming while earning returns on your investment.
          </p>
          <div className="relative max-w-2xl">
            <input
              type="text"
              placeholder="Search for farms, crops, or locations..."
              className="w-full py-3 px-5 pl-12 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Marketplace content */}
      <div className="container mx-auto px-4 py-8">
        {/* Filters and sorting section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="mr-4 font-medium text-lg">
                {filteredAssets.length} Assets Available
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
            </div>

            <div className="flex items-center">
              <span className="text-gray-700 mr-2">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Asset Type</h3>
                  <div className="space-y-2">
                    {assetTypes.map(type => (
                      <label key={type.value} className="flex items-center">
                        <input
                          type="radio"
                          name="assetType"
                          value={type.value}
                          checked={assetTypeFilter === type.value}
                          onChange={() => setAssetTypeFilter(type.value)}
                          className="mr-2 accent-green-600"
                        />
                        {type.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Price Range (IDR)</h3>
                  <div className="px-2">
                    <input
                      type="range"
                      min="0"
                      max="20000"
                      step="1000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full accent-green-600"
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>0</span>
                      <span>{new Intl.NumberFormat('id-ID').format(priceRange[1])} IDR</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Region</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {regions.map(region => (
                      <label key={region} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedRegions.includes(region)}
                          onChange={() => {
                            if (selectedRegions.includes(region)) {
                              setSelectedRegions(selectedRegions.filter(r => r !== region));
                            } else {
                              setSelectedRegions([...selectedRegions, region]);
                            }
                          }}
                          className="mr-2 accent-green-600"
                        />
                        {region}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setAssetTypeFilter('ALL');
                    setPriceRange([0, 20000]);
                    setSelectedRegions([]);
                    setSearchTerm('');
                  }}
                  className="text-gray-600 hover:text-gray-800 mr-4"
                >
                  Reset Filters
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Featured section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Leaf className="mr-2 h-5 w-5 text-green-600" />
            Featured Opportunities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssets.slice(0, 3).map(asset => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        </div>

        {/* All assets grid */}
        <h2 className="text-2xl font-bold mb-6">All Available Assets</h2>
        {filteredAssets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssets.map(asset => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="text-gray-400 mb-4">
              <SearchIcon className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-xl font-medium mb-2">No assets found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setAssetTypeFilter('ALL');
                setPriceRange([0, 20000]);
                setSelectedRegions([]);
                setSearchTerm('');
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 