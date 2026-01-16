'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Home, 
  ShoppingBag, 
  Star,
  PartyPopper, // Changed from Confetti
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import ReactConfetti from 'react-confetti'; // Renamed import

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(true);
  const [playSound, setPlaySound] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [step, setStep] = useState(0);

  const orderNumber = searchParams.get('order') || 'ORD-123456';
  const totalAmount = searchParams.get('amount') || '0.00';

  // Animation steps
  const steps = [
    { icon: CheckCircle, text: 'Payment Verified', color: 'text-green-500' },
    { icon: Package, text: 'Order Confirmed', color: 'text-blue-500' },
    { icon: Truck, text: 'Preparing for Shipment', color: 'text-purple-500' },
  ];

useEffect(() => {
  // Play success sound
  const playSuccessSound = () => {
    try {
      const audio = new Audio('/sound/sound-1.wav'); // <-- Local file
      audio.volume = 0.7;

      audio.play().catch(err => {
        console.log("Cannot autoplay. Waiting for user interaction.");
        document.addEventListener("click", () => audio.play(), { once: true });
      });

    } catch (error) {
      console.log('Sound error:', error);
      playBeepSound();
    }
  };

  const playBeepSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.log('Beep sound failed:', e);
    }
  };

  playSuccessSound();

  // Simulate fetching order details
  const timer = setTimeout(() => {
    setOrderDetails({
      number: orderNumber,
      total: parseFloat(totalAmount),
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      items: 3,
    });
  }, 1000);

  const stepTimer = setInterval(() => {
    setStep(prev => prev < steps.length - 1 ? prev + 1 : prev);
  }, 800);

  const confettiTimer = setTimeout(() => {
    setShowConfetti(false);
  }, 5000);

  return () => {
    clearTimeout(timer);
    clearInterval(stepTimer);
    clearTimeout(confettiTimer);
  };
}, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1 }}
          className="absolute -top-20 -right-20 w-40 h-40 bg-green-200 rounded-full opacity-20"
        />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-200 rounded-full opacity-20"
        />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="absolute top-1/2 left-1/4 w-32 h-32 bg-purple-200 rounded-full opacity-20"
        />
      </div>

      {/* Confetti - using renamed import */}
      {showConfetti && (
        <ReactConfetti
          width={typeof window !== 'undefined' ? window.innerWidth : 1200}
          height={typeof window !== 'undefined' ? window.innerHeight : 800}
          recycle={false}
          numberOfPieces={200}
          gravity={0.2}
        />
      )}

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Main Success Card */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-green-100"
          >
            {/* Success Icon */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 200,
                  delay: 0.2
                }}
                className="relative inline-block"
              >
                <CheckCircle className="w-32 h-32 text-green-500 mx-auto mb-4" />
                
                {/* Pulsing Ring */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                  className="absolute inset-0 w-32 h-32 bg-green-200 rounded-full -z-10 mx-auto"
                />
              </motion.div>

              {/* Success Text */}
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"
              >
                Order Completed! 🎉
              </motion.h1>
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-gray-600 mb-2"
              >
                Thank you for your purchase!
              </motion.p>
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-500"
              >
                Your order has been confirmed and is being processed.
              </motion.p>
            </div>

            {/* Order Number */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 mb-6 border border-green-200"
            >
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Order Number</p>
                <p className="text-2xl font-mono font-bold text-gray-900 tracking-wider">
                  {orderNumber}
                </p>
              </div>
            </motion.div>

            {/* Progress Steps */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mb-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                What's Next?
              </h3>
              
              <div className="space-y-4">
                {steps.map((stepItem, index) => {
                  const Icon = stepItem.icon;
                  const isCompleted = index <= step;
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className={`flex items-center space-x-4 p-4 rounded-xl border-2 transition-all duration-300 ${
                        isCompleted 
                          ? 'bg-green-50 border-green-200 shadow-sm' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className={`relative ${isCompleted ? 'scale-110' : 'scale-100'} transition-transform duration-300`}>
                        <Icon className={`w-8 h-8 ${isCompleted ? stepItem.color : 'text-gray-400'}`} />
                        {isCompleted && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1"
                          >
                            <Sparkles className="w-4 h-4 text-yellow-500" />
                          </motion.div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <p className={`font-medium transition-colors duration-300 ${
                          isCompleted ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {stepItem.text}
                        </p>
                        <p className="text-sm text-gray-500">
                          {isCompleted ? 'Completed' : 'Pending...'}
                        </p>
                      </div>
                      
                      {isCompleted && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Order Summary */}
            {orderDetails && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                className="bg-gray-50 rounded-2xl p-6 mb-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Amount</p>
                    <p className="font-semibold text-gray-900">₹{orderDetails.total.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Items</p>
                    <p className="font-semibold text-gray-900">{orderDetails.items} items</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Estimated Delivery</p>
                    <p className="font-semibold text-gray-900">
                      {orderDetails.estimatedDelivery.toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment</p>
                    <p className="font-semibold text-green-600">Completed</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <Link
                href="/"
                className="bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <Home className="w-5 h-5" />
                <span>Back to Home</span>
              </Link>
              
              <Link
                href="/my-orders"
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>View Orders</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Additional Features */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="bg-white rounded-3xl shadow-lg p-6 border border-blue-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              While You Wait... ⏳
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-4 rounded-xl bg-orange-50 border border-orange-200 cursor-pointer"
              >
                <Star className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="font-medium text-gray-900">Rate Products</p>
                <p className="text-sm text-gray-600">Share your experience</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-4 rounded-xl bg-purple-50 border border-purple-200 cursor-pointer"
              >
                <ShoppingBag className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="font-medium text-gray-900">Continue Shopping</p>
                <p className="text-sm text-gray-600">Discover more products</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-4 rounded-xl bg-green-50 border border-green-200 cursor-pointer"
              >
                <Truck className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="font-medium text-gray-900">Track Order</p>
                <p className="text-sm text-gray-600">Real-time updates</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Floating Celebration Elements */}
          <AnimatePresence>
            {showConfetti && (
              <>
                <motion.div
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{ 
                    scale: 1, 
                    rotate: 360,
                    y: [0, -20, 0]
                  }}
                  exit={{ scale: 0 }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="fixed top-20 right-10 text-yellow-500"
                >
                  <PartyPopper className="w-8 h-8" /> {/* Changed from Confetti */}
                </motion.div>
                
                <motion.div
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{ 
                    scale: 1, 
                    rotate: -360,
                    y: [0, -30, 0]
                  }}
                  exit={{ scale: 0 }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: 0.5
                  }}
                  className="fixed bottom-20 left-10 text-pink-500"
                >
                  <Sparkles className="w-6 h-6" />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Sound Toggle (for accessibility) */}
      <button
        onClick={() => setPlaySound(!playSound)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-900 transition-colors"
      >
        {playSound ? '🔊' : '🔇'}
      </button>
    </div>
  );
}