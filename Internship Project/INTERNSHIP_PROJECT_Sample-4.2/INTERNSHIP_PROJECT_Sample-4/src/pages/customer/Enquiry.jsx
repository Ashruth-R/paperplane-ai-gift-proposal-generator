import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare, Plus, Clock, CheckCircle, XCircle, AlertCircle, Search,
  FileText, Send, Zap, X, User, Building, DollarSign, Layers,
  Calendar, Package, Tag, ExternalLink, HelpCircle, Download
} from 'lucide-react';
import { TextInput, SelectInput, TextArea } from '../../components/common/Input';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { formatDate, formatRelativeTime, formatCurrency } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import api from '../../utils/api';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import ProposalPDFPreview from '../../components/proposal/ProposalPDFPreview';

const ENQUIRY_STATUSES = {
  Open: { label: 'Open', bg: 'bg-blue-100/80', text: 'text-blue-700', border: 'border-blue-300/60', icon: Clock },
  'In Progress': { label: 'In Progress', bg: 'bg-amber-100/80', text: 'text-amber-800', border: 'border-amber-300/60', icon: AlertCircle },
  Resolved: { label: 'Resolved', bg: 'bg-emerald-100/80', text: 'text-emerald-700', border: 'border-emerald-300/60', icon: CheckCircle },
  Closed: { label: 'Closed', bg: 'bg-surface-700/60', text: 'text-surface-200', border: 'border-surface-600/50', icon: XCircle },
};

