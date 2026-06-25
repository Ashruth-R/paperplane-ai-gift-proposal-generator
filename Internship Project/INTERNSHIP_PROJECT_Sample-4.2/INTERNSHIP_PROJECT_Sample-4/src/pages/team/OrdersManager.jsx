import { useState, useMemo } from 'react';
import { ShoppingCart, CheckCircle, XCircle, Truck, Package, Clock, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';

export default function OrdersManager() {
  const { orders, updateOrderStatus, showToast, addNotification } = useApp();
  const [activeTab, setActiveTab] = useState('All');

  // Tabs for sorting orders
  const tabs = ['All', 'Pending', 'Approved & Packing', 'Rejected', 'Shipped'];

  // Filter orders by active tab
  const filteredOrders = useMemo(() => {
    if (activeTab === 'All') return orders || [];
    return (orders || []).filter(o => o.status === activeTab);
  }, [orders, activeTab]);

  const handleApproveOrder = (order) => {
    updateOrderStatus(order.id, 'Approved & Packing');
    
    // Notify Customer
    addNotification({
      role: 'customer',
      type: 'reminder',
      message: `Order Approved: Your bulk order ${order.id} is approved and our production team is packing it.`,
      link: '/customer/dashboard',
      customerEmail: order.customerEmail,
      companyName: order.companyName
    });

    // Notify Admin
    addNotification({
      role: 'admin',
      type: 'message',
      message: `Order Status: You approved and sent order ${order.id} (${order.companyName}) to packing.`,
      link: '/admin/orders'
    });

    showToast(`Order ${order.id} approved and sent to packing!`, 'success');
  };

  const handleRejectOrder = (order) => {
    updateOrderStatus(order.id, 'Rejected');

    // Notify Customer
    addNotification({
      role: 'customer',
      type: 'alert',
      message: `Action Required: Your bulk order request ${order.id} was rejected. Please review details.`,
      link: '/customer/dashboard',
      customerEmail: order.customerEmail,
      companyName: order.companyName
    });

    // Notify Admin
    addNotification({
      role: 'admin',
      type: 'alert',
      message: `Order Status: You rejected order request ${order.id} for ${order.companyName}.`,
      link: '/admin/orders'
    });

    showToast(`Order ${order.id} rejected.`, 'error');
  };

  const handleShipOrder = (order) => {
    updateOrderStatus(order.id, 'Shipped');

    // Notify Customer
    addNotification({
      role: 'customer',
      type: 'alert',
      message: `Order Shipped: Your bulk order ${order.id} has been shipped. Track your shipment.`,
      link: '/customer/dashboard',
      customerEmail: order.customerEmail,
      companyName: order.companyName
    });

    // Notify Admin
    addNotification({
      role: 'admin',
      type: 'reminder',
      message: `Order Dispatch: Order ${order.id} for ${order.companyName} has been marked as shipped.`,
      link: '/admin/orders'
    });

    showToast(`Order ${order.id} marked as Shipped!`, 'success');
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Approved & Packing':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Rejected':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'Shipped':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-50">Customer Orders</h1>
        <p className="text-surface-400 text-sm mt-1">Review bulk purchase requests, approve items for production packing, or dispatch shipments</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.06] gap-2 overflow-x-auto no-scrollbar">
        {tabs.map(tab => {
          const count = tab === 'All' 
            ? (orders || []).length 
            : (orders || []).filter(o => o.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                activeTab === tab
                  ? 'border-brand-500 text-brand-400 bg-brand-500/5'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <span>{tab}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === tab ? 'bg-brand-500/20 text-brand-300' : 'bg-white/5 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredOrders.map(order => (
          <div 
            key={order.id} 
            className="bg-[#ffffff] border border-[#000000] rounded-[24px] p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all duration-300 group"
          >
            {/* Info column */}
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-mono font-extrabold text-brand-600 bg-brand-50 border border-brand-200 px-3 py-1 rounded-lg">
                  {order.id}
                </span>
                <span className={`text-[10px] px-2.5 py-1 border rounded-full font-bold uppercase tracking-wider ${getStatusStyle(order.status)}`}>
                  {order.status}
                </span>
                <span className="text-xs text-slate-500">{order.orderDate}</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                  {order.customerName}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">{order.companyName}</p>
              </div>

              {/* Items List */}
              <div className="bg-[#ffffff] border border-[#000000] rounded-xl p-3.5 space-y-2 max-w-xl">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Ordered Items</p>
                <div className="divide-y divide-slate-200">
                  {order.items.map((item, idx) => (
                    <div key={item.id + '-' + idx} className="flex justify-between items-center py-2 text-xs text-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="text-base select-none">{item.emoji || '🎁'}</span>
                        <span className="font-semibold text-slate-800">{item.name}</span>
                      </div>
                      <div className="text-slate-600 font-medium">
                        {item.qty} units × {formatCurrency(item.price)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions & Cost Column */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between lg:justify-center gap-4 border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-6 flex-shrink-0">
              <div className="text-left lg:text-right">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Value</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(order.total)}</p>
              </div>

              {/* Operation Buttons */}
              <div className="flex flex-wrap gap-2">
                {order.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleRejectOrder(order)}
                      className="flex items-center gap-1.5 px-4 py-2 border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold rounded-xl transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleApproveOrder(order)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-500/25 hover:shadow-brand-500/40"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Pack & Approve</span>
                    </button>
                  </>
                )}
                
                {order.status === 'Approved & Packing' && (
                  <button
                    onClick={() => handleShipOrder(order)}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/15"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Ship Order</span>
                  </button>
                )}

                {order.status === 'Shipped' && (
                  <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl select-none">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Dispatched</span>
                  </div>
                )}

                {order.status === 'Rejected' && (
                  <div className="flex items-center gap-1.5 px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-450 text-xs font-bold rounded-xl select-none">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Rejected</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-[#ffffff] border border-[#000000] rounded-[24px] gap-3">
            <ShoppingCart className="w-12 h-12 text-slate-400 animate-pulse" />
            <p className="text-slate-600 font-semibold">No orders in this status</p>
          </div>
        )}
      </div>
    </div>
  );
}
