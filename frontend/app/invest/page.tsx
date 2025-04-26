'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface InvestmentOpportunity {
  id: string;
  title: string;
  description: string;
  location: string;
  targetAmount: string;
  raisedAmount: string;
  percentageRaised: number;
  daysLeft: number;
  roi: string;
  duration: string;
  image: string;
  farmer: string;
}

export default function InvestPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [opportunities, setOpportunities] = useState<InvestmentOpportunity[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // Simulate API call with timeout
    const timer = setTimeout(() => {
      // Mock data for demonstration
      setOpportunities([
        {
          id: '1',
          title: 'Rice Farming Season 2025',
          description: 'Support local rice farmers in Bali for the upcoming growing season. Funds will be used for seeds, equipment, and labor.',
          location: 'Tabanan, Bali',
          targetAmount: '15 ETH',
          raisedAmount: '8.5 ETH',
          percentageRaised: 56,
          daysLeft: 12,
          roi: '8.5%',
          duration: '9 months',
          image: 'https://placehold.co/600x400/1B5E20/FFFFFF.png?text=Rice+Farming',
          farmer: 'Pak Wayan'
        },
        {
          id: '2',
          title: 'Coffee Plantation Expansion',
          description: 'Help expand an existing coffee plantation in the highlands of West Java. Funds will be used to plant new coffee trees.',
          location: 'Bandung, West Java',
          targetAmount: '25 ETH',
          raisedAmount: '22 ETH',
          percentageRaised: 88,
          daysLeft: 5,
          roi: '12%',
          duration: '24 months',
          image: 'https://placehold.co/600x400/1B5E20/FFFFFF.png?text=Coffee+Plantation',
          farmer: 'Bu Siti'
        },
        {
          id: '3',
          title: 'Hydroponic Vegetable Farm',
          description: 'Fund a modern hydroponic vegetable farm near Jakarta to provide fresh produce to urban markets.',
          location: 'Bekasi, West Java',
          targetAmount: '18 ETH',
          raisedAmount: '4.2 ETH',
          percentageRaised: 23,
          daysLeft: 20,
          roi: '10%',
          duration: '6 months',
          image: 'https://placehold.co/600x400/1B5E20/FFFFFF.png?text=Hydroponic+Farm',
          farmer: 'Pak Joko'
        },
        {
          id: '4',
          title: 'Fruit Orchard Development',
          description: 'Support the development of a new fruit orchard specializing in mangosteen and rambutan.',
          location: 'Palembang, South Sumatra',
          targetAmount: '20 ETH',
          raisedAmount: '12.8 ETH',
          percentageRaised: 64,
          daysLeft: 9,
          roi: '9.5%',
          duration: '36 months',
          image: 'https://placehold.co/600x400/1B5E20/FFFFFF.png?text=Fruit+Orchard',
          farmer: 'Bu Ratna'
        }
      ]);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const filteredOpportunities = opportunities.filter(opportunity => {
    if (activeTab === 'all') return true;
    if (activeTab === 'almostFunded' && opportunity.percentageRaised >= 75) return true;
    if (activeTab === 'highROI' && parseFloat(opportunity.roi) >= 10) return true;
    if (activeTab === 'endingSoon' && opportunity.daysLeft <= 7) return true;
    return false;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Investment Opportunities</h1>
        <p className="text-gray-600 max-w-3xl">
          Support Indonesian farmers by investing in their agricultural projects. Each investment opportunity offers returns based on harvest yields and market prices.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex flex-wrap -mb-px">
          <button 
            className={`mr-2 py-2 px-4 text-sm font-medium ${activeTab === 'all' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('all')}
          >
            All Opportunities
          </button>
          <button 
            className={`mr-2 py-2 px-4 text-sm font-medium ${activeTab === 'almostFunded' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('almostFunded')}
          >
            Almost Funded
          </button>
          <button 
            className={`mr-2 py-2 px-4 text-sm font-medium ${activeTab === 'highROI' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('highROI')}
          >
            High ROI
          </button>
          <button 
            className={`mr-2 py-2 px-4 text-sm font-medium ${activeTab === 'endingSoon' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('endingSoon')}
          >
            Ending Soon
          </button>
        </div>
      </div>

      {/* Opportunities */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredOpportunities.map((opportunity) => (
            <div key={opportunity.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row">
              <div className="relative md:w-1/3 h-48 md:h-auto">
                <Image
                  src={opportunity.image}
                  alt={opportunity.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="p-4 md:w-2/3">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{opportunity.title}</h3>
                <p className="text-gray-600 mb-2">{opportunity.location}</p>
                <p className="text-sm text-gray-700 mb-4">{opportunity.description}</p>
                
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{opportunity.raisedAmount} of {opportunity.targetAmount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${opportunity.percentageRaised}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-green-50 p-2 rounded">
                    <p className="text-xs text-gray-500">Expected ROI</p>
                    <p className="text-sm font-bold text-green-700">{opportunity.roi}</p>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="text-sm font-bold text-green-700">{opportunity.duration}</p>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <p className="text-xs text-gray-500">Days Left</p>
                    <p className="text-sm font-bold text-green-700">{opportunity.daysLeft} days</p>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <p className="text-xs text-gray-500">Farmer</p>
                    <p className="text-sm font-bold text-green-700">{opportunity.farmer}</p>
                  </div>
                </div>
                
                <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors">
                  Invest Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 