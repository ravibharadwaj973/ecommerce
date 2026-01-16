'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import ProgressBar from '../../../../components/ProgressBar';
import {
  ShieldCheckIcon,
  DocumentCheckIcon,
  CameraIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
  MapPinIcon,
  CreditCardIcon,
  BuildingOfficeIcon,
  ArrowRightIcon,
  XCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

export default function VendorVerify() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [vendor, setVendor] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== 'vendor') {
      router.push('/login');
      return;
    }

    fetchVendor();
  }, [user, loading]);

  const fetchVendor = async () => {
    try {
      const res = await fetch('/api/vendor/register', {
        credentials: 'include'
      });
      
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      
      const data = await res.json();
      
      if (data.success) {
        setVendor(data.data);
      } else {
        setError(data.message || 'Failed to fetch vendor data');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error fetching vendor:', error);
    }
  };

  const getDocumentInfo = (type) => {
    const info = {
      pan: {
        title: 'PAN Card',
        description: 'Upload front side of your PAN card',
        icon: CreditCardIcon,
        acceptedTypes: 'image/*,.pdf',
        maxSize: '5MB',
        points: '+20 points',
        required: true
      },
      gst: {
        title: 'GST Certificate',
        description: 'Upload GST registration certificate',
        icon: DocumentTextIcon,
        acceptedTypes: 'image/*,.pdf',
        maxSize: '5MB',
        points: '+20 points',
        required: true
      },
      address_proof: {
        title: 'Address Proof',
        description: 'Aadhar Card, Utility Bill, or Bank Statement',
        icon: MapPinIcon,
        acceptedTypes: 'image/*,.pdf',
        maxSize: '5MB',
        points: '+20 points',
        required: true
      },
      id_proof: {
        title: 'ID Proof',
        description: 'Aadhar Card or Passport',
        icon: BuildingOfficeIcon,
        acceptedTypes: 'image/*,.pdf',
        maxSize: '5MB',
        points: '+10 points',
        required: false
      },
      business_license: {
        title: 'Business License',
        description: 'Shop & Establishment or Trade License',
        icon: DocumentCheckIcon,
        acceptedTypes: 'image/*,.pdf',
        maxSize: '5MB',
        points: '+10 points',
        required: false
      }
    };
    
    return info[type] || {
      title: type.replace('_', ' ').toUpperCase(),
      description: 'Upload required document',
      icon: DocumentCheckIcon,
      acceptedTypes: 'image/*,.pdf',
      maxSize: '5MB',
      points: '+10 points',
      required: false
    };
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      case 'pending': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved': return CheckCircleIcon;
      case 'rejected': return XCircleIcon;
      case 'pending': return ClockIcon;
      default: return ExclamationTriangleIcon;
    }
  };

  const handleFileSelect = (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload JPG, PNG, or PDF files only');
      return;
    }

    setSelectedFile({ file, docType });
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
  };

  const simulateUpload = (docType, fileName) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUrl = `https://storage.example.com/documents/${fileName}`;
        resolve(mockUrl);
      }, 1500);
    });
  };

  const handleUpload = async (docType, file) => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setUploadingDoc(docType);
    setError('');
    setSuccess('');

    try {
      // In real app, upload to cloud storage (AWS S3, Cloudinary, etc.)
      const fileUrl = await simulateUpload(docType, file.name);

      const response = await fetch('/api/vendor/register', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documents: [{ 
            type: docType, 
            url: fileUrl,
            fileName: file.name,
            fileSize: file.size,
            uploadedAt: new Date().toISOString()
          }]
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`${getDocumentInfo(docType).title} uploaded successfully!`);
        await fetchVendor();
        setSelectedFile(null);
        setPreviewUrl('');
      } else {
        setError(data.message || 'Upload failed');
      }
    } catch (error) {
      setError('Upload failed. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      setUploadingDoc(null);
    }
  };

  const DocumentUpload = ({ docType }) => {
    const docInfo = getDocumentInfo(docType);
    const existingDoc = vendor?.documents?.find(d => d.type === docType);
    const isUploading = uploading && uploadingDoc === docType;
    const StatusIcon = getStatusIcon(existingDoc?.status || 'pending');

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                <docInfo.icon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900">{docInfo.title}</h3>
                <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {docInfo.points}
                </span>
                {docInfo.required && (
                  <span className="text-xs font-medium px-2 py-1 bg-red-100 text-red-800 rounded-full">
                    Required
                  </span>
                )}
              </div>
              <p className="text-gray-600 mt-1">{docInfo.description}</p>
              <div className="flex items-center mt-3 space-x-4 text-sm">
                <span className="text-gray-500">Accepted: {docInfo.acceptedTypes}</span>
                <span className="text-gray-500">Max: {docInfo.maxSize}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-2">
            {existingDoc ? (
              <div className={`flex items-center px-3 py-1 rounded-full border ${getStatusColor(existingDoc.status)}`}>
                <StatusIcon className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium capitalize">{existingDoc.status}</span>
              </div>
            ) : (
              <div className="flex items-center px-3 py-1 rounded-full border border-gray-300 text-gray-700">
                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">Not Uploaded</span>
              </div>
            )}

            {existingDoc?.uploadedAt && (
              <span className="text-xs text-gray-500">
                Uploaded: {new Date(existingDoc.uploadedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="mt-6">
          {selectedFile?.docType === docType ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <DocumentTextIcon className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{selectedFile.file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl('');
                  }}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <XCircleIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {previewUrl && selectedFile.file.type.startsWith('image/') && (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full max-h-64 object-contain rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={() => window.open(previewUrl, '_blank')}
                    className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
                  >
                    <EyeIcon className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => handleUpload(docType, selectedFile.file)}
                  disabled={isUploading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isUploading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <CloudArrowUpIcon className="w-5 h-5 mr-2" />
                      Confirm Upload
                    </div>
                  )}
                </button>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl('');
                  }}
                  className="px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <label className="block">
              <input
                type="file"
                accept={docInfo.acceptedTypes}
                onChange={(e) => handleFileSelect(e, docType)}
                className="hidden"
                id={`file-upload-${docType}`}
              />
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 group">
                <CameraIcon className="w-12 h-12 text-gray-400 mx-auto mb-3 group-hover:text-blue-500 transition-colors" />
                <p className="text-gray-700 font-medium mb-1">
                  {existingDoc ? 'Replace Document' : 'Click to upload'}
                </p>
                <p className="text-sm text-gray-500">
                  Drag & drop or click to browse
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {docInfo.acceptedTypes} • Max {docInfo.maxSize}
                </p>
              </div>
            </label>
          )}
        </div>
      </div>
    );
  };

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading verification details...</p>
        </div>
      </div>
    );
  }

  const verificationScore = vendor.verificationScore || 0;
  const documentPoints = vendor.documents?.reduce((acc, doc) => {
    if (doc.status === 'approved') {
      switch(doc.type) {
        case 'pan': return acc + 20;
        case 'gst': return acc + 20;
        case 'address_proof': return acc + 20;
        default: return acc + 10;
      }
    }
    return acc;
  }, 0) || 0;

  const maxDocumentPoints = 60; // PAN(20) + GST(20) + Address(20)
  const totalScore = verificationScore + documentPoints;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Progress Bar */}
        <ProgressBar currentStep={3} totalSteps={3} />

        {/* Header */}
        <div className="max-w-4xl mx-auto mb-10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
              <ShieldCheckIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Document Verification
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Upload required documents to complete your vendor verification and unlock all features
            </p>
          </div>
        </div>

        {/* Score & Status Card */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{totalScore}/100</div>
                <div className="text-sm text-gray-600">Verification Score</div>
                <div className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                  totalScore >= 80 ? 'bg-emerald-100 text-emerald-800' :
                  totalScore >= 50 ? 'bg-blue-100 text-blue-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {vendor.verificationLevel} Level
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {vendor.verificationStatus === 'approved' ? '✓' : vendor.verificationStatus === 'rejected' ? '✗' : '...'}
                </div>
                <div className="text-sm text-gray-600">Status</div>
                <div className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vendor.verificationStatus)}`}>
                  {vendor.verificationStatus.charAt(0).toUpperCase() + vendor.verificationStatus.slice(1)}
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{documentPoints}/60</div>
                <div className="text-sm text-gray-600">Document Points</div>
                <div className="mt-2 text-sm text-gray-500">
                  {vendor.documents?.filter(d => d.status === 'approved').length || 0} of 3 approved
                </div>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="mt-8 space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Store Information</span>
                  <span>{verificationScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${verificationScore}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Document Verification</span>
                  <span>{documentPoints}/60 points</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(documentPoints / 60) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {success && (
          <div className="max-w-4xl mx-auto mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-emerald-600 mr-2" />
              <p className="text-emerald-700 font-medium">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Documents Section */}
        <div className="max-w-4xl mx-auto mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Required Documents</h2>
          <div className="space-y-6">
            {['pan', 'gst', 'address_proof'].map(docType => (
              <DocumentUpload key={docType} docType={docType} />
            ))}
          </div>
        </div>

        {/* Optional Documents */}
        <div className="max-w-4xl mx-auto mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Optional Documents (For Higher Trust)</h2>
          <div className="space-y-6">
            {['id_proof', 'business_license'].map(docType => (
              <DocumentUpload key={docType} docType={docType} />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push('/vendor/register/store')}
                className="flex items-center justify-center px-6 py-3.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back to Store Details
              </button>

              {vendor.verificationStatus === 'approved' ? (
                <button
                  onClick={() => router.push('/vendor/dashboard')}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-center justify-center">
                    Go to Dashboard
                    <ArrowRightIcon className="ml-2 w-5 h-5" />
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => router.push('/vendor/dashboard')}
                  disabled={totalScore < 50}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {totalScore < 50 ? (
                    `Complete Verification (${totalScore}/50 Required)`
                  ) : (
                    'Access Dashboard (Pending Review)'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="max-w-4xl mx-auto mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
            <ShieldCheckIcon className="w-5 h-5 mr-2" />
            Verification Process
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li className="flex items-start">
              <CheckCircleIcon className="h-4 w-4 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>Documents are reviewed within 24-48 hours</span>
            </li>
            <li className="flex items-start">
              <CheckCircleIcon className="h-4 w-4 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>Higher verification scores unlock more features</span>
            </li>
            <li className="flex items-start">
              <CheckCircleIcon className="h-4 w-4 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>You can access dashboard while verification is pending</span>
            </li>
            <li className="flex items-start">
              <CheckCircleIcon className="h-4 w-4 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>You'll be notified via email when verification is complete</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}