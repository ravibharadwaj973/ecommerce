'use client';
import { Package, ShoppingBag, ArrowRight, Clock, CheckCircle, X } from 'lucide-react';
import Link from 'next/link';

export default function EmptyOrders({ activeTab }) {
  const getEmptyStateConfig = (tab) => {
    switch (tab) {
      case 'upcoming':
        return {
          icon: Clock,
          title: 'No Upcoming Orders',
          description: 'You don\'t have any orders that are pending, confirmed, or shipped.',
          action: {
            text: 'Start Shopping',
            href: '/products'
          }
        };
      case 'delivered':
        return {
          icon: CheckCircle,
          title: 'No Delivered Orders',
          description: 'You haven\'t received any orders yet. Your delivered orders will appear here.',
          action: {
            text: 'Track Orders',
            href: '/my-orders?tab=upcoming'
          }
        };
      case 'cancelled':
        return {
          icon: X,
          title: 'No Cancelled Orders',
          description: 'Great! You haven\'t cancelled any orders.',
          action: {
            text: 'View Active Orders',
            href: '/my-orders?tab=upcoming'
          }
        };
      default:
        return {
          icon: Package,
          title: 'No Orders Yet',
          description: 'You haven\'t placed any orders yet. Discover our products and make your first purchase!',
          action: {
            text: 'Start Shopping',
            href: '/products'
          }
        };
    }
  };

  const config = getEmptyStateConfig(activeTab);
  const Icon = config.icon;

  return (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <Icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {config.title}
        </h3>
        <p className="text-gray-600 mb-6">
          {config.description}
        </p>
        <Link
          href={config.action.href}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors inline-flex items-center space-x-2"
        >
          <span>{config.action.text}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}