const ENQUIRY_TYPES = ['Bulk Order Enquiry', 'Custom Branding Request', 'Pricing & Quote', 'Delivery Timeline', 'Product Availability', 'Return & Replacement', 'Technical Support', 'Custom Gift Order', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

const priorityConfig = {
  Low: 'text-surface-300 bg-surface-800 border-surface-700/60 font-semibold',
  Medium: 'text-amber-800 bg-amber-100/80 border-amber-300/60 font-semibold',
  High: 'text-rose-700 bg-rose-100/80 border-rose-300/60 font-semibold',
  Urgent: 'text-brand-700 bg-brand-100/80 border-brand-300/60 font-semibold',
};

export default function EnquiryPortal() {
  const { showToast, tickets, addTicket, addTicketMessage, addNotification, proposals, orders, activeUser } = useApp();
  const navigate = useNavigate();
  const [newModal, setNewModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const chatEndRef = useRef(null);

  const [exportModal, setExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [previewProposal, setPreviewProposal] = useState(null);

  const handleExport = async () => {
    if (!previewProposal) return;
    setExporting(true);
    try {
      const input = document.getElementById('pdf-content');
      if (!input) throw new Error('PDF content not found');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(input, { scale: 2, useCORS: true, logging: false, letterRendering: true });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [800, 1131] });
      pdf.addImage(imgData, 'PNG', 0, 0, 800, 1131);
      const safeName = (previewProposal.clientName || 'Client').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      pdf.save(`proposal_${previewProposal.id || 'export'}_${safeName}.pdf`);
      
      showToast('Proposal exported successfully!', 'success');
      setExportModal(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast('Failed to generate PDF. Please try again.', 'error');
    } finally {
      setExporting(false);
    }
  };


  const handleSendMessage = () => {
    if (!chatMessage.trim() || !selectedTicket) return;
    addTicketMessage(selectedTicket.id, { sender: 'customer', text: chatMessage, timestamp: new Date().toISOString() });
    setChatMessage('');
    
    addNotification({
      role: 'admin',
      type: 'message',
      message: `New message from customer regarding ${selectedTicket.id}.`,
      link: '/admin/enquiries'
    });
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const [form, setForm] = useState({
    subject: '', type: '', priority: 'Medium', description: '', attachOrder: '', contactPhone: '',
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const findRelatedEntity = (ticket) => {
    if (!ticket) return null;
    const attachId = (ticket.attachOrder || '').trim().toUpperCase();
    
    let extractedId = attachId;
    if (!extractedId) {
      const matchPro = ticket.subject.match(/PRO-\d+/i);
      const matchOrd = ticket.subject.match(/ORD-\d+/i);
      if (matchPro) extractedId = matchPro[0].toUpperCase();
      else if (matchOrd) extractedId = matchOrd[0].toUpperCase();
    }

    if (extractedId.startsWith('PRO-')) {
      const proposal = proposals.find(p => p.id === extractedId);
      if (proposal) return { type: 'proposal', data: proposal };
    } else if (extractedId.startsWith('ORD-')) {
      const order = orders.find(o => o.id === extractedId);
      if (order) return { type: 'order', data: order };
    }
    return null;
  };

  const submitEnquiry = () => {
    if (!form.subject || !form.type || !form.description) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const newTicketId = `TKT-${Math.floor(2900 + Math.random() * 1000)}`;
      const newTicket = {
        id: newTicketId,
        ticketId: newTicketId,
        subject: form.subject,
        type: form.type,
        priority: form.priority,
        status: 'Open',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        assignedTo: 'Unassigned',
        messages: 0,
        orderDetails: null,
        attachOrder: form.attachOrder || '',
        customerEmail: activeUser?.email,
        companyName: activeUser?.company,
        customerName: activeUser?.name
      };
      addTicket(newTicket);
      setLoading(false);
      setNewModal(false);
      setForm({ subject: '', type: '', priority: 'Medium', description: '', attachOrder: '', contactPhone: '' });
      showToast(`Ticket ${newTicket.id} created! Our team will respond within 2 business hours.`, 'success');
    }, 1500);
  };

  const filtered = tickets.filter(t => {
    const matchSearch = !search ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      (t.id && t.id.toLowerCase().includes(search.toLowerCase())) ||
      (t.ticketId && t.ticketId.toLowerCase().includes(search.toLowerCase()));
    
    const matchStatus = filterStatus === 'All' || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    Open: tickets.filter(t => t.status === 'Open').length,
    'In Progress': tickets.filter(t => t.status === 'In Progress').length,
    Resolved: tickets.filter(t => t.status === 'Resolved').length
  };

  // Status Stepper mappings based on ticket status
  const getTimelineSteps = (ticket) => {
    if (!ticket) return [];
    
    const isSubmitted = true;
    const isReviewing = ticket.status === 'In Progress' || ticket.status === 'Resolved' || ticket.status === 'Closed';
    const isProposalGen = ticket.status === 'Resolved' || ticket.status === 'Closed';
    
    return [
      {
        title: 'Request Submitted',
        desc: 'Custom gifting requirements logged in system.',
        status: 'completed',
        date: formatDate(ticket.created)
      },
      {
        title: 'Reviewing Specifications',
        desc: isReviewing 
          ? 'Gifting team is analyzing branding requirements and inventory.' 
          : 'Awaiting design coordinator assignment.',
        status: isReviewing ? 'completed' : (ticket.status === 'Open' ? 'active' : 'pending')
      },
      {
        title: 'Proposal Generated',
        desc: isProposalGen 
          ? 'Branded mockups and digital sales proposal sent.' 
          : 'Compiling catalog recommendation options.',
        status: isProposalGen ? 'completed' : (ticket.status === 'In Progress' ? 'active' : 'pending')
      }
    ];
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-100">Corporate Enquiry Portal</h1>
          <p className="text-surface-400 text-sm mt-1">Submit and track bulk enquiries, quotes, and support tickets</p>
        </div>
        <Button className="md:ml-auto" icon={Plus} onClick={() => setNewModal(true)}>New Enquiry</Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Tickets', value: tickets.length, icon: FileText, color: 'text-brand-600 bg-brand-50 border border-brand-200/50' },
          { label: 'Open', value: counts.Open, icon: Clock, color: 'text-blue-600 bg-blue-50 border border-blue-200/50' },
          { label: 'In Progress', value: counts['In Progress'], icon: AlertCircle, color: 'text-amber-600 bg-amber-50 border border-amber-200/50' },
          { label: 'Resolved', value: counts.Resolved, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 border border-emerald-200/50' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-surface-800 border border-surface-700/50 rounded-xl p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.color}`}><Icon className="w-4.5 h-4.5" /></div>
              <div><p className="text-xl font-bold text-surface-100">{stat.value}</p><p className="text-surface-500 text-xs">{stat.label}</p></div>
            </div>
          );
        })}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1 bg-surface-800 border border-surface-700 rounded-xl px-3 py-2 focus-within:border-brand-500 transition-colors">
          <Search className="w-4 h-4 text-surface-500 flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by subject or ticket ID..."
            className="flex-1 bg-transparent text-sm text-surface-200 placeholder-surface-500 outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                filterStatus === s 
                  ? 'bg-brand-600 text-white border-brand-500' 
                  : 'bg-surface-800 text-surface-400 border-surface-700 hover:border-brand-500/40'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-surface-800 border border-surface-700/50 rounded-2xl overflow-hidden shadow-lg">
        <div className="hidden md:grid grid-cols-[1.2fr_3fr_1.5fr_1fr_1.2fr_1.2fr] gap-4 px-5 py-3.5 border-b border-surface-700/40 text-xs font-semibold text-surface-500 uppercase tracking-wider">
          <span>Ticket ID</span>
          <span>Subject</span>
          <span>Type</span>
          <span>Priority</span>
          <span>Status</span>
          <span>Updated</span>
        </div>
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <MessageSquare className="w-10 h-10 text-surface-600 mx-auto mb-3" />
            <p className="text-surface-400 text-sm">No tickets found</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-700/30">
            {filtered.map(ticket => {
              const cfg = ENQUIRY_STATUSES[ticket.status] || ENQUIRY_STATUSES.Open;
              const StatusIcon = cfg.icon;
              const pCfg = priorityConfig[ticket.priority];
              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className="px-5 py-4 hover:bg-surface-700/20 transition-colors cursor-pointer"
                >
                  {/* Mobile layout */}
                  <div className="md:hidden flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-surface-100 text-sm font-medium flex-1">{ticket.subject}</p>
                      <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {ticket.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-brand-400 font-mono font-semibold">{ticket.ticketId || ticket.id}</span>
                      <span className="text-surface-500">•</span>
                      <span className="text-surface-400">{ticket.type}</span>
                      <span className={`px-1.5 py-0.5 rounded border text-[10px] ml-1 ${pCfg}`}>{ticket.priority}</span>
                      <span className="text-surface-600 ml-auto">{formatRelativeTime(ticket.updated)}</span>
                    </div>
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden md:grid grid-cols-[1.2fr_3fr_1.5fr_1fr_1.2fr_1.2fr] gap-4 items-center">
                    <span className="font-mono text-xs text-brand-400 font-semibold">{ticket.ticketId || ticket.id}</span>
                    <div className="min-w-0">
                      <p className="text-surface-200 text-sm font-medium truncate">{ticket.subject}</p>
                      {ticket.messages > 0 && (
                        <p className="text-surface-500 text-xs mt-0.5">{ticket.messages} coordinator response{ticket.messages !== 1 ? 's' : ''}</p>
                      )}
                    </div>
                    <span className="text-surface-400 text-xs truncate">{ticket.type}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border inline-flex self-start justify-center text-center ${pCfg}`}>
                      {ticket.priority}
                    </span>
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border self-start ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {ticket.status}
                    </span>
                    <span className="text-surface-500 text-xs">{formatRelativeTime(ticket.updated)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Slide-out Side Details Panel */}
      <div 
        className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${
          selectedTicket ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop overlay */}
        <div 
          className="absolute inset-0 bg-surface-950/70 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSelectedTicket(null)}
        />
        
        {/* Panel Container */}
        <div 
          className={`relative w-full max-w-lg bg-surface-850 border-l border-surface-700 h-full shadow-2xl flex flex-col transition-transform duration-300 ease-out transform ${
            selectedTicket ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {selectedTicket && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-surface-700/50 bg-surface-900/40">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-brand-400">
                      {selectedTicket.ticketId || selectedTicket.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${priorityConfig[selectedTicket.priority]}`}>
                      {selectedTicket.priority} Priority
                    </span>
                  </div>
                  <span className="text-surface-400 text-xs">{selectedTicket.type}</span>
                </div>
                <button 
                  onClick={() => setSelectedTicket(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:text-white hover:bg-surface-700/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6 no-scrollbar">
                
                {/* Subject / Overview */}
                <div>
                  <h3 className="text-surface-100 font-bold text-lg leading-snug">{selectedTicket.subject}</h3>
                  <p className="text-surface-500 text-xs mt-1.5">
                    Assigned coordinator: <span className="text-surface-300">{selectedTicket.assignedTo}</span> • Created {formatDate(selectedTicket.created)}
                  </p>
                </div>

                {/* Custom Gift Order Details (If ticket is associated with a Custom Form) */}
                {selectedTicket.orderDetails ? (
                  <div className="flex flex-col gap-4">
                    <h4 className="text-xs uppercase font-bold tracking-wider text-brand-400 flex items-center gap-1.5 border-b border-surface-750 pb-2">
                      <Package className="w-4 h-4" />
                      Custom Gifting Specifications
                    </h4>
                    
                    {/* Recipient Card */}
                    <div className="bg-surface-800/60 border border-surface-700/60 rounded-xl p-4 flex flex-col gap-2.5">
                      <p className="text-surface-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 text-brand-500">
                        <User className="w-3.5 h-3.5" /> Recipient Details
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-surface-500">Name</p>
                          <p className="text-surface-200 font-medium">{selectedTicket.orderDetails.recipientName}</p>
                        </div>
                        <div>
                          <p className="text-surface-500">Designation</p>
                          <p className="text-surface-200 font-medium">{selectedTicket.orderDetails.recipientRole}</p>
                        </div>
                        <div>
                          <p className="text-surface-500">Company</p>
                          <p className="text-surface-200 font-medium flex items-center gap-1">
                            <Building className="w-3 h-3" /> {selectedTicket.orderDetails.company}
                          </p>
                        </div>
                        <div>
                          <p className="text-surface-500">Industry</p>
                          <p className="text-surface-200 font-medium">{selectedTicket.orderDetails.industry}</p>
                        </div>
                      </div>
                    </div>

                    {/* Quantity & Budget Summary Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-surface-800/40 border border-surface-700/40 rounded-xl p-3.5 text-center">
                        <Layers className="w-4 h-4 text-surface-400 mx-auto mb-1.5" />
                        <p className="text-[10px] text-surface-500 uppercase font-semibold">Quantity</p>
                        <p className="text-sm font-bold text-surface-200 mt-0.5">{selectedTicket.orderDetails.quantity} units</p>
                      </div>
                      <div className="bg-surface-800/40 border border-surface-700/40 rounded-xl p-3.5 text-center">
                        <DollarSign className="w-4 h-4 text-surface-400 mx-auto mb-1.5" />
                        <p className="text-[10px] text-surface-500 uppercase font-semibold">Unit Budget</p>
                        <p className="text-sm font-bold text-surface-200 mt-0.5">{formatCurrency(selectedTicket.orderDetails.budget)}</p>
                      </div>
                      <div className="bg-surface-800/40 border border-surface-750 rounded-xl p-3.5 text-center bg-brand-950/10 border-brand-500/10">
                        <DollarSign className="w-4 h-4 text-brand-400 mx-auto mb-1.5" />
                        <p className="text-[10px] text-brand-400 uppercase font-semibold">Est. Total</p>
                        <p className="text-sm font-bold text-brand-300 mt-0.5">
                          {formatCurrency(selectedTicket.orderDetails.budget * selectedTicket.orderDetails.quantity)}
                        </p>
                      </div>
                    </div>

                    {/* Occasion, Branding, notes */}
                    <div className="bg-surface-800/30 border border-surface-700/30 rounded-xl p-4 flex flex-col gap-4 text-xs">
                      <div>
                        <p className="text-surface-500 font-semibold mb-1">Occasion / Gifting Theme</p>
                        <p className="text-surface-200">{selectedTicket.orderDetails.occasion}</p>
                      </div>

                      {selectedTicket.orderDetails.brandingReqs && selectedTicket.orderDetails.brandingReqs.length > 0 && (
                        <div>
                          <p className="text-surface-500 font-semibold mb-2">Required Branding Options</p>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedTicket.orderDetails.brandingReqs.map(brand => (
                              <span key={brand} className="bg-surface-900/60 border border-surface-700 text-surface-300 text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium">
                                <Tag className="w-3 h-3 text-surface-500" />
                                {brand}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedTicket.orderDetails.notes && (
                        <div className="pt-3 border-t border-surface-750">
                           <p className="text-surface-500 font-semibold mb-1">Additional Instructions / Notes</p>
                           <p className="text-surface-300 italic">"{selectedTicket.orderDetails.notes}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (() => {
                  const related = findRelatedEntity(selectedTicket);
                  if (related) {
                    if (related.type === 'order') {
                      const order = related.data;
                      const steps = [
                        { title: 'Order Confirmed', desc: 'Order received and logged.', status: 'completed' },
                        { 
                          title: 'Processing & Packing', 
                          desc: order.status === 'Pending' ? 'Preparing products for packing.' : 'Packed and ready for dispatch.', 
                          status: order.status === 'Pending' ? 'active' : 'completed' 
                        },
                        { 
                          title: 'Out for Delivery', 
                          desc: order.status === 'Shipped' ? 'Handed over to carrier.' : 'Waiting for dispatch.', 
                          status: order.status === 'Shipped' ? 'completed' : (order.status === 'Approved & Packing' ? 'active' : 'pending') 
                        }
                      ];

                      return (
                        <div className="flex flex-col gap-4">
                          <h4 className="text-xs uppercase font-bold tracking-wider text-brand-400 flex items-center gap-1.5 border-b border-surface-750 pb-2">
                            <Package className="w-4 h-4" />
                            Associated Bulk Order Details ({order.id})
                          </h4>
                          
                          {/* Order Summary Card */}
                          <div className="bg-surface-800/60 border border-surface-700/60 rounded-xl p-4 flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-[10px] text-surface-500 uppercase font-semibold">Order Date</p>
                                <p className="text-xs text-surface-200 mt-0.5">{order.orderDate}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-surface-500 uppercase font-semibold text-right">Order Status</p>
                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border inline-block mt-0.5 ${
                                  order.status === 'Shipped' ? 'text-violet-300 bg-violet-900/30 border-violet-700/40' :
                                  order.status === 'Approved & Packing' ? 'text-emerald-300 bg-emerald-900/30 border-emerald-700/40' :
                                  order.status === 'Rejected' ? 'text-rose-300 bg-rose-900/30 border-rose-700/40' :
                                  'text-amber-300 bg-amber-900/30 border-amber-700/40'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>

                            <div className="border-t border-surface-700/40 pt-2.5">
                              <p className="text-[10px] text-surface-500 uppercase font-semibold mb-1.5">Items Purchased</p>
                              <div className="flex flex-col gap-1.5">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-xs bg-surface-900/40 p-2 rounded-lg border border-surface-750">
                                    <span className="text-surface-200 font-medium truncate flex items-center gap-1.5">
                                      <span className="text-sm">{item.emoji || '🎁'}</span>
                                      <span className="truncate">{item.name}</span>
                                    </span>
                                    <span className="text-surface-400 flex-shrink-0 font-semibold pl-2">
                                      {item.qty} × {formatCurrency(item.price)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="border-t border-surface-700/40 pt-2.5 flex justify-between items-center text-xs">
                              <span className="text-surface-400 font-semibold">Total Amount</span>
                              <span className="text-brand-300 font-bold text-sm">{formatCurrency(order.total)}</span>
                            </div>
                          </div>

                          {/* Order Timeline */}
                          <div className="bg-surface-800/20 border border-surface-700/30 rounded-xl p-4 flex flex-col gap-3">
                            <p className="text-[10px] text-surface-500 uppercase font-semibold">Order Fulfillment Progress</p>
                            <div className="relative pl-6 flex flex-col gap-4 mt-1">
                              <div className="absolute left-2.5 top-2 bottom-2 w-[2px] bg-surface-750" />
                              {steps.map((step, idx) => {
                                const isComp = step.status === 'completed';
                                const isActive = step.status === 'active';
                                return (
                                  <div key={idx} className="relative flex flex-col gap-0.5">
                                    <div className={`absolute -left-[22px] top-1 w-3 h-3 rounded-full border-2 ${
                                      isComp ? 'bg-emerald-500 border-emerald-400' :
                                      isActive ? 'bg-amber-500 border-amber-400 animate-pulse' :
                                      'bg-surface-800 border-surface-650'
                                    }`} />
                                    <span className={`text-xs font-bold ${
                                      isComp ? 'text-surface-100' : isActive ? 'text-amber-400' : 'text-surface-500'
                                    }`}>{step.title}</span>
                                    <span className="text-[10px] text-surface-400">{step.desc}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    if (related.type === 'proposal') {
                      const proposal = related.data;
                      const steps = [
                        { title: 'Proposal Request Logged', status: 'completed' },
                        { 
                          title: 'AI Product Recommendations', 
                          status: (proposal.status === 'Draft' || proposal.status === 'AI-Processing') ? 'active' : 'completed' 
                        },
                        { 
                          title: 'Designer Specifications & Mockup Review', 
                          status: proposal.status === 'Designer-Review' ? 'active' : 
                                  (['Approved', 'Dispatched'].includes(proposal.status) ? 'completed' : 'pending')
                        },
                        { 
                          title: 'Client Approved & Ready', 
                          status: proposal.status === 'Approved' ? 'completed' : 
                                  (proposal.status === 'Dispatched' ? 'completed' : 'pending')
                        }
                      ];

                      return (
                        <div className="flex flex-col gap-4">
                          <h4 className="text-xs uppercase font-bold tracking-wider text-brand-400 flex items-center gap-1.5 border-b border-surface-750 pb-2">
                            <FileText className="w-4 h-4" />
                            Associated Proposal Status ({proposal.id})
                          </h4>
                          
                          {/* Proposal Details Widget */}
                          <div className="bg-surface-800/60 border border-surface-700/60 rounded-xl p-4 flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-[10px] text-surface-500 uppercase font-semibold">Occasion</p>
                                <p className="text-xs text-surface-200 mt-0.5 font-medium">{proposal.occasion}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-surface-500 uppercase font-semibold text-right">Proposal Status</p>
                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border inline-block mt-0.5 ${
                                  proposal.status === 'Approved' ? 'text-emerald-300 bg-emerald-900/30 border-emerald-700/50' :
                                  proposal.status === 'Dispatched' ? 'text-violet-300 bg-violet-900/30 border-violet-700/50' :
                                  proposal.status === 'Designer-Review' ? 'text-amber-300 bg-amber-900/30 border-amber-700/50' :
                                  'text-blue-300 bg-blue-900/30 border-blue-700/50'
                                }`}>
                                  {proposal.status}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs border-t border-surface-700/40 pt-2.5">
                              <div>
                                <p className="text-surface-500 font-semibold">Quantity</p>
                                <p className="text-surface-200 font-medium">{proposal.quantity} units</p>
                              </div>
                              <div>
                                <p className="text-surface-500 font-semibold">Target Budget</p>
                                <p className="text-surface-200 font-medium">{formatCurrency(proposal.budget)}</p>
                              </div>
                              <div>
                                <p className="text-surface-500 font-semibold">Target Delivery</p>
                                <p className="text-surface-200 font-medium">{formatDate(proposal.deliveryTimeline)}</p>
                              </div>
                              <div>
                                <p className="text-surface-500 font-semibold">Branding Requirements</p>
                                <p className="text-surface-200 font-medium truncate" title={proposal.brandingReqs.join(', ')}>
                                  {proposal.brandingReqs.join(', ')}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Proposal Timeline */}
                          <div className="bg-surface-800/20 border border-surface-700/30 rounded-xl p-4 flex flex-col gap-3">
                            <p className="text-[10px] text-surface-500 uppercase font-semibold">Proposal Review Lifecycle</p>
                            <div className="relative pl-6 flex flex-col gap-4 mt-1">
                              <div className="absolute left-2.5 top-2 bottom-2 w-[2px] bg-surface-750" />
                              {steps.map((step, idx) => {
                                const isComp = step.status === 'completed';
                                const isActive = step.status === 'active';
                                return (
                                  <div key={idx} className="relative flex flex-col gap-0.5">
                                    <div className={`absolute -left-[22px] top-1 w-3 h-3 rounded-full border-2 ${
                                      isComp ? 'bg-emerald-500 border-emerald-400' :
                                      isActive ? 'bg-amber-500 border-amber-400 animate-pulse' :
                                      'bg-surface-800 border-surface-650'
                                    }`} />
                                    <span className={`text-xs font-bold ${
                                      isComp ? 'text-surface-100' : isActive ? 'text-amber-400' : 'text-surface-500'
                                    }`}>{step.title}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    }
                  }

                  return (
                    /* Standard Support Ticket Description */
                    <div className="flex flex-col gap-3">
                      <h4 className="text-xs uppercase font-bold tracking-wider text-brand-400 border-b border-surface-750 pb-2 flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4" />
                        Enquiry Details
                      </h4>
                      <div className="bg-surface-800/40 border border-surface-700/50 rounded-xl p-4 text-xs text-surface-300 leading-relaxed whitespace-pre-line">
                        {selectedTicket.subject} — Our corporate coordinators are analyzing your request. We will publish specifications shortly.
                      </div>
                    </div>
                  );
                })()}

                {/* Visual Status Tracker Timeline */}
                <div className="flex flex-col gap-4">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-brand-400 flex items-center gap-1.5 border-b border-surface-750 pb-2">
                    <Clock className="w-4 h-4" />
                    Workflow Timeline Tracker
                  </h4>
                  
                  <div className="relative pl-6 flex flex-col gap-6 mt-2">
                    {/* Vertical line indicator */}
                    <div className="absolute left-2.5 top-2.5 bottom-2.5 w-[2px] bg-surface-700" />

                    {getTimelineSteps(selectedTicket).map((step, idx) => {
                      const isComp = step.status === 'completed';
                      const isActive = step.status === 'active';
                      return (
                        <div key={idx} className="relative flex flex-col gap-1 select-none">
                          {/* Stepper node circle */}
                          <div className={`absolute -left-[22px] top-1.5 w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                            isComp 
                              ? 'bg-emerald-500 border-emerald-400 shadow-glow shadow-emerald-500/20' 
                              : isActive 
                              ? 'bg-amber-500 border-amber-400 animate-pulse shadow-glow shadow-amber-500/20' 
                              : 'bg-surface-800 border-surface-600'
                          }`} />
                          
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-xs font-bold ${
                              isComp ? 'text-surface-100 font-bold' : isActive ? 'text-amber-400 font-bold' : 'text-surface-500'
                            }`}>
                              {step.title}
                            </span>
                            {step.date && <span className="text-[10px] text-surface-500">{step.date}</span>}
                          </div>
                          <span className="text-[11px] text-surface-400 leading-relaxed">{step.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Chat Interface */}
                <div className="space-y-2 mt-2 border-t border-white/[0.05] pt-6">
                  <p className="text-[10px] uppercase font-black tracking-wider text-slate-500 flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Communication History
                  </p>
                  <div className="flex flex-col gap-4 h-[300px] bg-slate-950/40 border border-white/[0.03] rounded-xl p-4 shadow-inner">
                    <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2 no-scrollbar">
                      {(selectedTicket.chatHistory || []).map((msg, i) => (
                        <div key={i} className={`flex flex-col ${msg.sender === 'customer' ? 'items-end' : 'items-start'}`}>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{msg.sender === 'customer' ? 'You' : 'Coordinator'}</span>
                          <div className={`px-3 py-2 rounded-xl text-sm max-w-[85%] shadow-md ${msg.sender === 'customer' ? 'bg-brand-600/80 text-white' : 'bg-slate-800 border border-white/5 text-slate-200'}`}>
                            {msg.text}
                          </div>
                          <span className="text-[9px] text-slate-600 mt-1">{formatDate(msg.timestamp, { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      ))}
                      {(!selectedTicket.chatHistory || selectedTicket.chatHistory.length === 0) && (
                        <p className="text-center text-slate-500 text-xs mt-10">No messages yet. Send a message to start the conversation.</p>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                    <div className="flex gap-2">
                      <input 
                        id="chat-input"
                        value={chatMessage} onChange={e => setChatMessage(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 bg-slate-900 border border-white/5 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                      />
                      <button onClick={handleSendMessage} disabled={!chatMessage.trim()} className="px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions inside panel */}
              <div className="border-t border-surface-700/50 p-5 bg-surface-900/40 flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={() => setSelectedTicket(null)}>
                  Close Panel
                </Button>
                {selectedTicket.status === 'Resolved' ? (
                  <Button 
                    className="flex-1" 
                    icon={ExternalLink}
                    onClick={async () => {
                      let pId = selectedTicket.proposalId;
                      if (!pId && selectedTicket.chatHistory) {
                        const msg = selectedTicket.chatHistory.find(m => m.text.includes('custom proposal ('));
                        if (msg) {
                          const match = msg.text.match(/custom proposal \(([^)]+)\)/);
                          if (match) pId = match[1];
                        }
                      }
                      
                      let proposalData = null;
                      if (pId) {
                        try {
                          const res = await api.get(`/proposals/${pId}`);
                          proposalData = res.data.data;
                        } catch (e) {
                          console.error("Failed to fetch specific proposal", e);
                        }
                      }
                      
                      if (!proposalData) {
                        try {
                          showToast('Locating latest proposal...', 'info');
                          const res = await api.get('/proposals');
                          const propsList = res.data.data?.proposals || res.data.data || [];
                          if (propsList.length > 0) {
                            propsList.sort((a, b) => b.id - a.id);
                            proposalData = propsList[0];
                          }
                        } catch (e) {
                          console.error("Fallback proposal fetch failed", e);
                        }
                      }

                      // Map items correctly to match ProposalPDFPreview structure
                      const backendItems = proposalData?.current_version_data?.items || [];
                      const recommendations = backendItems.length > 0 
                        ? backendItems.map((item, i) => ({
                            id: i,
                            product: item.item_name,
                            price: item.unit_price,
                            reason: item.description || 'Recommended for this occasion.',
                            quantity: item.quantity,
                            category: 'Gift',
                            score: 95
                          }))
                        : [
                            { id: 1, product: 'Premium Tech Kit', price: 200, quantity: 100, reason: 'Perfect premium gift for executives.', category: 'Electronics', score: 98 },
                            { id: 2, product: 'Engraved Metal Pen', price: 50, quantity: 100, reason: 'Classic high-value addition.', category: 'Stationery', score: 92 }
                          ];

                      const baseBudget = proposalData?.budget_per_unit || 500;
                      const qty = proposalData?.quantity || 100;

                      // Create a mock proposal matching ProposalPDFPreview structure
                      const finalProposal = {
                        id: proposalData?.id || pId || `PRO-MOCK-${selectedTicket.id}`,
                        clientName: proposalData?.client_name || selectedTicket.companyName || selectedTicket.customerName,
                        contactPerson: selectedTicket.customerName,
                        contactEmail: selectedTicket.customerEmail || 'client@example.com',
                        clientType: proposalData?.client_type || 'Enterprise',
                        occasion: proposalData?.occasion || selectedTicket.subject || 'Custom Request',
                        quantity: qty,
                        budget: baseBudget,
                        deliveryTimeline: proposalData?.created_at || new Date().toISOString(),
                        aiRecommendations: recommendations,
                        costSummary: {
                          total: proposalData?.current_version_data?.total_price || (baseBudget * qty),
                          productCost: (baseBudget * qty) * 0.8,
                          brandingCost: (baseBudget * qty) * 0.1,
                          packagingCost: (baseBudget * qty) * 0.05,
                          logisticsCost: (baseBudget * qty) * 0.05
                        }
                      };

                      setPreviewProposal(finalProposal);
                      setExportModal(true);
                    }}
                  >
                    View Generated Proposal
                  </Button>
                ) : (
                  <Button className="flex-1" icon={MessageSquare} onClick={() => {
                    document.getElementById('chat-input')?.focus();
                    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }}>
                    Message Coordinator
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Submit New Enquiry Modal */}
      <Modal isOpen={newModal} onClose={() => setNewModal(false)} title="Submit New Enquiry" size="lg"
        footer={<><Button variant="ghost" onClick={() => setNewModal(false)}>Cancel</Button><Button loading={loading} icon={Send} onClick={submitEnquiry}>Submit Enquiry</Button></>}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 p-3 bg-brand-900/20 border border-brand-500/20 rounded-xl">
            <Zap className="w-4 h-4 text-brand-400 flex-shrink-0" />
            <p className="text-brand-300 text-xs">Our corporate sales team typically responds within 2 business hours. For urgent requests, please mark Priority as "Urgent".</p>
          </div>
          <TextInput label="Subject *" id="enq-subject" value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="e.g. Bulk order pricing for 500 units of Leather Notebooks" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectInput label="Enquiry Type *" id="enq-type" options={ENQUIRY_TYPES} value={form.type} onChange={e => set('type', e.target.value)} />
            <SelectInput label="Priority" id="enq-priority" options={PRIORITIES} value={form.priority} onChange={e => set('priority', e.target.value)} />
          </div>
          <TextArea label="Description *" id="enq-desc" rows={5} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Provide as much detail as possible — quantity, specifications, timeline, budget range, and any special requirements..." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput label="Related Order / Proposal ID (optional)" id="enq-order" value={form.attachOrder} onChange={e => set('attachOrder', e.target.value)} placeholder="e.g. PRO-001" />
            <TextInput label="Contact Phone (optional)" id="enq-phone" type="tel" value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} placeholder="+91 98765 43210" />
          </div>
        </div>
      </Modal>

      {/* Export PDF Modal */}
      <Modal
        isOpen={exportModal}
        onClose={() => setExportModal(false)}
        title="Proposal Preview"
        size="5xl"
        footer={
          <>
            <Button variant="ghost" onClick={() => setExportModal(false)}>Cancel</Button>
            <Button icon={Download} onClick={handleExport} loading={exporting}>
              {exporting ? 'Generating PDF...' : 'Download PDF'}
            </Button>
          </>
        }
      >
        <div className="bg-slate-100 rounded-xl overflow-hidden p-8 flex justify-center max-h-[70vh] overflow-y-auto no-scrollbar relative border border-surface-200">
          <div className="transform origin-top transition-transform duration-300" style={{ transform: 'scale(1)', width: '800px' }}>
            <ProposalPDFPreview proposal={previewProposal} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
