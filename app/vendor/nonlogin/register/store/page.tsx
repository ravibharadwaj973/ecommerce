'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import ProgressBar from '../../../../components/ProgressBar';
import {
  BuildingStorefrontIcon,
  DocumentTextIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  HomeIcon,
  GlobeAmericasIcon,
  CreditCardIcon,
  DocumentDuplicateIcon,
  TagIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function VendorStoreDetails() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verificationScore, setVerificationScore] = useState(0);
  const [verificationLevel, setVerificationLevel] = useState('basic');

  const [form, setForm] = useState({
    storeName: '',
    storeDescription: '',
    gstNumber: '',
    panNumber: '',
    businessAddress: {
      addressLine1: '',
      city: '',
      state: '',
      country: 'India',
      pincode: '',
    },
    payoutDetails: {},
    documents: [],
  });

  /* ---------------- AUTH + EXISTING VENDOR CHECK ---------------- */

  useEffect(() => {
    if (loading) return; // ⛔ wait for auth resolution

    if (!user) {
      router.push('/vendor/nonlogin/register');
      return;
    }


  }, [user, loading, router]);

  const fetchExistingVendor = async () => {
    try {
      const res = await fetch('/api/vendors/register', {
        method: 'GET',
        credentials: 'include',
      });

      if (res.status === 404) {
        // Vendor not created yet → stay on this page
        return;
      }

      if (!res.ok) return;

      const data = await res.json();

      if (data.success && data.data) {
        setForm({
          storeName: data.data.storeName || '',
          storeDescription: data.data.storeDescription || '',
          gstNumber: data.data.gstNumber || '',
          panNumber: data.data.panNumber || '',
          businessAddress: data.data.businessAddress || {
            addressLine1: '',
            city: '',
            state: '',
            country: 'India',
            pincode: '',
          },
          payoutDetails: data.data.payoutDetails || {},
          documents: data.data.documents || [],
        });

        setVerificationScore(data.data.verificationScore || 0);
        setVerificationLevel(data.data.verificationLevel || 'basic');

        // Already vendor → redirect
        router.push('/vendor/dashboard');
      }
    } catch (err) {
      console.error('Vendor fetch failed:', err);
    }
  };

  /* ---------------- FORM HANDLERS ---------------- */

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('businessAddress.')) {
      const field = name.split('.')[1];
      setForm((prev) => ({
        ...prev,
        businessAddress: { ...prev.businessAddress, [field]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const calculateCurrentScore = () => {
    let score = 0;

    if (form.storeName.trim()) score += 10;
    if (form.storeDescription.trim().length > 50) score += 10;
    if (form.gstNumber.trim()) score += 20;
    if (form.panNumber.trim()) score += 20;

    const a = form.businessAddress;
    if (a.addressLine1 && a.city && a.state && a.pincode) score += 20;

    if (form.documents.length > 0) score += 20;

    return score;
  };

  const getVerificationLevel = (score) => {
    if (score >= 80) return 'full';
    if (score >= 50) return 'intermediate';
    return 'basic';
  };

  const handleback=()=>{
    router.push("/vendor/nonlogin/register")
  }
  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const score = calculateCurrentScore();
      const level = getVerificationLevel(score);

      setVerificationScore(score);
      setVerificationLevel(level);

      const res = await fetch('/api/vendor/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          storeName: form.storeName.trim(),
          storeDescription: form.storeDescription.trim(),
          gstNumber: form.gstNumber.trim(),
          panNumber: form.panNumber.trim(),
          businessAddress: {
            addressLine1: form.businessAddress.addressLine1.trim(),
            city: form.businessAddress.city.trim(),
            state: form.businessAddress.state.trim(),
            country: form.businessAddress.country.trim(),
            pincode: form.businessAddress.pincode.trim(),
          },
          payoutDetails: form.payoutDetails,
          documents: form.documents,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || 'Vendor registration failed');
        return;
      }

    

      setSuccess(
        `Vendor registered. Score: ${data.data.vendor.verificationScore}/100 (${data.data.vendor.verificationLevel})`
      );

      setTimeout(() => {
        router.push('/vendor/register/verify');
      }, 1500);
    } catch (err) {
      console.error(err);
      setError('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- LIVE SCORE UPDATE ---------------- */

  useEffect(() => {
    const s = calculateCurrentScore();
    setVerificationScore(s);
    setVerificationLevel(getVerificationLevel(s));
  }, [form]);

  /* ---------------- UI BELOW (UNCHANGED) ---------------- */


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Progress Bar */}
        <ProgressBar currentStep={2} totalSteps={3} />

        {/* Verification Score Card */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center mb-4 sm:mb-0">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                  <ShieldCheckIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Verification Progress</h3>
                  <p className="text-sm text-gray-600">Complete all steps for faster approval</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{verificationScore}/100</div>
                <div className="text-sm text-gray-600">Current Score</div>
              </div>
              
              <div className="text-center mt-4 sm:mt-0">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  verificationLevel === 'full' ? 'bg-emerald-100 text-emerald-800' :
                  verificationLevel === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {verificationLevel.charAt(0).toUpperCase() + verificationLevel.slice(1)} Level
                </div>
                <div className="text-xs text-gray-500 mt-1">Verification Level</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Basic Info</span>
                <span>{verificationScore}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${verificationScore}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="max-w-4xl mx-auto mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-emerald-600 mr-2" />
              <p className="text-emerald-700 font-medium">{success}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} disabled={loading} className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Store Details */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <BuildingStorefrontIcon className="w-6 h-6 mr-2 text-blue-600" />
                    Store Information
                  </h2>
                  
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-700">
                          Store Name *
                        </label>
                        <span className="text-xs text-gray-500">+10 points</span>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <TagIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          name="storeName"
                          placeholder="Your Store Name"
                          required
                          value={form.storeName}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-700">
                          Store Description
                        </label>
                        <span className="text-xs text-gray-500">
                          {form.storeDescription.length > 50 ? '+10 points' : '+0 points'}
                        </span>
                      </div>
                      <div className="relative">
                        <div className="absolute top-3 left-3 pointer-events-none">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <textarea
                          name="storeDescription"
                          placeholder="Describe your store, products, and services (min. 50 characters for better verification)"
                          rows="4"
                          value={form.storeDescription}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 resize-none"
                        />
                        <div className="text-xs text-gray-500 mt-1 text-right">
                          {form.storeDescription.length}/50 characters
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Registration */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <DocumentDuplicateIcon className="w-6 h-6 mr-2 text-blue-600" />
                    Business Registration
                  </h2>
                  
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-700">
                          GST Number
                        </label>
                        <span className="text-xs text-gray-500">+20 points</span>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CreditCardIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          name="gstNumber"
                          placeholder="22AAAAA0000A1Z5"
                          value={form.gstNumber}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-700">
                          PAN Number
                        </label>
                        <span className="text-xs text-gray-500">+20 points</span>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CreditCardIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          name="panNumber"
                          placeholder="ABCDE1234F"
                          value={form.panNumber}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Address Details */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <MapPinIcon className="w-6 h-6 mr-2 text-blue-600" />
                  Business Address
                </h2>
                
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium text-gray-700">
                        Address Line 1 *
                      </label>
                      <span className="text-xs text-gray-500">Part of +20 points</span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <HomeIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        name="businessAddress.addressLine1"
                        placeholder="Street address, P.O. box, company name"
                        required
                        value={form.businessAddress.addressLine1}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        City *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          name="businessAddress.city"
                          placeholder="City"
                          required
                          value={form.businessAddress.city}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        State *
                      </label>
                      <input
                        name="businessAddress.state"
                        placeholder="State / Province"
                        required
                        value={form.businessAddress.state}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Country *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <GlobeAmericasIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                          name="businessAddress.country"
                          value={form.businessAddress.country}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                        >
                          <option value="India">India</option>
                          <option value="USA">United States</option>
                          <option value="UK">United Kingdom</option>
                          <option value="Canada">Canada</option>
                          <option value="Australia">Australia</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Pincode *
                      </label>
                      <input
                        name="businessAddress.pincode"
                        placeholder="Postal code"
                        required
                        value={form.businessAddress.pincode}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Verification Tips */}
                <div className="mt-10 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                  <h3 className="font-medium text-blue-800 mb-3 flex items-center">
                    <ShieldCheckIcon className="w-5 h-5 mr-2" />
                    How to Improve Your Verification Score
                  </h3>
                  <ul className="text-sm text-blue-700 space-y-2">
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-4 w-4 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Complete all fields marked with *</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-4 w-4 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Add detailed store description (50+ characters)</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-4 w-4 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Provide GST & PAN numbers for business verification</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-4 w-4 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Upload business documents in next step for extra points</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={handleback}
                className="flex items-center justify-center px-6 py-3.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back to Account
              </button>
              
              <button
                type="submit"
                disabled={loading || !form.storeName.trim() || 
                  !form.businessAddress.addressLine1.trim() ||
                  !form.businessAddress.city.trim() ||
                  !form.businessAddress.state.trim() ||
                  !form.businessAddress.pincode.trim()}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering Vendor...
                  </div>
                ) : (
                  `Register Vendor & Continue (${verificationScore}% Complete)`
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Information Box */}
        <div className="mt-8 max-w-4xl mx-auto p-6 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
          <h3 className="font-semibold text-gray-900 mb-3">Important Notes</h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex items-start">
              <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Your account will be converted to <strong>Vendor Role</strong> after registration</span>
            </li>
            <li className="flex items-start">
              <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Store name must be unique across the platform</span>
            </li>
            <li className="flex items-start">
              <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Verification may take 24-48 hours after document upload</span>
            </li>
            <li className="flex items-start">
              <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Higher verification score gives you more features and credibility</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}