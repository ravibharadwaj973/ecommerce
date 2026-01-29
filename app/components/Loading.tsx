"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Truck,
  CreditCard,
  ShieldCheck,
  Star,
  Package,
  Heart,
  Zap,
  LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

// 1. Define the interface for the steps
interface LoadingStep {
  text: string;
  icon: LucideIcon;
  color: string;
}

interface LoadingPageProps {
  isLoading?: boolean;
}

const LoadingPage = ({ isLoading = true }: LoadingPageProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [icons, setIcons] = useState<{ x: number; y: number; scale: number; duration: number }[]>([]);

  const loadingSteps: LoadingStep[] = [
    { icon: ShoppingBag, text: "Browsing Products", color: "text-blue-500" },
    { icon: Star, text: "Checking Reviews", color: "text-yellow-500" },
    { icon: Package, text: "Preparing Items", color: "text-green-500" },
    { icon: CreditCard, text: "Securing Payment", color: "text-purple-500" },
    { icon: Truck, text: "Arranging Delivery", color: "text-orange-500" },
    { icon: ShieldCheck, text: "Final Checks", color: "text-red-500" },
  ];

  // COMBINED EFFECT: Handle mounting and animations
  useEffect(() => {
    setIsClient(true);
    
    // Generate icons only once on mount
    const newIcons = [...Array(15)].map(() => ({
      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
      y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
      scale: Math.random() * 0.5 + 0.5,
      duration: Math.random() * 10 + 10,
    }));
    setIcons(newIcons);

    if (!isLoading) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 1));
    }, 50);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % loadingSteps.length);
    }, 800);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [isLoading, loadingSteps.length]); // Combined to avoid order issues

  // Extract variables for rendering
  const step = loadingSteps[currentStep] || loadingSteps[0];
  const Icon = step.icon;

  // CONDITIONAL RETURN MUST BE LAST
  if (!isLoading) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 z-50 flex items-center justify-center overflow-hidden"
      >
        {/* Floating Icons - Only render on client to avoid window.innerWidth errors */}
        {isClient && (
          <div className="absolute inset-0 pointer-events-none">
       {icons.map((config, i) => (
        <motion.div
          key={i}
          className="absolute text-white/10"
          initial={{
            x: config.x,
            y: config.y,
            scale: config.scale,
          }}
          animate={{
            y: [null, config.y - 100, config.y + 100],
            rotate: [0, 360],
          }}
          transition={{
            duration: config.duration,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <ShoppingBag size={24} />
        </motion.div>
      ))}
          </div>
        )}

        <div className="relative z-10 text-center px-4 w-full">
          {/* Main Logo Section */}
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 flex items-center justify-center mb-8"
            >
              <ShoppingBag className="w-10 h-10 text-white" />
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">
              Shop<span className="text-purple-400">Ease</span>
            </h1>
            <p className="text-lg text-gray-300 mb-12">
              Premium Shopping Experience
            </p>
          </div>

          {/* Steps Animation */}
          <div className="max-w-md mx-auto mb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center space-x-4 p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className={step.color}
                >
                  <Icon size={32} />
                </motion.div>
                <span className="text-white text-lg font-medium">
                  {step.text}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Loading experience...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                animate={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoadingPage;
