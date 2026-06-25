import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ShoppingBag, ShoppingCart, Gift, MessageSquare, RotateCcw,
  FileText, PlusCircle, Palette, CheckSquare, Image, Factory,
  Truck, TrendingUp, ChevronDown, ChevronRight,
  ChevronLeft, Users, LogOut, Wand2, Package, Calendar, UploadCloud,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ROLES, ROLE_LABELS, NAV_LINKS } from '../../utils/constants';


const iconMap = {
  LayoutDashboard, ShoppingBag, ShoppingCart, Gift, MessageSquare, RotateCcw,
  FileText, PlusCircle, Palette, CheckSquare, Image, Factory,
  Truck, TrendingUp, Users, Wand2, Package, Calendar, UploadCloud,
};


const roleColors = {
  customer: 'from-emerald-600 to-teal-500',
  admin: 'from-brand-600 to-brand-400',
  designer: 'from-pink-600 to-rose-400',
  production: 'from-orange-600 to-amber-400',
  dispatch: 'from-cyan-600 to-blue-400',
  sales: 'from-violet-600 to-brand-400',
};

export default function Sidebar({ mobile = false, onClose }) {
  const { activeRole, sidebarCollapsed, toggleSidebar, signOut } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = NAV_LINKS[activeRole] || [];
  const collapsed = !mobile && sidebarCollapsed;

  const handleNav = (path) => {
    navigate(path);
    if (mobile && onClose) onClose();
  };

  return (
    <motion.aside 
      layout
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`flex flex-col framer-glass transition-all duration-300 z-40 ${collapsed ? 'w-[72px]' : 'w-[260px]'} ${mobile ? 'h-full rounded-none border-r border-white/[0.05]' : 'h-[calc(100vh-32px)] my-4 ml-4 rounded-[24px]'}`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-5 py-5 border-b border-white/[0.04] ${collapsed ? 'justify-center px-2' : ''}`}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center flex-shrink-0 shadow-glow">
          <Gift className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
            <p className="text-white font-extrabold text-sm leading-tight tracking-tight">PaperPlane</p>
            <p className="text-brand-400 text-[10px] font-bold uppercase tracking-widest">AI Proposals</p>
          </motion.div>
        )}
        {!mobile && (
          <button
            onClick={toggleSidebar}
            className={`ml-auto w-6 h-6 rounded-md flex items-center justify-center text-surface-500 hover:text-white hover:bg-white/10 transition-colors ${collapsed ? 'hidden' : ''}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 no-scrollbar">
        {!collapsed && (
          <p className="px-2 mb-3 text-[10px] font-bold text-surface-500 uppercase tracking-widest">Navigation</p>
        )}
        <div className="flex flex-col gap-1">
          {navLinks.map(link => {
            const Icon = iconMap[link.icon] || FileText;
            const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
            return (
              <button
                key={link.path}
                onClick={() => handleNav(link.path)}
                title={collapsed ? link.label : undefined}
                className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 w-full text-left overflow-hidden group ${isActive ? 'text-brand-300' : 'text-surface-400 hover:text-white hover:bg-white/[0.04]'} ${collapsed ? 'justify-center' : ''}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-brand-500/10 rounded-xl border border-brand-500/20"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-brand-400 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                  </motion.div>
                )}
                <Icon className={`w-4 h-4 flex-shrink-0 relative z-10 ${isActive ? 'text-brand-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'group-hover:scale-110 transition-transform'}`} />
                {!collapsed && <span className="truncate relative z-10">{link.label}</span>}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom */}
      <div className={`px-4 py-4 border-t border-white/[0.04] flex flex-col gap-1 ${collapsed ? 'items-center px-2' : ''}`}>
        {collapsed && (
          <button onClick={toggleSidebar} className="w-10 h-10 rounded-xl flex items-center justify-center text-surface-500 hover:text-white hover:bg-white/10 transition-colors mb-2">
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
        <button onClick={signOut} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-rose-400/80 hover:bg-rose-500/10 hover:text-rose-300 hover:shadow-[inset_0_0_0_1px_rgba(244,63,94,0.2)] transition-all w-full ${collapsed ? 'justify-center px-0' : ''}`} title={collapsed ? 'Sign Out' : undefined}>
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </motion.aside>
  );
}
