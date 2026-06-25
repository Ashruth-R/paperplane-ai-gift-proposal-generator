import { useState } from 'react';
import { MessageSquare, Clock, CheckCircle, XCircle, Search, Filter, ChevronDown, User, Building2, Calendar, FileText, AlertTriangle, Send, ShieldAlert, Award, Inbox } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate, formatRelativeTime, formatCurrency } from '../../utils/formatters';

const STATUS_CFG = {
  Open:          { icon: Inbox,         color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-200/60',    bar: 'bg-blue-500'    },
  'In Progress': { icon: Clock,         color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200/60',   bar: 'bg-amber-500'   },
  Resolved:      { icon: CheckCircle,   color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200/60', bar: 'bg-emerald-500' },
  Closed:        { icon: XCircle,       color: 'text-surface-300',   bg: 'bg-surface-800',   border: 'border-surface-700/60',   bar: 'bg-surface-500'   },
};

const PRIORITY_CFG = {
  High:   'text-rose-700 bg-rose-50 border border-rose-200/60',
  Medium: 'text-amber-700 bg-amber-50 border border-amber-200/60',
  Low:    'text-emerald-700 bg-emerald-50 border border-emerald-200/60',
};

const ALL_STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];

export default function AdminEnquiries() {
  const { tickets, updateTicketStatus, addTicketMessage, showToast, addNotification } = useApp();
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilter]   = useState('All');
  const [selectedId, setSelectedId] = useState(null);
  const [assignedTo, setAssignedTo] = useState('');
  const [savingId, setSavingId]     = useState(null);
  const [chatMessage, setChatMessage] = useState('');

  const filtered = (tickets || []).filter(t => {
    const matchSearch = !search ||
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.type.toLowerCase().includes(search.toLowerCase()) ||
      (t.orderDetails?.company && t.orderDetails.company.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = filterStatus === 'All' || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const selected = (tickets || []).find(t => t.id === selectedId);

  const openDetail = (tkt) => {
    setSelectedId(tkt.id);
    setAssignedTo(tkt.assignedTo || 'Unassigned');
  };

  const handleUpdateStatus = (tkt, newStatus) => {
    setSavingId(tkt.id);
    setTimeout(() => {
      updateTicketStatus(tkt.id, newStatus, assignedTo);
      
      // Notify customer of ticket status update
      addNotification({
        role: 'customer',
        type: 'message',
        message: `Support Ticket: Your enquiry ${tkt.id} status was updated to ${newStatus}.`,
        link: '/customer/enquiries',
        customerEmail: tkt.customerEmail,
        companyName: tkt.companyName
      });

      showToast(`Enquiry ${tkt.id} status updated to ${newStatus}`, 'success');
      setSavingId(null);
    }, 600);
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !selected) return;
    addTicketMessage(selected.id, { sender: 'admin', text: chatMessage, timestamp: new Date().toISOString() });
    setChatMessage('');
    
    // Notify customer
    addNotification({
      role: 'customer',
      type: 'message',
      message: `New message from coordinator regarding ${selected.id}.`,
      link: '/customer/enquiries',
      customerEmail: selected.customerEmail,
      companyName: selected.companyName
    });
  };

  const handleAssignCoordinator = (tkt) => {
    setSavingId(tkt.id);
    setTimeout(() => {
      updateTicketStatus(tkt.id, tkt.status, assignedTo);
      
      // Notify customer of coordinator assignment
      addNotification({
        role: 'customer',
        type: 'message',
        message: `Support Ticket: Coordinator ${assignedTo} has been assigned to your request ${tkt.id}.`,
        link: '/customer/enquiries',
        customerEmail: tkt.customerEmail,
        companyName: tkt.companyName
      });

      showToast(`Coordinator ${assignedTo} assigned to Enquiry ${tkt.id}`, 'success');
      setSavingId(null);
    }, 600);
  };

  const counts = ALL_STATUSES.reduce((acc, s) => ({ ...acc, [s]: (tickets || []).filter(t => t.status === s).length }), {});

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-surface-50">Corporate Enquiries & Tickets</h1>
          <p className="text-surface-400 text-sm mt-1">Manage corporate gift requests, pricing quotes, and support tickets submitted by customers</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-surface-800 border border-surface-700/50 rounded-xl text-xs font-semibold text-surface-300">
            {(tickets || []).length} Total
          </div>
          <div className="px-3 py-1.5 bg-blue-900/30 border border-blue-700/40 rounded-xl text-xs font-semibold text-blue-300">
            {counts['Open'] || 0} Open Enquiries
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {ALL_STATUSES.map(s => {
          const cfg = STATUS_CFG[s] || STATUS_CFG.Open;
          const Icon = cfg.icon;
          return (
            <button
              key={s}
              onClick={() => setFilter(filterStatus === s ? 'All' : s)}
              className={`flex flex-col gap-1.5 p-4 rounded-[20px] border transition-all text-left ${
                filterStatus === s
                  ? `${cfg.bg} ${cfg.border} ring-1 ring-inset ${cfg.border}`
                  : 'bg-surface-800 border border-surface-700/60 hover:border-brand-500/45 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${cfg.color}`} />
                <span className={`text-[11px] font-bold uppercase tracking-wider ${cfg.color}`}>{s}</span>
              </div>
              <span className="text-2xl font-black text-surface-100">{counts[s] || 0}</span>
            </button>
          );
        })}
      </div>

      {/* Search & Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search} 
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ticket ID, subject, company, or type..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#ffffff] border border-[#000000] rounded-xl text-sm text-slate-800 placeholder-slate-450 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
        <div className="relative">
          <select
            value={filterStatus} 
            onChange={e => setFilter(e.target.value)}
            className="appearance-none pl-3.5 pr-9 py-2.5 bg-[#ffffff] border border-[#000000] rounded-xl text-sm text-slate-800 focus:outline-none focus:border-brand-500 transition-colors"
          >
            <option value="All" className="text-slate-800 bg-[#ffffff]">All Statuses</option>
            {ALL_STATUSES.map(s => <option key={s} className="text-slate-800 bg-[#ffffff]">{s}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-800 pointer-events-none" />
        </div>
      </div>

      {/* Main split view */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        
        {/* Tickets List (Left 2 cols) */}
        <div className="xl:col-span-2 flex flex-col gap-3">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-[#ffffff] border border-[#000000] rounded-2xl gap-3">
              <MessageSquare className="w-12 h-12 text-slate-400 mb-1 animate-pulse" />
              <p className="text-slate-600 font-semibold text-sm">No corporate enquiries found</p>
              <p className="text-slate-550 text-xs">Try adjusting your search filters</p>
            </div>
          )}
          {filtered.map(tkt => {
            const cfg = STATUS_CFG[tkt.status] || STATUS_CFG.Open;
            const Icon = cfg.icon;
            const isActive = selectedId === tkt.id;
            const priorityClass = PRIORITY_CFG[tkt.priority] || PRIORITY_CFG.Low;

            return (
              <button
                key={tkt.id}
                onClick={() => openDetail(tkt)}
                className={`w-full text-left p-5 rounded-2xl border transition-all flex flex-col gap-3 ${
                  isActive
                    ? `${cfg.bg} ${cfg.border} ring-1 ring-inset ${cfg.border}`
                    : 'bg-[#ffffff] border-[#000000] shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3 w-full">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">{tkt.id}</span>
                      <span className="text-slate-650 text-[10px] select-none">·</span>
                      <span className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">{tkt.type}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 truncate">{tkt.subject}</h4>
                  </div>
                  
                  <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border flex-shrink-0 uppercase tracking-wide ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                    <Icon className="w-3 h-3" /> {tkt.status}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 text-xs w-full pt-1.5 border-t border-slate-200">
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${priorityClass}`}>
                    {tkt.priority}
                  </span>
                  <span className="text-slate-500 text-[11px]">{formatRelativeTime(tkt.updated)}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Details Panel (Right 3 cols) */}
        <div className="xl:col-span-3">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[450px] bg-[#ffffff] border border-[#000000] border-dashed rounded-2xl text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 font-semibold text-sm">Select an Enquiry Ticket</p>
              <p className="text-slate-500 text-xs mt-1">Choose a ticket from the left panel to view full specifications, custom gift requests, and respond.</p>
            </div>
          ) : (() => {
            const cfg = STATUS_CFG[selected.status] || STATUS_CFG.Open;
            const Icon = cfg.icon;
            const priorityClass = PRIORITY_CFG[selected.priority] || PRIORITY_CFG.Low;
            const hasOrderDetails = !!selected.orderDetails;

            return (
              <div className="bg-[#ffffff] border border-[#000000] rounded-2xl overflow-hidden shadow-sm flex flex-col">
                
                {/* Header panel */}
                <div className={`px-6 py-5 border-b ${cfg.border} ${cfg.bg} flex items-center justify-between gap-3`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${cfg.border} ${cfg.bg}`}>
                      <Icon className={`w-5 h-5 ${cfg.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-xs font-bold ${cfg.color}`}>{selected.id}</span>
                        <span className="text-slate-600 text-xs">·</span>
                        <span className="text-slate-500 text-xs font-medium">{selected.type}</span>
                      </div>
                      <h3 className="text-slate-900 text-base font-bold mt-0.5">{selected.subject}</h3>
                    </div>
                  </div>
                  <div className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                    {selected.status}
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-6 flex flex-col gap-6">
                  
                  {/* Priority and Assignment Row */}
                  <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Priority:</span>
                      <span className={`px-2.5 py-0.5 rounded border text-[10px] font-black uppercase ${priorityClass}`}>
                        {selected.priority}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Assigned Coordinator:</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={assignedTo}
                          onChange={e => setAssignedTo(e.target.value)}
                          placeholder="e.g. Ravi Kumar"
                          className="bg-[#ffffff] border border-[#000000] rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-brand-500 placeholder-slate-400"
                        />
                        <button
                          onClick={() => handleAssignCoordinator(selected)}
                          disabled={savingId === selected.id}
                          className="px-2.5 py-1 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-lg text-xs font-bold transition-all"
                        >
                          Assign
                        </button>
                      </div>
                    </div>
                  </div>                  {/* Customer Information */}
                  <div className="space-y-2.5">
                    <p className="text-[10px] uppercase font-black tracking-wider text-slate-500">Customer Profile</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <User className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Contact</p>
                          <p className="text-sm font-bold text-slate-900 mt-0.5">
                            {selected.orderDetails?.recipientName || 'Corporate Client'}
                          </p>
                          <p className="text-xs text-slate-600">
                            {selected.orderDetails?.recipientRole || 'Decision Maker'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <Building2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Company</p>
                          <p className="text-sm font-bold text-slate-900 mt-0.5">
                            {selected.orderDetails?.company || 'Corporate Partner'}
                          </p>
                          <p className="text-xs text-slate-600">
                            {selected.orderDetails?.industry || 'BFSI'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Custom Gift Order Details (If ticket has orderDetails) */}
                  {hasOrderDetails && (
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase font-black tracking-wider text-slate-500">Corporate Gift Specifications</p>
                      
                      <div className="bg-[#ffffff] border border-[#000000] rounded-xl p-4 space-y-4">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                            <p className="text-[9px] text-slate-500 uppercase tracking-wider">Quantity</p>
                            <p className="text-base font-black text-slate-900 mt-0.5">{selected.orderDetails.quantity}</p>
                            <p className="text-[9px] text-slate-600">units</p>
                          </div>
                          
                          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                            <p className="text-[9px] text-slate-500 uppercase tracking-wider">Unit Budget</p>
                            <p className="text-base font-black text-emerald-700 mt-0.5">{formatCurrency(selected.orderDetails.budget)}</p>
                            <p className="text-[9px] text-slate-650">per unit</p>
                          </div>
                          
                          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                            <p className="text-[9px] text-slate-500 uppercase tracking-wider">Total Value</p>
                            <p className="text-base font-black text-brand-700 mt-0.5">
                              {formatCurrency(selected.orderDetails.budget * selected.orderDetails.quantity)}
                            </p>
                            <p className="text-[9px] text-slate-650">estimated</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs border-t border-slate-200 pt-3.5">
                          <div className="space-y-1">
                            <span className="text-slate-500 font-bold uppercase tracking-wide text-[10px]">Occasion / Event</span>
                            <p className="text-slate-800 font-semibold">{selected.orderDetails.occasion}</p>
                          </div>
                          
                          <div className="space-y-1">
                            <span className="text-slate-500 font-bold uppercase tracking-wide text-[10px]">Branding Requirements</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selected.orderDetails.brandingReqs && selected.orderDetails.brandingReqs.length > 0 ? (
                                selected.orderDetails.brandingReqs.map(brand => (
                                  <span key={brand} className="px-2 py-0.5 bg-brand-950/45 border border-brand-900/30 text-brand-300 text-[9px] font-semibold rounded">
                                    {brand}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-500">None specified</span>
                              )}
                            </div>
                          </div>
                        </div>                        {selected.orderDetails.notes && (
                          <div className="border-t border-slate-200 pt-3">
                            <span className="text-slate-500 font-bold uppercase tracking-wide text-[10px]">Special Instructions</span>
                            <p className="text-slate-700 text-xs italic mt-1 bg-slate-55 p-3 rounded-lg border border-slate-200">
                              "{selected.orderDetails.notes}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Standard Support/General Message */}
                  {!hasOrderDetails && (
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase font-black tracking-wider text-slate-500">Enquiry Description</p>
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 leading-relaxed">
                        {selected.subject} — Coordinator review requested.
                      </div>
                    </div>
                  )}

                  {/* Chat Interface */}
                  <div className="space-y-2 mt-2 border-t border-slate-200 pt-6">
                    <p className="text-[10px] uppercase font-black tracking-wider text-slate-500 flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Communication History
                    </p>
                    <div className="flex flex-col gap-4 h-[300px] bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-inner">
                      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2">
                        {(selected.chatHistory || []).map((msg, i) => (
                          <div key={i} className={`flex flex-col ${msg.sender === 'admin' ? 'items-end' : 'items-start'}`}>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{msg.sender === 'admin' ? 'You' : 'Customer'}</span>
                            <div className={`px-3 py-2 rounded-xl text-sm max-w-[85%] shadow-sm ${msg.sender === 'admin' ? 'bg-brand-600 text-[#ffffff]' : 'bg-[#ffffff] border border-slate-200 text-slate-800'}`}>
                              {msg.text}
                            </div>
                            <span className="text-[9px] text-slate-650 mt-1">{formatDate(msg.timestamp, { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        ))}
                        {(!selected.chatHistory || selected.chatHistory.length === 0) && (
                          <p className="text-center text-slate-500 text-xs mt-10">No messages yet. Send a message to start the conversation.</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input 
                          value={chatMessage} onChange={e => setChatMessage(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Reply to customer..."
                          className="flex-1 bg-[#ffffff] border border-[#000000] rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-brand-500 transition-colors placeholder-slate-400"
                        />
                        <button onClick={handleSendMessage} disabled={!chatMessage.trim()} className="px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-100 disabled:text-slate-450 text-[#ffffff] rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Admin Actions */}
                  <div className="border-t border-slate-200 pt-5 space-y-4">
                    <p className="text-sm font-bold text-slate-900">Process Ticket Status</p>
                    
                    <div className="flex flex-wrap gap-2.5">
                      {ALL_STATUSES.filter(s => s !== selected.status).map(s => {
                        const sCfg = STATUS_CFG[s] || STATUS_CFG.Open;
                        return (
                          <button
                            key={s}
                            onClick={() => handleUpdateStatus(selected, s)}
                            disabled={savingId === selected.id}
                            className={`text-xs px-3.5 py-2 rounded-xl border font-bold transition-all ${
                              savingId === selected.id 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'hover:scale-[1.03] active:scale-95 shadow-md'
                            } ${sCfg.bg} ${sCfg.color} ${sCfg.border}`}
                          >
                            → Mark as {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            );
          })()}
        </div>

      </div>
    </div>
  );
}
