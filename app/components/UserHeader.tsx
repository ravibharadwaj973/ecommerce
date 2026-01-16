'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingCart,
  User,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package,
  Heart,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function UserHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user: authUser } = useAuth();

  // Mock categories - replace with actual data from API
  const categories = [
    { id: 1, name: 'Electronics', slug: 'electronics' },
    { id: 2, name: 'Clothing', slug: 'clothing' },
    { id: 3, name: 'Home & Kitchen', slug: 'home-kitchen' },
    { id: 4, name: 'Books', slug: 'books' },
    { id: 5, name: 'Sports', slug: 'sports' },
  ];

  useEffect(() => {
    fetchUserData();
    fetchCartItems();
  }, []);

  // Use auth user if available
  useEffect(() => {
    if (authUser) {
      setUser(authUser);
    }
  }, [authUser]);

  const fetchUserData = async () => {
    if (authUser) {
      setUser(authUser);
      return;
    }
    // Mock user data
    setUser({ name: 'John Doe', email: 'john@example.com' });
  };

  const fetchCartItems = async () => {
    // Mock cart items
    setCartItems([{ id: 1, name: 'Sample Product', price: 29.99, quantity: 2 }]);
  };

  // Debounced search function
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      const delayDebounceFn = setTimeout(() => {
        performSearch(searchQuery);
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery]);

  const performSearch = async (query) => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}&limit=5`);
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.data.products);
        setShowSearchResults(true);
      } else {
        toast.error(data.message || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Error performing search');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      router.push('/products');
      return;
    }

    // Navigate to products page with search query
    const searchParams = new URLSearchParams();
    searchParams.set('search', searchQuery.trim());
    
    router.push(`/products?${searchParams.toString()}`);
    setShowSearchResults(false);
    setIsMenuOpen(false);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchResultClick = (product) => {
    router.push(`/products/${product._id}`);
    setSearchQuery('');
    setShowSearchResults(false);
    setIsMenuOpen(false);
  };

  const handleViewAllResults = () => {
    if (searchQuery.trim()) {
      const searchParams = new URLSearchParams();
      searchParams.set('search', searchQuery.trim());
      router.push(`/products?${searchParams.toString()}`);
      setShowSearchResults(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    } else if (e.key === 'Escape') {
      setShowSearchResults(false);
    }
  };

  const handleSearchBlur = (e) => {
    // Delay hiding to allow for click on results
    setTimeout(() => {
      setShowSearchResults(false);
    }, 200);
  };

  const handleSearchFocus = () => {
    if (searchQuery.trim().length > 2 && searchResults.length > 0) {
      setShowSearchResults(true);
    }
  };

  // Clear search when navigating away from products page
  useEffect(() => {
    if (!pathname.startsWith('/products')) {
      setSearchQuery('');
      setShowSearchResults(false);
    }
  }, [pathname]);

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = async () => {
    toast.success('Logging out...');
    logout();
    setIsProfileOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-indigo-600 text-white py-2 px-4">
        <div className="container mx-auto text-center text-sm">
          🎉 Free shipping on orders over $50! 
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900">ShopNow</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link 
              href="/products" 
              className={`font-medium transition-colors hover:text-indigo-600 ${
                pathname === '/products' ? 'text-indigo-600' : 'text-gray-700'
              }`}
            >
              Products
            </Link>
            
            {/* Categories Dropdown */}
            <div className="relative group">
                <button className="flex items-center space-x-1 font-medium text-gray-700 hover:text-indigo-600 transition-colors">
                <span>Categories</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {categories.map(category => (
                  <Link
                    key={category.id}
                    href={`/products/category/${category.slug}`}
                    className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link 
              href="/deals" 
              className={`font-medium transition-colors hover:text-indigo-600 ${
                pathname === '/deals' ? 'text-indigo-600' : 'text-gray-700'
              }`}
            >
              Deals
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyPress={handleKeyPress}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  placeholder="Search products by name, category, tags, features, colors..."
                  className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button 
                  type="submit"
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  {isSearching ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </button>
              </form>

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  <div className="p-2">
                    <div className="flex justify-between items-center px-3 py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-700">
                        Search Results
                      </span>
                      <button
                        onClick={handleViewAllResults}
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        View All
                      </button>
                    </div>
                    {searchResults.map((product) => (
                      <div
                        key={product._id}
                        onClick={() => handleSearchResultClick(product)}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      >
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                          {product.images?.[0]?.url ? (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                              <span className="text-xs text-gray-600">No image</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            ${product.salePrice || product.price}
                            {product.category?.name && (
                              <span className="ml-2 text-xs text-gray-500">
                                in {product.category.name}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <div className="relative">
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="relative p-2 text-gray-700 hover:text-indigo-600 transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {/* Cart Dropdown */}
              {isCartOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Shopping Cart</h3>
                    {cartItems.length > 0 ? (
                      <div className="space-y-3">
                        {cartItems.map(item => (
                          <div key={item.id} className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-200 rounded"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{item.name}</p>
                              <p className="text-sm text-gray-600">${item.price} x {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                        <div className="border-t pt-3">
                          <Link 
                            href="/cart" 
                            className="block w-full bg-indigo-600 text-white text-center py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                            onClick={() => setIsCartOpen(false)}
                          >
                            View Cart
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">Your cart is empty</p>
                    )}
                  </div>
                </div>
              )}
            </div>

<div className="relative">
  <button className="flex items-center space-x-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-100 transition-colors">
    <span>Subscription</span>
    <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-semibold text-white">
      PRO
    </span>
  </button>
</div>

            {/* Wishlist */}
            <Link
              href="/products/wishlist"
              className="p-2 text-gray-700 hover:text-indigo-600 transition-colors"
            >
              <Heart className="w-6 h-6" />
            </Link>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-2 text-gray-700 hover:text-indigo-600 transition-colors"
              >
                <User className="w-6 h-6" />
                <ChevronDown className="w-4 h-4" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  {user ? (
                    <>
                      <div className="p-3 border-b border-gray-200">
                        <p className="font-medium text-gray-900">{user.name || user.firstName}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        My Profile
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 transition-colors flex items-center space-x-2"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Package className="w-4 h-4" />
                        <span>My Orders</span>
                      </Link>
                      
                      {/* Show Vendor Dashboard link if user is vendor or admin */}
                      {(user.role === 'vendor' || user.role === 'admin') && (
                        <Link
                          href="/vendor/dashboard"
                          className="block px-4 py-2 text-blue-600 hover:bg-blue-50 transition-colors border-t border-gray-100"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          Vendor Dashboard
                        </Link>
                      )}
                      
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2 border-t border-gray-100"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <div className="p-2">
                      <Link
                        href="/login"
                        className="block w-full bg-indigo-600 text-white text-center py-2 rounded-lg hover:bg-indigo-700 transition-colors mb-2"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        className="block w-full text-center py-2 text-gray-700 hover:text-indigo-600 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Create Account
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-indigo-600 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyPress={handleKeyPress}
                placeholder="Search products..."
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button 
                type="submit"
                className="absolute right-3 top-2.5 text-gray-400 hover:text-indigo-600 transition-colors"
              >
                {isSearching ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/products"
                className="font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <div className="space-y-2">
                <p className="font-medium text-gray-700">Categories</p>
                {categories.map(category => (
                  <Link
                    key={category.id}
                    href={`/products/category/${category.slug}`}
                    className="block pl-4 py-1 text-gray-600 hover:text-indigo-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
              <Link
                href="/deals"
                className="font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Deals
              </Link>
              <Link
                href="/wishlist"
                className="font-medium text-gray-700 hover:text-indigo-600 transition-colors flex items-center space-x-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Heart className="w-4 h-4" />
                <span>Wishlist</span>
              </Link>
              
              {/* Show Vendor Dashboard in mobile menu if user is vendor/admin */}
              {user && (user.role === 'vendor' || user.role === 'admin') && (
                <Link
                  href="/vendor/dashboard"
                  className="font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center space-x-2 border-t border-gray-200 pt-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>Vendor Dashboard</span>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}