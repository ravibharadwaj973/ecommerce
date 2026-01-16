'use client';
import { motion } from 'framer-motion';
import { CreditCard, Truck, User, CheckCircle } from 'lucide-react';
import OrderSummary from './OrderSummary';

const steps = [
  { id: 'contact', name: 'Contact', icon: User },
  { id: 'shipping', name: 'Shipping', icon: Truck },
  { id: 'payment', name: 'Payment', icon: CreditCard },
  { id: 'review', name: 'Review', icon: CheckCircle },
];

export default function CheckoutLayout({ 
  children, 
  currentStep, 
  onStepChange,
  cart,
  cartSummary 
}) {
  const currentIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = index < currentIndex;
              const isCurrent = index === currentIndex;
              
              return (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <div className="flex items-center w-full">
                    {/* Connector Line */}
                    {index > 0 && (
                      <div
                        className={`flex-1 h-1 ${
                          isCompleted ? 'bg-indigo-600' : 'bg-gray-300'
                        }`}
                      />
                    )}
                    
                    {/* Step Circle */}
                    <div className="relative">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                          isCompleted
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : isCurrent
                            ? 'border-indigo-600 bg-white text-indigo-600'
                            : 'border-gray-300 bg-white text-gray-400'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <StepIcon className="w-5 h-5" />
                        )}
                      </div>
                    </div>

                    {/* Connector Line */}
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-1 ${
                          index < currentIndex ? 'bg-indigo-600' : 'bg-gray-300'
                        }`}
                      />
                    )}
                  </div>
                  
                  {/* Step Name */}
                  <span
                    className={`mt-2 text-sm font-medium ${
                      isCurrent || isCompleted
                        ? 'text-indigo-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                key={currentStep}
              >
                {children}
              </motion.div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <OrderSummary
                cart={cart}
                cartSummary={cartSummary}
                currentStep={currentStep}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}