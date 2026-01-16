import { CheckCircleIcon } from "lucide-react";

// components/ProgressBar.jsx
export default function ProgressBar({ currentStep = 1, totalSteps = 3 }) {
  const steps = [
    { number: 1, label: 'Authentication' },
    { number: 2, label: 'Store Details' },
    { number: 3, label: 'Verification' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mb-10 px-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex flex-col items-center z-10">
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center
              ${currentStep >= step.number 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                : 'bg-gray-200 text-gray-500'
              }
              transition-all duration-300
            `}>
              {currentStep > step.number ? (
                <CheckCircleIcon className="w-6 h-6" />
              ) : (
                <span className="text-lg font-semibold">{step.number}</span>
              )}
            </div>
            <span className={`
              mt-2 text-sm font-medium
              ${currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'}
            `}>
              {step.label}
            </span>
          </div>
        ))}
        
        {/* Connecting lines */}
        <div className="absolute left-0 right-0 flex justify-center">
          <div className="w-3/4 h-1 bg-gray-200 -mt-6">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {currentStep === 1 && 'Create Vendor Account'}
          {currentStep === 2 && 'Store Information'}
          {currentStep === 3 && 'Account Verification'}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {currentStep === 1 && 'Sign up to start your vendor journey'}
          {currentStep === 2 && 'Tell us about your business'}
          {currentStep === 3 && 'Verify your account to get started'}
        </p>
      </div>
    </div>
  );
}