import { useState, useMemo } from 'react';
import { ShoppingCart, Star, Package, Filter, Search, X, Minus, Plus, Trash2, CreditCard, SlidersHorizontal, ChevronDown, Check } from 'lucide-react';
import { productCategories } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import Button from '../../components/common/Button';
import { useApp } from '../../context/AppContext';

const SORT_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Top Rated', value: 'rating' },
];

export default function GiftOrder() {
  const { showToast, addNotification, activeUser, addOrderedItems, addOrder, products } = useApp();
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 6000]);
  const [showFilters, setShowFilters] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const filtered = useMemo(() => {
    let items = (products || []).filter(p => {
      const catOk = activeCategory === 'All' || p.category === activeCategory;
      const searchOk = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
      const priceOk = p.price >= priceRange[0] && p.price <= priceRange[1];
      return catOk && searchOk && priceOk;
    });
    if (sortBy === 'price_asc') items = [...items].sort((a, b) => a.price - b.price);
    else if (sortBy === 'price_desc') items = [...items].sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') items = [...items].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return items;
  }, [products, activeCategory, search, sortBy, priceRange]);

  const addToCart = (product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
    showToast(`${product.name} added to cart!`, 'success');
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const handleCheckout = () => {
    setCheckoutLoading(true);
    setTimeout(() => {
      const firstItem = cart[0];
      const qty = firstItem?.qty || 50;
      const name = firstItem?.name || 'Leather Notebooks';
      const userName = activeUser?.name || 'Priya Sharma';

      addNotification({
        role: 'customer',
        type: 'reminder',
        message: `Order Confirmed: Your bulk order for ${qty} ${name} has been confirmed.`,
        link: '/customer/store',
        customerEmail: activeUser?.email
      });

      addNotification({
        role: 'admin',
        type: 'message',
        message: `New Order Received: Got new order from ${userName} for ${qty} ${name}.`,
        link: '/admin/orders'
      });

      const company = activeUser?.company || 'TechNova Solutions';
      addOrder(userName, company, activeUser?.email, cart, cartTotal);
      addOrderedItems(cart, activeUser?.email);
      setCheckoutLoading(false);
      setCartOpen(false);
      setCart([]);
      showToast('🎉 Order placed! Our team will contact you within 24 hours.', 'success');
    }, 1800);
  };

  return (
    <div className="flex flex-col gap-8 relative pb-12">
      {/* Isolated Premium CSS styles */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }

        .icon-float {
          animation: float 4s ease-in-out infinite;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          display: inline-block;
        }

        .premium-card {
          position: relative;
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04);
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .premium-card::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 24px;
          padding: 1.5px;
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.05), rgba(99, 102, 241, 0.05), rgba(59, 130, 246, 0.05));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .premium-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 30px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(99, 102, 241, 0.15);
          background: #ffffff;
        }

        .premium-card:hover::after {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.4), rgba(99, 102, 241, 0.4), rgba(59, 130, 246, 0.4));
        }

        .premium-card:hover .icon-float {
          transform: scale(1.12) rotate(-2deg);
        }

        .premium-tag {
          height: 24px;
          display: inline-flex;
          align-items: center;
          padding: 0 10px;
          border-radius: 9999px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          font-size: 10px;
          font-weight: 600;
          color: #64748b;
          transition: all 0.2s ease;
        }

        .premium-tag:hover {
          background: rgba(168, 85, 247, 0.08);
          border-color: rgba(168, 85, 247, 0.25);
          color: #c084fc;
          transform: translateY(-1px);
        }

        .premium-rating-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 9999px;
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.2);
          color: #fbbf24;
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.05);
          font-weight: 750;
          font-size: 11px;
          backdrop-filter: blur(8px);
          transition: all 0.2s ease;
        }

        .premium-rating-badge:hover {
          background: rgba(245, 158, 11, 0.15);
          border-color: rgba(245, 158, 11, 0.4);
          box-shadow: 0 0 15px rgba(245, 158, 11, 0.2);
          transform: translateY(-1px);
        }

        .premium-btn-cart {
          position: relative;
          background: linear-gradient(135deg, #a855f7, #6366f1);
          color: #ffffff;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 15px -3px rgba(168, 85, 247, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .premium-btn-cart:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 0 25px rgba(168, 85, 247, 0.5), 0 4px 15px -3px rgba(99, 102, 241, 0.4);
          background: linear-gradient(135deg, #b55fe6, #7477f8);
        }

        .premium-btn-cart-disabled {
          background: rgba(239, 68, 68, 0.06) !important;
          border: 1px solid rgba(239, 68, 68, 0.25) !important;
          color: #f87171 !important;
          box-shadow: none !important;
          cursor: not-allowed;
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Online Gift Order</h1>
          <p className="text-slate-400 text-sm mt-1">Browse and order premium corporate gifts with bulk pricing</p>
        </div>
        <div className="flex items-center gap-2 md:ml-auto mr-4 mb-1">
          <button 
            onClick={() => setCartOpen(true)} 
            className="relative flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-[#ffffff] px-5 py-2.5 rounded-[14px] text-sm font-semibold shadow-lg hover:shadow-brand-500/25 hover:shadow-brand-500/40 transition-all duration-300 border border-white/10"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>View Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[11px] font-black rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 border-2 border-slate-950 z-30">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search + Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-3 flex-1 bg-[#ffffff] border border-[#000000] rounded-[20px] px-5 py-3 focus-within:border-brand-500/50 focus-within:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all duration-300">
          <Search className="w-4.5 h-4.5 text-[#000000] flex-shrink-0" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search gifts by name or description..." 
            className="flex-1 bg-transparent text-sm text-[#000000] placeholder-slate-500 outline-none" 
          />
          {search && <X className="w-4 h-4 text-slate-500 hover:text-[#000000] cursor-pointer transition-colors" onClick={() => setSearch('')} />}
        </div>
        
        <div className="flex gap-2.5">
          <div className="relative">
            <button 
              onClick={() => setSortOpen(!sortOpen)} 
              className="flex items-center gap-2 bg-[#ffffff] border border-[#000000] rounded-[20px] px-5 py-3 text-sm text-[#000000] hover:bg-slate-50 transition-all duration-300"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#000000]" />
              <span>{SORT_OPTIONS.find(o => o.value === sortBy)?.label}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#000000]" />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-14 bg-[#ffffff] border border-[#000000] rounded-xl shadow-2xl z-20 w-48 overflow-hidden animate-fade-in">
                {SORT_OPTIONS.map(opt => (
                  <button 
                    key={opt.value} 
                    onClick={() => { setSortBy(opt.value); setSortOpen(false); }} 
                    className={`w-full flex items-center gap-2 px-4 py-3 text-sm transition-colors ${sortBy === opt.value ? 'text-brand-700 bg-brand-100/50' : 'text-[#000000] hover:bg-slate-50'}`}
                  >
                    {sortBy === opt.value && <Check className="w-3.5 h-3.5 text-brand-700" />}
                    <span className={sortBy !== opt.value ? 'ml-5' : ''}>{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className={`flex items-center gap-2 border rounded-[20px] px-5 py-3 text-sm font-medium transition-all duration-300 ${showFilters ? 'bg-brand-600 border-brand-500 text-[#ffffff] shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40' : 'bg-[#ffffff] border-[#000000] text-[#000000] hover:bg-slate-50'}`}
          >
            <Filter className={`w-4 h-4 ${showFilters ? 'text-[#ffffff]' : 'text-[#000000]'}`} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-[#ffffff] border border-[#000000] rounded-[24px] p-6 animate-slide-up shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-3.5">Category</p>
              <div className="flex flex-wrap gap-2">
                {productCategories.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setActiveCategory(cat)} 
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 border ${activeCategory === cat ? 'bg-brand-600 text-[#ffffff] border-brand-500 shadow-md shadow-brand-500/25 hover:shadow-brand-500/40' : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-[#000000] hover:bg-slate-100 hover:border-brand-500'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">Price Range</p>
                <span className="text-brand-700 text-sm font-extrabold">{formatCurrency(priceRange[0])} — {formatCurrency(priceRange[1])}</span>
              </div>
              <div className="flex gap-4">
                <input type="range" min="0" max="6000" value={priceRange[0]} onChange={e => setPriceRange([+e.target.value, priceRange[1]])} className="flex-1 accent-brand-500" />
                <input type="range" min="0" max="6000" value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], +e.target.value])} className="flex-1 accent-brand-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{filtered.length} product{filtered.length !== 1 ? 's' : ''} found</p>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 py-4">
        {filtered.map(product => {
          const inCart = cart.find(i => i.id === product.id);
          return (
            <div key={product.id} className="premium-card group flex flex-col overflow-hidden">
              
              {/* Product Image Section (40% height) */}
              <div className="h-48 bg-gradient-to-b from-surface-950/60 to-surface-900/40 flex items-center justify-center relative overflow-hidden select-none border-b border-white/[0.02]">
                {/* Soft glowing background orb behind icon */}
                <div className={`absolute w-28 h-28 rounded-full bg-gradient-to-tr ${product.bgColor} blur-2xl opacity-50 group-hover:scale-130 transition-all duration-500`} />
                
                {/* Extra radial background glow to match premium theme */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)] pointer-events-none" />

                {/* Emojis floating illustration */}
                <span className="text-5xl z-10 icon-float select-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)] filter">
                  {product.emoji}
                </span>

                {/* Category Badge (top left) */}
                <span className="absolute top-4.5 left-4.5 bg-slate-900/90 backdrop-blur-md text-[9px] font-extrabold text-indigo-300 px-3 py-1 rounded-full border border-white/5 uppercase tracking-widest">
                  {product.category}
                </span>

                {/* Out of Stock Overlay */}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] flex items-center justify-center z-20">
                    <span className="text-[10px] font-extrabold tracking-wider uppercase text-rose-400 bg-rose-950/80 px-3.5 py-1.5 rounded-full border border-rose-800/80 shadow-lg shadow-rose-950/50">
                      Out of Stock
                    </span>
                  </div>
                )}

                {/* In Cart Indicator checkmark */}
                {inCart && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border border-emerald-400">
                    <Check className="w-3.5 h-3.5 text-white font-black" />
                  </div>
                )}
              </div>

              {/* Content Details */}
              <div className="p-6 flex flex-col flex-1">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-brand-600 group-hover:to-indigo-600 transition-all">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Feature Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4.5">
                  {product.tags.slice(0, 3).map(t => (
                    <span 
                      key={t} 
                      className="inline-flex items-center px-2 py-1 rounded-md bg-slate-50 text-[10px] font-medium text-slate-600 border border-slate-100"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mr-1.5" />
                      {t}
                    </span>
                  ))}
                </div>

                {/* Price & Rating Section */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mb-4.5">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-extrabold text-slate-900">₹{product.price.toLocaleString('en-IN')}</span>
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider ml-1">/ unit</span>
                    </div>
                  </div>

                  {/* Rating Display Badge */}
                  <div className="premium-rating-badge">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{(product.rating || 0).toFixed(1)}</span>
                  </div>
                </div>

                {/* Add to Cart Actions */}
                {inCart ? (
                  <div className="flex items-center gap-2 w-full mt-auto">
                    <div className="flex items-center justify-between bg-[#ffffff] border border-[#000000] rounded-[14px] px-3.5 py-2 flex-1 shadow-inner animate-fade-in">
                      <button 
                        onClick={() => updateQty(product.id, -1)} 
                        className="text-[#000000] hover:text-slate-600 transition-colors p-1"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[#000000] text-sm font-extrabold">{inCart.qty}</span>
                      <button 
                        onClick={() => updateQty(product.id, 1)} 
                        className="text-[#000000] hover:text-slate-600 transition-colors p-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(product.id)} 
                      className="w-11 h-11 flex items-center justify-center border border-rose-950/60 bg-rose-950/15 text-rose-450 hover:bg-rose-900/30 hover:text-rose-300 rounded-[14px] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    disabled={!product.inStock}
                    onClick={() => addToCart(product)}
                    className={`premium-btn-cart w-full py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 mt-auto ${
                      product.inStock 
                        ? '' 
                        : 'premium-btn-cart-disabled'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Package className="w-12 h-12 text-slate-600 animate-pulse" />
          <p className="text-slate-400 text-lg font-medium">No products found</p>
          <p className="text-slate-550 text-sm">Try adjusting your filters or search query</p>
          <Button variant="ghost" onClick={() => { setSearch(''); setActiveCategory('All'); setPriceRange([0, 6000]); }}>Reset Filters</Button>
        </div>
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <div className="relative z-50 w-full max-w-md bg-surface-900 h-full flex flex-col shadow-2xl animate-slide-in-right">
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-700/50">
              <div><h2 className="text-surface-100 font-bold text-lg">Your Cart</h2><p className="text-surface-400 text-xs">{cartCount} item{cartCount !== 1 ? 's' : ''} selected</p></div>
              <button onClick={() => setCartOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:text-white hover:bg-surface-700 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center">
                  <ShoppingCart className="w-12 h-12 text-surface-600" />
                  <p className="text-surface-400">Your cart is empty</p>
                  <Button variant="ghost" onClick={() => setCartOpen(false)}>Continue Shopping</Button>
                </div>
              ) : cart.map(item => (
                <div key={item.id} className="flex gap-3 bg-surface-800 border border-surface-700/40 rounded-xl p-3">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.bgColor} flex items-center justify-center flex-shrink-0`}><span className="text-2xl">{item.emoji}</span></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-surface-200 text-sm font-medium truncate">{item.name}</p>
                    <p className="text-brand-400 text-sm font-bold">{formatCurrency(item.price)}/unit</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex items-center gap-1.5 bg-surface-900 border border-surface-600 rounded-lg px-2 py-0.5">
                        <button onClick={() => updateQty(item.id, -1)} className="text-surface-400 hover:text-white"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="text-surface-100 text-xs font-bold w-6 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="text-surface-400 hover:text-white"><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                      <span className="text-surface-400 text-xs ml-auto">{formatCurrency(item.price * item.qty)}</span>
                      <button onClick={() => removeFromCart(item.id)} className="text-rose-400 hover:text-rose-300"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="px-5 py-4 border-t border-surface-700/50">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-surface-300 font-medium">Estimated Total</p>
                  <p className="text-brand-400 font-bold text-xl">{formatCurrency(cartTotal)}</p>
                </div>
                <p className="text-surface-500 text-xs mb-3 text-center">Final pricing will be confirmed by our team based on quantity and branding.</p>
                <Button fullWidth loading={checkoutLoading} icon={CreditCard} onClick={handleCheckout}>Submit Order Request</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
