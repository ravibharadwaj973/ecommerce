'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  CogIcon,
  CubeIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/vendor/afterlogin/dashboard', icon: HomeIcon },
  { name: 'Products', href: '/vendor/afterlogin/products', icon: ShoppingBagIcon },
  { name: 'Orders', href: '/vendor/afterlogin/orders', icon: CubeIcon },
  { name: 'Analytics', href: '/vendor/afterlogin/analytics', icon: ChartBarIcon },
  { name: 'Earnings', href: '/vendor/afterlogin/earning', icon: CurrencyDollarIcon },
  { name: 'Settings', href: '/vendor/afterlogin/setting', icon: CogIcon },
];

export default function VendorSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="flex flex-col h-full">
        {/* Logo/Brand */}
        <div className="flex items-center justify-center h-16 shadow-sm bg-blue-600">
          <h1 className="text-xl font-bold text-white">Vendor Panel</h1>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            Vendor Dashboard v1.0
          </div>
        </div>
      </div>
    </div>
  );
}