// components/LoadingPage.jsx
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Truck, 
  CreditCard, 
  ShieldCheck, 
  Star,
  Package,
  Heart,
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

const LoadingPage = ({ isLoading = true }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const loadingSteps = [
    { icon: ShoppingBag, text: "Browsing Products", color: "text-blue-500" },
    { icon: Star, text: "Checking Reviews", color: "text-yellow-500" },
    { icon: Package, text: "Preparing Items", color: "text-green-500" },
    { icon: CreditCard, text: "Securing Payment", color: "text-purple-500" },
    { icon: Truck, text: "Arranging Delivery", color: "text-orange-500" },
    { icon: ShieldCheck, text: "Final Checks", color: "text-red-500" },
  ];

  useEffect(() => {
    if (!isLoading) return;

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 50);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % loadingSteps.length);
    }, 800);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 z-50 flex items-center justify-center"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating Icons */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-white/10"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: Math.random() * 0.5 + 0.5,
              }}
              animate={{
                y: [null, -100, 100],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <ShoppingBag size={24} />
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 text-center">
          {/* Main Logo/Title */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20,
              duration: 1 
            }}
            className="mb-8"
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20"
            >
              <motion.div
                animate={{ 
                  rotate: 360,
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <ShoppingBag className="w-10 h-10 text-white" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* App Title */}
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold text-white mb-2"
          >
            Shop<span className="text-purple-400">Ease</span>
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-lg text-gray-300 mb-12"
          >
            Premium Shopping Experience
          </motion.p>

          {/* Loading Steps */}
          <div className="max-w-md mx-auto mb-8">
            <motion.div
              key={currentStep}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center space-x-4 p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className={loadingSteps[currentStep].color}
              >
                {loadingSteps[currentStep].icon && 
                  <loadingSteps[currentStep].icon size={32} />
                }
              </motion.div>
              <span className="text-white text-lg font-medium">
                {loadingSteps[currentStep].text}
              </span>
            </motion.div>
          </div>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Loading your experience...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full relative"
              >
                {/* Shimmer effect on progress bar */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: [-100, 300] }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            </div>
          </div>

          {/* Features Grid */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto"
          >
            {[
              { icon: ShieldCheck, text: "Secure", color: "text-green-400" },
              { icon: Zap, text: "Fast", color: "text-yellow-400" },
              { icon: Heart, text: "Loved", color: "text-pink-400" },
              { icon: Truck, text: "Free Delivery", color: "text-blue-400" },
            ].map((feature, index) => (
              <motion.div
                key={feature.text}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  delay: 1 + index * 0.1,
                  type: "spring",
                  stiffness: 200
                }}
                whileHover={{ 
                  scale: 1.05,
                  y: -5
                }}
                className="flex flex-col items-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <motion.div
                  animate={{ 
                    y: [0, -5, 0],
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    delay: index * 0.2,
                    ease: "easeInOut"
                  }}
                  className={feature.color}
                >
                  <feature.icon size={24} />
                </motion.div>
                <span className="text-white text-sm mt-2">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Loading Dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex justify-center space-x-2 mt-8"
          >
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-3 h-3 bg-purple-400 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-pink-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/3 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoadingPage;