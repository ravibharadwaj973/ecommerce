'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { 
  CurrencyDollarIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface VendorEarnings {
  overview: {
    totalEarnings: number;
    availableBalance: number;
    pendingPayout: number;
    lastPayout: number;
  };
  transactions: Array<{
    _id: string;
    type: 'sale' | 'payout' | 'refund';
    amount: number;
    description: string;
    status: 'completed' | 'pending' | 'failed';
    createdAt: string;
    orderId?: string;
  }>;
  payoutSchedule: {
    nextPayout: string;
    payoutMethod: string;
    minimumPayout: number;
  };
}

export default function VendorEarnings() {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<VendorEarnings | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    if (user) {
      fetchVendorEarnings();
    }
  }, [user, selectedPeriod]);

  const fetchVendorEarnings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/vendor/earnings?period=${selectedPeriod}`);
      const data = await response.json();

      if (data.success) {
        setEarnings(data.data);
      }
    } catch (error) {
      console.error('Error fetching vendor earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'sale': return CurrencyDollarIcon;
      case 'payout': return BanknotesIcon;
      case 'refund': return ClockIcon;
      default: return CurrencyDollarIcon;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'sale': return 'text-green-600 bg-green-100';
      case 'payout': return 'text-blue-600 bg-blue-100';
      case 'refund': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-800 bg-green-100';
      case 'pending': return 'text-yellow-800 bg-yellow-100';
      case 'failed': return 'text-red-800 bg-red-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Earnings & Payouts</h1>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Earnings Overview */}
      {!loading && earnings && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-500">
                <CurrencyDollarIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(earnings.overview.totalEarnings)}
                </p>
                <p className="text-sm text-gray-500">All time</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-500">
                <BanknotesIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(earnings.overview.availableBalance)}
                </p>
                <p className="text-sm text-gray-500">Ready for payout</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-500">
                <ClockIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Payout</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(earnings.overview.pendingPayout)}
                </p>
                <p className="text-sm text-gray-500">In processing</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-500">
                <CheckCircleIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Last Payout</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(earnings.overview.lastPayout)}
                </p>
                <p className="text-sm text-gray-500">Most recent</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payout Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payout Schedule</h3>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : earnings ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Next Payout Date</p>
                <p className="font-semibold text-gray-900">
                  {formatDate(earnings.payoutSchedule.nextPayout)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payout Method</p>
                <p className="font-semibold text-gray-900">
                  {earnings.payoutSchedule.payoutMethod}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Minimum Payout</p>
                <p className="font-semibold text-gray-900">
                  {formatCurrency(earnings.payoutSchedule.minimumPayout)}
                </p>
              </div>
              <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Request Payout
              </button>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No payout information available
            </div>
          )}
        </div>

        {/* Transaction History */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : earnings && earnings.transactions.length > 0 ? (
            <div className="space-y-4">
              {earnings.transactions.map((transaction) => {
                const Icon = getTransactionIcon(transaction.type);
                return (
                  <div key={transaction._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${getTransactionColor(transaction.type)}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(transaction.createdAt)}
                          {transaction.orderId && ` • Order #${transaction.orderId.slice(-8)}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'refund' ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {transaction.type === 'refund' ? '-' : ''}{formatCurrency(transaction.amount)}
                      </p>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">
              No transactions found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}