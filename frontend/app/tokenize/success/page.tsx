'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Copy, Share2, ExternalLink, ChevronRight } from 'lucide-react';

export default function TokenizeSuccessPage() {
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(5);
  
  // Sample transaction hash and token data
  const transactionHash = "0x7f4b622b0df2a96e5f35c3e78b142e75d3c8e1f9d78a22fc892980d4c3625d";
  const tokenData = {
    symbol: "RICE",
    name: "Bali Rice Farm Token",
    contractAddress: "0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE",
    totalSupply: "1000",
    tokenPrice: "10000", // IDR
  };

  useEffect(() => {
    // Auto-copy transaction hash on page load
    copyToClipboard(transactionHash);
    
    // Confetti effect
    const confettiScript = document.createElement('script');
    confettiScript.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js';
    confettiScript.onload = () => {
      // @ts-ignore
      window.confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    };
    document.body.appendChild(confettiScript);
    
    // Countdown for redirect
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      clearInterval(timer);
      document.body.removeChild(confettiScript);
    };
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Success header */}
          <div className="bg-green-600 px-6 py-8 text-center">
            <div className="inline-flex justify-center items-center bg-white rounded-full p-2 mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Tokenization Successful!</h1>
            <p className="text-green-100">
              Your asset has been successfully tokenized on the blockchain
            </p>
          </div>
          
          {/* Token information */}
          <div className="px-6 py-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Token Information</h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Token Name:</span>
                  <span className="font-medium">{tokenData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Token Symbol:</span>
                  <span className="font-medium">{tokenData.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Supply:</span>
                  <span className="font-medium">{tokenData.totalSupply} tokens</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Token Price:</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('id-ID').format(Number(tokenData.tokenPrice))} IDR
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Value:</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('id-ID').format(
                      Number(tokenData.totalSupply) * Number(tokenData.tokenPrice)
                    )} IDR
                  </span>
                </div>
              </div>
            </div>
            
            {/* Transaction hash */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2">Transaction Hash</h2>
              <div className="relative">
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-3 pr-12 overflow-x-auto">
                  <code className="text-xs text-gray-800 font-mono whitespace-nowrap">
                    {transactionHash}
                  </code>
                </div>
                <button 
                  onClick={() => copyToClipboard(transactionHash)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {copied ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Copy className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                You can track your transaction on the blockchain explorer
              </div>
            </div>
            
            {/* Smart contract address */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2">Smart Contract Address</h2>
              <div className="relative">
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-3 pr-12 overflow-x-auto">
                  <code className="text-xs text-gray-800 font-mono whitespace-nowrap">
                    {tokenData.contractAddress}
                  </code>
                </div>
                <button 
                  onClick={() => copyToClipboard(tokenData.contractAddress)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <Copy className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <a 
                href={`https://explorer.lisk.com/tx/${transactionHash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                View on Explorer <ExternalLink className="ml-2 h-4 w-4" />
              </a>
              <button 
                onClick={() => {
                  // Creating a share link
                  const shareUrl = `${window.location.origin}/token/${tokenData.symbol}`;
                  // If Web Share API is available
                  if (navigator.share) {
                    navigator.share({
                      title: `${tokenData.name} (${tokenData.symbol})`,
                      text: `Check out my newly tokenized agricultural asset: ${tokenData.name}`,
                      url: shareUrl,
                    });
                  } else {
                    copyToClipboard(shareUrl);
                  }
                }}
                className="flex items-center justify-center bg-green-600 rounded-lg px-4 py-3 text-white font-medium hover:bg-green-700 transition-colors"
              >
                Share Token <Share2 className="ml-2 h-4 w-4" />
              </button>
            </div>
            
            {/* Next steps */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold mb-4">Next Steps</h2>
              <ul className="space-y-4">
                <li className="flex">
                  <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-green-100 text-green-600 mr-3">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium">List your tokens on the marketplace</h3>
                    <p className="text-sm text-gray-600">Make your tokens available for investors to purchase</p>
                  </div>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-green-100 text-green-600 mr-3">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium">Update your asset profile regularly</h3>
                    <p className="text-sm text-gray-600">Keep investors informed about your asset&aptos;s status</p>
                  </div>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-green-100 text-green-600 mr-3">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium">Manage token distributions</h3>
                    <p className="text-sm text-gray-600">Distribute profit shares to token holders as appropriate</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Footer actions */}
          <div className="border-t px-6 py-4 bg-gray-50">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-500">Redirecting to dashboard in {countdown}s</span>
              </div>
              <div className="flex space-x-4">
                <Link 
                  href="/marketplace" 
                  className="text-green-600 hover:text-green-700 font-medium text-sm"
                >
                  Go to Marketplace
                </Link>
                <Link 
                  href="/dashboard" 
                  className="flex items-center text-green-600 hover:text-green-700 font-medium text-sm"
                >
                  Dashboard <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 