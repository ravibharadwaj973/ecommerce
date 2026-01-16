'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, CreditCard, Package, Truck, CheckCircle, Clock, X, Download, RotateCcw, Eye } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function OrderCard({ order, onOrderUpdate }) {
  const [cancelling, setCancelling] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return Clock;
      case 'confirmed': return Clock;
      case 'shipped': return Truck;
      case 'delivered': return CheckCircle;
      case 'cancelled': return X;
      default: return Package;
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canCancel = () => {
    return ['pending', 'confirmed'].includes(order.status);
  };

  const canReorder = () => {
    return ['delivered', 'cancelled'].includes(order.status);
  };

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    setCancelling(true);
    
    try {
      const response = await fetch(`/api/order/${order._id}/cancel`, {
        method: 'PATCH',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Order cancelled successfully');
        onOrderUpdate?.(); // Refresh orders list
      } else {
        toast.error(data.message || 'Failed to cancel order');
      }
    } catch (error) {
      toast.error('Error cancelling order');
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadInvoice = async () => {
    setDownloading(true);
    try {
      // Simulate invoice download
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create and download invoice
      const invoiceContent = `
        INVOICE
        Order #: ${order.id || order._id}
        Date: ${new Date(order.createdAt).toLocaleDateString()}
        Total: ₹${order.totalAmount}
        
        Thank you for your purchase!
      `;
      
      const blob = new Blob([invoiceContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${order.id || order._id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      toast.error('Failed to download invoice');
    } finally {
      setDownloading(false);
    }
  };

  const handleReorder = async () => {
    try {
      // Add all items from order to cart
      for (const item of order.items) {
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemId: item.productId,
            size: item.size || 'One Size',
            quantity: item.quantity
          })
        });

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message);
        }
      }
      
      toast.success('All items added to cart!');
      // Navigate to cart
      window.location.href = '/cart';
    } catch (error) {
      toast.error('Failed to reorder items');
    }
  };

  const StatusIcon = getStatusIcon(order.status);
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      {/* Order Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Order #{order.id?.substring(0, 8) || order._id?.substring(0, 8)}
            </h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
              <StatusIcon className="w-3 h-3 inline mr-1" />
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Package className="w-4 h-4" />
              <span>{totalItems} item{totalItems > 1 ? 's' : ''}</span>
            </div>
            <div className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
              Payment: {order.paymentStatus}
            </div>
          </div>
        </div>
        
        <div className="mt-2 sm:mt-0 text-right">
          <p className="text-xl font-bold text-gray-900">₹{order.totalAmount.toFixed(2)}</p>
          <Link 
            href={`/orders/${order._id}`}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center justify-end space-x-1"
          >
            <Eye className="w-4 h-4" />
            <span>View Details</span>
          </Link>
        </div>
      </div>

      {/* Order Items Preview */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center space-x-2 mb-3">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {order.shippingAddress?.city}, {order.shippingAddress?.state}
          </span>
        </div>
        
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {order.items.slice(0, 4).map((item, index) => (
            <div key={index} className="flex-shrink-0">
              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-8 h-8 text-gray-400 m-4" />
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1 truncate w-16">
                {item.name}
              </p>
              <p className="text-xs text-gray-500">
                Qty: {item.quantity}
              </p>
            </div>
          ))}
          {order.items.length > 4 && (
            <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg">
              <span className="text-sm text-gray-600">
                +{order.items.length - 4} more
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-t border-gray-200 pt-4 mt-4 flex flex-wrap gap-2">
        {canCancel() && (
          <button 
            onClick={handleCancelOrder}
            disabled={cancelling}
            className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-1 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            <span>{cancelling ? 'Cancelling...' : 'Cancel Order'}</span>
          </button>
        )}
        
        {canReorder() && (
          <button 
            onClick={handleReorder}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center space-x-1"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reorder All</span>
          </button>
        )}
        
        {order.status === 'shipped' && (
          <button className="text-green-600 hover:text-green-700 text-sm font-medium">
            Track Order
          </button>
        )}
        
        <button 
          onClick={handleDownloadInvoice}
          disabled={downloading}
          className="text-gray-600 hover:text-gray-700 text-sm font-medium flex items-center space-x-1 disabled:opacity-50 ml-auto"
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? 'Downloading...' : 'Invoice'}</span>
        </button>
      </div>
    </motion.div>
  );
}