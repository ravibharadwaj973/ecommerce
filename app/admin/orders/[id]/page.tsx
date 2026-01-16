'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { Order } from '@/types/order';
import { 
  ArrowLeftIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  UserIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, checkAdminAccess } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const orderId = params.id as string;

  useEffect(() => {
    if (user && checkAdminAccess()) {
      fetchOrder();
    }
  }, [user, orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();

      if (data.success) {
        setOrder(data.data.order);
      } else {
        alert(data.message);
        router.push('/admin/orders');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      alert('Error fetching order');
      router.push('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: Order['status']) => {
    if (!order) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        setOrder(data.data.order);
        alert(`Order status updated to ${newStatus}`);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status');
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentStatusUpdate = async (newPaymentStatus: Order['paymentStatus']) => {
    if (!order) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/orders/${orderId}/payment-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });

      const data = await response.json();

      if (data.success) {
        setOrder(data.data.order);
        alert(`Payment status updated to ${newPaymentStatus}`);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Error updating payment status');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'PATCH',
      });

      const data = await response.json();

      if (data.success) {
        setOrder(data.data.order);
        alert('Order cancelled successfully');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Error cancelling order');
    } finally {
      setUpdating(false);
    }
  };

  const generateInvoice = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}/invoice`);
      const data = await response.json();

      if (data.success) {
        alert('Invoice generated successfully!');
        // In production, you would download the PDF
        // window.open(data.data.invoiceUrl, '_blank');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Error generating invoice');
    }
  };

  const getStatusSteps = () => {
    const steps = [
      { status: 'pending', label: 'Pending', icon: ClockIcon },
      { status: 'confirmed', label: 'Confirmed', icon: CheckCircleIcon },
      { status: 'shipped', label: 'Shipped', icon: TruckIcon },
      { status: 'delivered', label: 'Delivered', icon: CheckCircleIcon },
    ];

    const currentIndex = steps.findIndex(step => step.status === order?.status);
    
    return steps.map((step, index) => ({
      ...step,
      completed: index < currentIndex,
      current: index === currentIndex,
    }));
  };

  if (!user || !checkAdminAccess()) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Access denied. Admin role required.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Order not found.</p>
      </div>
    );
  }

  const statusSteps = getStatusSteps();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/orders"
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{order._id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-gray-600">
              Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
              {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={generateInvoice}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <DocumentTextIcon className="w-4 h-4 mr-2" />
            Generate Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status Timeline */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h2>
            
            {/* Status Steps */}
            <div className="flex justify-between mb-6">
              {statusSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.status} className="flex flex-col items-center flex-1">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      step.completed 
                        ? 'bg-green-100 text-green-600' 
                        : step.current 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-sm font-medium mt-2 ${
                      step.completed || step.current ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </span>
                    {index < statusSteps.length - 1 && (
                      <div className={`flex-1 h-1 mt-4 ${
                        step.completed ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Status Update Actions */}
            <div className="flex flex-wrap gap-2">
              {order.status !== 'cancelled' && (
                <>
                  {order.status !== 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate('confirmed')}
                      disabled={updating}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Mark as Confirmed
                    </button>
                  )}
                  {order.status !== 'shipped' && (
                    <button
                      onClick={() => handleStatusUpdate('shipped')}
                      disabled={updating}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      Mark as Shipped
                    </button>
                  )}
                  {order.status !== 'delivered' && (
                    <button
                      onClick={() => handleStatusUpdate('delivered')}
                      disabled={updating}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      Mark as Delivered
                    </button>
                  )}
                  <button
                    onClick={handleCancelOrder}
                    disabled={updating}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    Cancel Order
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  {typeof item.productId === 'object' && item.productId.images && item.productId.images.length > 0 ? (
                    <img
                      src={item.productId.images[0]}
                      alt={item.productId.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 text-sm">No Image</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {typeof item.productId === 'object' ? item.productId.name : 'Product'}
                    </h3>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-gray-600">${item.price} each</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Amount</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserIcon className="w-5 h-5 mr-2" />
              Customer Information
            </h2>
            {typeof order.userId === 'object' ? (
              <div className="space-y-2">
                <p className="font-medium">{order.userId.name}</p>
                <p className="text-gray-600">{order.userId.email}</p>
                {order.userId.phone && (
                  <p className="text-gray-600">{order.userId.phone}</p>
                )}
              </div>
            ) : (
              <p className="text-gray-600">Loading customer info...</p>
            )}
          </div>

          {/* Shipping Address */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPinIcon className="w-5 h-5 mr-2" />
              Shipping Address
            </h2>
            <div className="space-y-2">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p className="text-gray-600">{order.shippingAddress.address}</p>
              <p className="text-gray-600">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p className="text-gray-600">{order.shippingAddress.country}</p>
              {order.shippingAddress.phone && (
                <p className="text-gray-600">Phone: {order.shippingAddress.phone}</p>
              )}
            </div>
          </div>

          {/* Payment Status */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h2>
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                order.paymentStatus === 'paid' 
                  ? 'bg-green-100 text-green-800'
                  : order.paymentStatus === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : order.paymentStatus === 'failed'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {order.paymentStatus.toUpperCase()}
              </span>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => handlePaymentStatusUpdate('paid')}
                disabled={updating || order.paymentStatus === 'paid'}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Mark as Paid
              </button>
              <button
                onClick={() => handlePaymentStatusUpdate('failed')}
                disabled={updating || order.paymentStatus === 'failed'}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Mark as Failed
              </button>
              <button
                onClick={() => handlePaymentStatusUpdate('refunded')}
                disabled={updating || order.paymentStatus === 'refunded'}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Mark as Refunded
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}