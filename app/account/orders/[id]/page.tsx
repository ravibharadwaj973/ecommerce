// app/account/orders/[id]/page.jsx
'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ArrowLeft,
  MapPin,
  CreditCard,
  User
} from 'lucide-react';
import Link from 'next/link';
import { useOrders } from '@/context/OrdersContext';
import { useAuth } from '@/context/AuthContext';

export default function OrderDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const { currentOrder, fetchOrderById, cancelOrder, loading } = useOrders();

  useEffect(() => {
    if (user && params.id) {
      fetchOrderById(params.id);
    }
  }, [user, params.id]);

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    const result = await cancelOrder(params.id);
    if (!result.success) {
      // Error handled in context
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      confirmed: CheckCircle,
      shipped: Truck,
      delivered: CheckCircle,
      cancelled: XCircle
    };
    return icons[status] || Clock;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      confirmed: 'text-blue-600 bg-blue-50 border-blue-200',
      shipped: 'text-purple-600 bg-purple-50 border-purple-200',
      delivered: 'text-green-600 bg-green-50 border-green-200',
      cancelled: 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6 h-64"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
          <Link href="/account/orders" className="text-indigo-600 hover:text-indigo-500">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(currentOrder.status);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              href="/account/orders"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Orders</span>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Order #{currentOrder.orderNumber || currentOrder._id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-gray-600">
                Placed on {new Date(currentOrder.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${getStatusColor(currentOrder.status)}`}>
            <StatusIcon className="w-4 h-4" />
            <span className="font-medium capitalize">{currentOrder.status}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h2>
              <div className="space-y-4">
                {['pending', 'confirmed', 'shipped', 'delivered'].map((status, index) => {
                  const isCompleted = 
                    status === 'pending' ||
                    (status === 'confirmed' && ['confirmed', 'shipped', 'delivered'].includes(currentOrder.status)) ||
                    (status === 'shipped' && ['shipped', 'delivered'].includes(currentOrder.status)) ||
                    (status === 'delivered' && currentOrder.status === 'delivered');

                  const isCurrent = currentOrder.status === status;

                  return (
                    <div key={status} className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                      <div className={`flex-1 ${isCurrent ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {currentOrder.items?.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-white rounded border border-gray-200 overflow-hidden flex-shrink-0">
                      {item.productId?.images?.[0] ? (
                        <img
                          src={item.productId.images[0]}
                          alt={item.productId.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-gray-400 m-2" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {item.productId?.name || 'Product Not Available'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity} • ${item.price?.toFixed(2)} each
                      </p>
                      {item.size && (
                        <p className="text-sm text-gray-600">Size: {item.size}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${((item.price || 0) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Order Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
              
              {/* Payment Status */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600">Payment Status:</span>
                <span className={`font-medium ${
                  currentOrder.paymentStatus === 'paid' ? 'text-green-600' : 
                  currentOrder.paymentStatus === 'failed' ? 'text-red-600' : 
                  'text-yellow-600'
                }`}>
                  {currentOrder.paymentStatus.charAt(0).toUpperCase() + currentOrder.paymentStatus.slice(1)}
                </span>
              </div>

              {/* Shipping Address */}
              <div className="mb-4">
                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">Shipping Address</span>
                </div>
                <div className="text-sm text-gray-700">
                  <p>{currentOrder.shippingAddress?.street}</p>
                  <p>{currentOrder.shippingAddress?.city}, {currentOrder.shippingAddress?.state} {currentOrder.shippingAddress?.zipCode}</p>
                  <p>{currentOrder.shippingAddress?.country}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                  <User className="w-4 h-4" />
                  <span className="font-medium">Customer</span>
                </div>
                <div className="text-sm text-gray-700">
                  <p>{currentOrder.userId?.name}</p>
                  <p>{currentOrder.userId?.email}</p>
                  {currentOrder.userId?.phone && <p>{currentOrder.userId.phone}</p>}
                </div>
              </div>
            </motion.div>

            {/* Price Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Price Summary</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${currentOrder.totalAmount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">
                    {currentOrder.totalAmount > 50 ? 'FREE' : '$9.99'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">
                    ${(currentOrder.totalAmount * 0.08).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">
                    ${(currentOrder.totalAmount + (currentOrder.totalAmount > 50 ? 0 : 9.99) + (currentOrder.totalAmount * 0.08)).toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            {currentOrder.status === 'pending' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-lg border border-gray-200 p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Actions</h2>
                <button
                  onClick={handleCancelOrder}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Cancel Order
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}