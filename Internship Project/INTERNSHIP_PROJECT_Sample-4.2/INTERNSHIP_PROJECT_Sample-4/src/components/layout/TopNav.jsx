import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Bell, Search, ChevronRight, Menu, X, CheckCheck, AlertTriangle, Clock, MessageSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatRelativeTime } from '../../utils/formatters';

const mockSearchResults = [
  { label: 'Customer Overview', path: '/customer/dashboard' },
  { label: 'Online Gift Order', path: '/customer/store' },
  { label: 'Custom Gift Form', path: '/customer/custom-form' },
  { label: 'Branding Upload Portal', path: '/customer/personalize' },
  { label: 'Design Approvals', path: '/customer/design-approvals' },
  { label: 'Inventory', path: '/customer/inventory' },
  { label: 'Occasion Calendar', path: '/customer/calendar' },
  { label: 'Return Request', path: '/customer/returns' },
  { label: 'Corporate Enquiry Portal', path: '/customer/enquiries' },
];

function getBreadcrumbs(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  const crumbs = [{ label: 'Home', path: '/' }];
  let built = '';
  parts.forEach(part => {
    built += `/${part}`;
    crumbs.push({
      label: part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '),
      path: built,
    });
  });
  return crumbs;
}

const notifIcons = {
  alert: AlertTriangle,
  reminder: Clock,
  message: MessageSquare,
};

const notifColors = {
  alert: 'text-rose-600 bg-rose-50 border border-rose-100',
  reminder: 'text-amber-600 bg-amber-50 border border-amber-100',
  message: 'text-brand-600 bg-brand-50 border border-brand-100',
};

