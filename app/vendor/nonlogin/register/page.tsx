"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import ProgressBar from "../../../components/ProgressBar";
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  BuildingStorefrontIcon,
  UserIcon,
  PhoneIcon,
  CalendarIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export default function VendorAccountRegister() {
  const searchParams = useSearchParams();
  const isLoginMode = searchParams.get("mode") === "login";

  const { user, login, register } = useAuth();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState(isLoginMode ? "login" : "register");
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    dateOfBirth: "",
  });

  useEffect(() => {
    if (!user) return; // ⛔ NOT LOGGED IN

    if (user.role === "vendor" || user.role === "admin") {
      router.push("/vendor/nonlogin/register/store");
    } else {
      router.push("//vendor/nonlogin/register");
    }
  }, [user, loading, router]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      if (mode === "register") {
        const result = await register({
          ...form,
          role: "vendor",
          registrationStep: 1,
        });

        if (result.success) {
          setSuccessMessage("Account created successfully! Redirecting...");
          setTimeout(() => {
            router.push("/vendor/register/nonlogin/store");
          }, 1500);
        } else {
          setError(result.message);
        }
      } else {
        const result = await login(form.email, form.password);
        if (result.success) {
          setSuccessMessage("Login successful! Redirecting...");
          router.push("/vendor/nonlogin/register/store");
        } else {
          setError(result.message);
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Progress Bar */}
        <ProgressBar currentStep={1} totalSteps={3} />

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden max-w-4xl mx-auto">
          {/* Success Message */}
          {successMessage && (
            <div className="p-4 bg-emerald-50 border-b border-emerald-200">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-emerald-600 mr-2" />
                <p className="text-emerald-700 font-medium">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Mode Toggle */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex rounded-lg bg-gray-100 p-1 max-w-md mx-auto">
              <button
                onClick={() => setMode("register")}
                className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  mode === "register"
                    ? "bg-white shadow text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Register
              </button>
              <button
                onClick={() => setMode("login")}
                className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  mode === "login"
                    ? "bg-white shadow text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Login
              </button>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Form */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {mode === "register"
                    ? "Create Vendor Account"
                    : "Welcome Back"}
                </h2>
                <p className="text-gray-600 mb-8">
                  {mode === "register"
                    ? "Start your journey as a vendor on our platform"
                    : "Sign in to your vendor dashboard"}
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {mode === "register" && (
                    <>
                      {/* Name */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Full Name *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            name="name"
                            placeholder="John Smith"
                            required
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Phone Number
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <PhoneIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            name="phone"
                            placeholder="+1 (555) 123-4567"
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                          />
                        </div>
                      </div>

                      {/* Date of Birth */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Date of Birth
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <CalendarIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            name="dateOfBirth"
                            type="date"
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Email - Common for both */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Password - Common for both */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LockClosedIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        onChange={handleChange}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me - Only for login */}
                  {mode === "login" && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="remember-me"
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="remember-me"
                          className="ml-2 text-sm text-gray-700"
                        >
                          Remember me
                        </label>
                      </div>
                      <Link
                        href="/vendor/forgot-password"
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin h-5 w-5 mr-3 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        {mode === "register"
                          ? "Creating Account..."
                          : "Signing In..."}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        {mode === "register"
                          ? "Continue to Store Details"
                          : "Sign in to Dashboard"}
                        <ArrowRightIcon className="ml-2 h-5 w-5" />
                      </div>
                    )}
                  </button>
                </form>

                {/* Switch mode */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    {mode === "register"
                      ? "Already have an account?"
                      : "Don't have an account?"}{" "}
                    <button
                      onClick={() => {
                        setMode(mode === "register" ? "login" : "register");
                        setError("");
                        setSuccessMessage("");
                      }}
                      className="font-semibold text-blue-600 hover:text-blue-800"
                    >
                      {mode === "register" ? "Sign in here" : "Register here"}
                    </button>
                  </p>
                </div>
              </div>

              {/* Right Column - Info */}
              <div className="lg:pl-8 lg:border-l border-gray-200">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                      <BuildingStorefrontIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Why Join as a Vendor?
                      </h3>
                      <p className="text-sm text-gray-600">
                        Start selling with powerful tools
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                          <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <h4 className="font-medium text-gray-900">
                          Zero Setup Fees
                        </h4>
                        <p className="text-sm text-gray-600">
                          Start selling with no upfront costs
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                          <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <h4 className="font-medium text-gray-900">
                          Real-time Analytics
                        </h4>
                        <p className="text-sm text-gray-600">
                          Track sales and customer insights
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                          <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <h4 className="font-medium text-gray-900">
                          Secure Payments
                        </h4>
                        <p className="text-sm text-gray-600">
                          Get paid securely on time
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                          <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <h4 className="font-medium text-gray-900">
                          Dedicated Support
                        </h4>
                        <p className="text-sm text-gray-600">
                          24/7 support for your business
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mt-8 grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-lg font-bold text-gray-900">
                        10k+
                      </div>
                      <div className="text-xs text-gray-600">Vendors</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-lg font-bold text-gray-900">
                        ₹500Cr+
                      </div>
                      <div className="text-xs text-gray-600">Sales</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-lg font-bold text-gray-900">99%</div>
                      <div className="text-xs text-gray-600">Satisfaction</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
