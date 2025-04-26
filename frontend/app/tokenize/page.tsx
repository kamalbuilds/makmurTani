'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Upload, MapPin, Grid3X3, Calendar, Coins, ArrowRight } from 'lucide-react';

enum AssetType {
  LAND = 'land',
  CROP = 'crop',
  EQUIPMENT = 'equipment'
}

interface FormData {
  assetType: AssetType;
  title: string;
  description: string;
  location: string;
  coordinates: string;
  area: string;
  documentId: string;
  tokenSymbol: string;
  tokenName: string;
  totalSupply: string;
  price: string;
  images: File[];
  documents: File[];
}

export default function TokenizePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    assetType: AssetType.LAND,
    title: '',
    description: '',
    location: '',
    coordinates: '',
    area: '',
    documentId: '',
    tokenSymbol: '',
    tokenName: '',
    totalSupply: '',
    price: '',
    images: [],
    documents: []
  });
  
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [documentNames, setDocumentNames] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'images' | 'documents') => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], ...files]
      }));
      
      if (type === 'images') {
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewImages(prev => [...prev, ...newPreviews]);
      } else {
        setDocumentNames(prev => [...prev, ...files.map(file => file.name)]);
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveDocument = (index: number) => {
    setDocumentNames(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setIsSubmitting(false);
      // Redirect to success page or dashboard
      router.push('/tokenize/success');
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Tokenize Your Agricultural Asset</h1>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Convert your land, crops, or farming equipment into digital tokens on the MakmurTani platform. 
          This allows for fractional ownership, investment opportunities, and easy transfer of value.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="max-w-3xl mx-auto mb-10">
        <div className="flex justify-between">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  currentStep >= step 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step}
              </div>
              <div className="text-sm text-gray-600">
                {step === 1 && 'Asset Details'}
                {step === 2 && 'Documentation'}
                {step === 3 && 'Token Configuration'}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between items-center">
          <div className={`h-1 flex-1 ${currentStep >= 2 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
          <div className={`h-1 flex-1 ${currentStep >= 3 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 mb-10">
        {/* Step 1: Asset Details */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold border-b pb-2">Asset Details</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Asset Type</label>
              <div className="grid grid-cols-3 gap-4">
                {Object.values(AssetType).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({...formData, assetType: type as AssetType})}
                    className={`border rounded-lg p-4 flex flex-col items-center transition-colors ${
                      formData.assetType === type
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-200'
                    }`}
                  >
                    {type === AssetType.LAND && <Grid3X3 className="h-8 w-8 mb-2 text-green-600" />}
                    {type === AssetType.CROP && <Calendar className="h-8 w-8 mb-2 text-green-600" />}
                    {type === AssetType.EQUIPMENT && <Coins className="h-8 w-8 mb-2 text-green-600" />}
                    <span className="text-sm font-medium capitalize">{type}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="title" className="block text-gray-700 text-sm font-medium mb-2">
                  Asset Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter a descriptive title for your asset"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-gray-700 text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your asset in detail, including its features, condition, and potential value"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 h-32"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="location" className="block text-gray-700 text-sm font-medium mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" /> Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Village, District, Province"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="coordinates" className="block text-gray-700 text-sm font-medium mb-2">
                    GPS Coordinates
                  </label>
                  <input
                    type="text"
                    id="coordinates"
                    name="coordinates"
                    value={formData.coordinates}
                    onChange={handleChange}
                    placeholder="Latitude, Longitude"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label htmlFor="area" className="block text-gray-700 text-sm font-medium mb-2">
                    Area (in Hectares)
                  </label>
                  <input
                    type="text"
                    id="area"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="1.5"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-8">
              <button
                type="button"
                onClick={nextStep}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md flex items-center transition-colors"
              >
                Next Step <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        )}
        
        {/* Step 2: Documentation */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold border-b pb-2">Documentation</h2>
            
            <div>
              <label htmlFor="documentId" className="block text-gray-700 text-sm font-medium mb-2">
                Property Documentation ID
              </label>
              <input
                type="text"
                id="documentId"
                name="documentId"
                value={formData.documentId}
                onChange={handleChange}
                placeholder="Official document ID number"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your land certificate number, crop registration, or equipment registration
              </p>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Upload Images
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                <input
                  type="file"
                  id="images"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileChange(e, 'images')}
                  className="hidden"
                />
                <label htmlFor="images" className="cursor-pointer flex flex-col items-center">
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-gray-700 font-medium">Click or drag images here</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Upload clear photos of your asset from different angles
                  </p>
                </label>
              </div>
              
              {previewImages.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {previewImages.map((src, index) => (
                    <div key={index} className="relative group">
                      <div className="h-24 relative rounded-md overflow-hidden">
                        <Image src={src} alt="Preview" fill className="object-cover" unoptimized />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Upload Legal Documents
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                <input
                  type="file"
                  id="documents"
                  accept=".pdf,.doc,.docx"
                  multiple
                  onChange={(e) => handleFileChange(e, 'documents')}
                  className="hidden"
                />
                <label htmlFor="documents" className="cursor-pointer flex flex-col items-center">
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-gray-700 font-medium">Click or drag documents here</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Upload proof of ownership, certificates, and other relevant documents
                  </p>
                </label>
              </div>
              
              {documentNames.length > 0 && (
                <div className="mt-4 space-y-2">
                  {documentNames.map((name, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm truncate flex-1">{name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={prevStep}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md flex items-center transition-colors"
              >
                Next Step <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        )}
        
        {/* Step 3: Token Configuration */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold border-b pb-2">Token Configuration</h2>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Your token configuration determines how your asset will be represented on the blockchain. 
                    Once tokenized, these settings cannot be easily changed.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="tokenSymbol" className="block text-gray-700 text-sm font-medium mb-2">
                  Token Symbol
                </label>
                <input
                  type="text"
                  id="tokenSymbol"
                  name="tokenSymbol"
                  value={formData.tokenSymbol}
                  onChange={handleChange}
                  placeholder="LAND"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  3-5 character symbol for your token (e.g., RICE, LAND)
                </p>
              </div>
              
              <div>
                <label htmlFor="tokenName" className="block text-gray-700 text-sm font-medium mb-2">
                  Token Name
                </label>
                <input
                  type="text"
                  id="tokenName"
                  name="tokenName"
                  value={formData.tokenName}
                  onChange={handleChange}
                  placeholder="Bali Rice Farm Token"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Descriptive name for your token
                </p>
              </div>
              
              <div>
                <label htmlFor="totalSupply" className="block text-gray-700 text-sm font-medium mb-2">
                  Total Supply
                </label>
                <input
                  type="number"
                  id="totalSupply"
                  name="totalSupply"
                  value={formData.totalSupply}
                  onChange={handleChange}
                  placeholder="1000"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  How many tokens to create (represents 100% ownership)
                </p>
              </div>
              
              <div>
                <label htmlFor="price" className="block text-gray-700 text-sm font-medium mb-2">
                  Price Per Token (IDR)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="10000"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Initial price per token in Indonesian Rupiah
                </p>
              </div>
            </div>
            
            <div className="mt-8 border-t pt-6">
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Summary</h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-gray-600">Asset Type:</div>
                  <div className="font-medium capitalize">{formData.assetType}</div>
                  
                  <div className="text-gray-600">Title:</div>
                  <div className="font-medium">{formData.title || '-'}</div>
                  
                  <div className="text-gray-600">Location:</div>
                  <div className="font-medium">{formData.location || '-'}</div>
                  
                  <div className="text-gray-600">Total Value (IDR):</div>
                  <div className="font-medium">
                    {formData.totalSupply && formData.price 
                      ? new Intl.NumberFormat('id-ID').format(
                          Number(formData.totalSupply) * Number(formData.price)
                        )
                      : '-'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={prevStep}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-md flex items-center transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Processing...
                  </>
                ) : (
                  'Tokenize Asset'
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
} 