export default function TopNav({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const { notifications, unreadCount, markRead, markAllRead, activeUser, signOut, tickets, proposals, orders } = useApp();
  const crumbs = getBreadcrumbs(location.pathname);
  const notifRef = useRef(null);
  const searchRef = useRef(null);
  const profileRef = useRef(null);

  // Dynamic search results
  const dynamicSearchResults = useMemo(() => {
    const results = [...mockSearchResults];
    const isCustomer = activeUser?.role === 'customer';
    
    // Add tickets
    (tickets || []).forEach(t => {
      results.push({
        label: `Ticket: ${t.id} - ${t.subject}`,
        path: isCustomer ? '/customer/enquiries' : '/admin/enquiries',
        state: { searchTicketId: t.id }
      });
    });

    // Add proposals
    (proposals || []).forEach(p => {
      results.push({
        label: `Proposal: ${p.id} - ${p.clientName || p.customerName || 'Client'}`,
        path: isCustomer ? '/customer/dashboard' : '/admin/proposals',
        state: { searchProposalId: p.id }
      });
    });

    // Add orders
    (orders || []).forEach(o => {
      results.push({
        label: `Order: ${o.id} - ${o.customerName || 'Customer'}`,
        path: isCustomer ? '/customer/dashboard' : '/admin/orders',
        state: { searchOrderId: o.id }
      });
    });
    
    return results;
  }, [tickets, proposals, orders, activeUser]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = searchQuery
    ? dynamicSearchResults.filter(r => r.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : mockSearchResults;

  return (
    <header className="h-16 lg:mt-4 lg:mx-4 lg:rounded-[20px] bg-surface-950/40 backdrop-blur-3xl border-b border-white/[0.04] lg:border lg:shadow-glass flex items-center px-5 gap-4 sticky top-0 lg:top-4 z-30 transition-all duration-300">
      {/* Mobile hamburger */}
      <button onClick={onMenuClick} className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:text-white hover:bg-surface-700 transition-colors">
        <Menu className="w-5 h-5" />
      </button>

      {/* Breadcrumbs */}
      <nav className="hidden md:flex items-center gap-1 flex-1 min-w-0">
        {crumbs.map((crumb, i) => (
          <div key={crumb.path} className="flex items-center gap-1 min-w-0">
            {i > 0 && <ChevronRight className="w-3 h-3 text-surface-600 flex-shrink-0" />}
            <Link
              to={crumb.path}
              className={`text-sm truncate transition-colors ${i === crumbs.length - 1 ? 'text-surface-100 font-medium' : 'text-surface-500 hover:text-surface-300'}`}
            >
              {crumb.label}
            </Link>
          </div>
        ))}
      </nav>
      <div className="flex-1 md:hidden" />

      {/* Search */}
      <div className="relative" ref={searchRef}>
        <button
          onClick={() => { setSearchOpen(true); }}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/[0.02] border border-white/[0.05] shadow-inner rounded-xl text-surface-400 text-sm hover:border-brand-500/30 hover:bg-white/[0.04] transition-all w-56"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search...</span>
          <kbd className="ml-auto text-[10px] bg-white/[0.05] border border-white/[0.1] px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
        </button>
        <button onClick={() => setSearchOpen(!searchOpen)} className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:text-white hover:bg-surface-700 transition-colors">
          <Search className="w-4 h-4" />
        </button>
        {searchOpen && (
          <div className="absolute right-0 top-12 w-80 bg-surface-950 border border-surface-700 shadow-xl z-50 animate-fade-in overflow-hidden rounded-2xl">
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-surface-700">
              <Search className="w-4 h-4 text-surface-400" />
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search proposals, pages..."
                className="flex-1 bg-transparent text-sm text-surface-100 placeholder-surface-500 outline-none"
              />
              {searchQuery && <X className="w-4 h-4 text-surface-400 cursor-pointer" onClick={() => setSearchQuery('')} />}
            </div>
            <div className="py-1 max-h-60 overflow-y-auto">
              {filtered.map((r, i) => (
                <button
                  key={i}
                  onClick={() => { navigate(r.path, { state: r.state }); setSearchOpen(false); setSearchQuery(''); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-surface-200 hover:bg-surface-900 transition-colors text-left"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-surface-500" />
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="relative w-9 h-9 rounded-lg flex items-center justify-center text-surface-400 hover:text-white hover:bg-surface-700 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-12 w-96 bg-surface-950 border border-surface-700 shadow-xl z-50 animate-slide-in-right overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-700">
              <div>
                <h3 className="text-surface-100 font-semibold text-sm">Notifications</h3>
                {unreadCount > 0 && <p className="text-surface-400 text-xs">{unreadCount} unread</p>}
              </div>
              <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 transition-colors">
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto divide-y divide-surface-700">
              {notifications.map(notif => {
                const Icon = notifIcons[notif.type] || Bell;
                const colorClass = notifColors[notif.type] || notifColors.message;
                return (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-surface-900 ${!notif.readStatus ? 'bg-brand-50' : ''}`}
                    onClick={() => {
                      markRead(notif.id);
                      if (notif.link) { navigate(notif.link); setNotifOpen(false); }
                    }}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-relaxed ${notif.readStatus ? 'text-surface-400' : 'text-surface-200'}`}>{notif.message}</p>
                      <p className="text-xs text-surface-500 mt-1">{formatRelativeTime(notif.timestamp)}</p>
                    </div>
                    {!notif.readStatus && <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-1.5" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Avatar */}
      <div className="relative" ref={profileRef}>
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex items-center gap-2 hover:bg-surface-800/60 p-1 rounded-xl transition-colors text-left"
          title="View profile details"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
            {activeUser?.avatar?.startsWith('http') ? (
              <img src={activeUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              activeUser?.name?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-medium text-surface-200 leading-tight">{activeUser?.name}</p>
            <p className="text-xs text-surface-500 capitalize">{activeUser?.role}</p>
          </div>
        </button>

        {profileOpen && (
          <div className="absolute right-0 top-12 w-72 bg-surface-950 border border-surface-700 shadow-xl z-50 animate-slide-in-right p-4 overflow-hidden rounded-2xl">
            <div className="flex items-center gap-3 border-b border-surface-700 pb-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
                {activeUser?.avatar?.startsWith('http') ? (
                  <img src={activeUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  activeUser?.name?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-surface-100 truncate">{activeUser?.name}</p>
                <p className="text-xs text-brand-600 font-semibold uppercase tracking-wider">{activeUser?.role}</p>
              </div>
            </div>
            <div className="space-y-2.5">
              <div>
                <p className="text-[10px] text-surface-500 uppercase tracking-wider font-semibold">Company</p>
                <p className="text-xs text-surface-200 font-medium">{activeUser?.company || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] text-surface-500 uppercase tracking-wider font-semibold">Department</p>
                <p className="text-xs text-surface-200 font-medium">{activeUser?.department || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] text-surface-500 uppercase tracking-wider font-semibold">Company Email ID</p>
                <p className="text-xs text-surface-200 font-medium select-all">{activeUser?.email || 'N/A'}</p>
              </div>
              {activeUser?.password && (
                <div>
                  <p className="text-[10px] text-surface-500 uppercase tracking-wider font-semibold">Portal Password</p>
                  <p className="text-xs text-brand-700 font-mono select-all bg-surface-900 px-2 py-1 rounded border border-surface-700 mt-0.5">{activeUser.password}</p>
                </div>
              )}
            </div>
            
            {/* Sign Out Button */}
            <div className="mt-4 pt-4 border-t border-surface-700">
              <button 
                onClick={() => { setProfileOpen(false); signOut(); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-xl text-sm font-bold transition-colors border border-rose-500/20 hover:border-rose-500/40"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
