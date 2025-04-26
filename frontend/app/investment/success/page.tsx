'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Check, ChevronLeft, ExternalLink, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function InvestmentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const amount = searchParams.get('amount');
  const tokenId = searchParams.get('tokenId');
  
  const [isLoading, setIsLoading] = useState(true);
  const [transactionHash, setTransactionHash] = useState('');
  const [token, setToken] = useState({
    name: 'Paddy Field in Ubud',
    symbol: 'UBUD',
    price: 12000,
    imageUrl: '/assets/rice-field.jpg'
  });
  
  // Simulate fetching transaction details
  useEffect(() => {
    // In a real app, this would verify the transaction on the blockchain
    setTimeout(() => {
      setTransactionHash('0x' + Math.random().toString(16).substr(2, 40));
      setIsLoading(false);
    }, 1500);
  }, []);
  
  const totalAmount = amount ? parseInt(amount) * token.price : 0;
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Finalizing your investment...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-10 w-10 text-green-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-2">Investment Successful!</h1>
          <p className="text-center text-gray-600 mb-8">
            Your transaction has been confirmed on the blockchain
          </p>
          
          <div className="border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative h-14 w-14 rounded-md overflow-hidden">
                <Image 
                  src={token.imageUrl} 
                  alt={token.name} 
                  fill 
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium">{token.name}</h3>
                <p className="text-sm text-gray-500">${token.symbol}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tokens purchased:</span>
                <span className="font-medium">{amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price per token:</span>
                <span className="font-medium">{new Intl.NumberFormat('id-ID').format(token.price)} IDR</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-100">
                <span className="text-gray-800 font-medium">Total amount:</span>
                <span className="font-bold text-green-700">
                  {new Intl.NumberFormat('id-ID').format(totalAmount)} IDR
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium mb-2">Transaction Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-600">Transaction Hash:</span>
                <span className="text-sm font-mono text-right">
                  {transactionHash.substring(0, 8)}...{transactionHash.substring(transactionHash.length - 8)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status:</span>
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                  Confirmed
                </span>
              </div>
              <div className="flex justify-end mt-1">
                <Link 
                  href={`https://explorer.lisk.com/tx/${transactionHash}`} 
                  target="_blank"
                  className="text-sm text-green-600 hover:text-green-700 flex items-center"
                >
                  View on Explorer <ExternalLink className="h-3 w-3 ml-1" />
                </Link>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Link
              href={`/token/${tokenId}`}
              className="block w-full bg-white border border-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg text-center hover:bg-gray-50"
            >
              View Asset Details
            </Link>
            <Link
              href="/portfolio"
              className="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg text-center flex items-center justify-center"
            >
              Go to My Portfolio <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
            <Link 
              href="/marketplace" 
              className="flex items-center justify-center text-gray-600 hover:text-gray-800 py-2"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Marketplace
            </Link>
          </div>
        </div>
      </div>
      
      <div className="max-w-md mx-auto mt-8 text-center">
        <h3 className="font-medium text-gray-800 mb-3">What's Next?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-green-600 font-medium mb-1">Track</div>
            <p className="text-sm text-gray-600">Monitor your investment performance in your portfolio</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-green-600 font-medium mb-1">Diversify</div>
            <p className="text-sm text-gray-600">Invest in various agricultural assets to balance risk</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-green-600 font-medium mb-1">Compound</div>
            <p className="text-sm text-gray-600">Reinvest yields to maximize your returns over time</p>
          </div>
        </div>
      </div>
    </div>
  );
} 