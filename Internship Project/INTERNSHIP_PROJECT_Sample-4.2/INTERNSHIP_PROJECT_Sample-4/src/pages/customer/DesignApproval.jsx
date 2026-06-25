import { useState } from 'react';
import {
  CheckCircle, XCircle, Clock, ChevronDown, Eye, MessageSquare, History,
  AlertCircle, ThumbsUp, ThumbsDown, User, Calendar, RefreshCw, FileText
} from 'lucide-react';
import Modal from '../../components/common/Modal';
import { TextArea, SelectInput } from '../../components/common/Input';
import { formatRelativeTime } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';

const STATUS_CONFIGS = {
  'Pending Review': {
    label: 'Pending Review',
    bg: 'bg-amber-950/40',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
    icon: Clock
  },
  'Approved': {
    label: 'Approved',
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
    icon: CheckCircle
  },
  'Rejected': {
    label: 'Rejected',
    bg: 'bg-rose-950/40',
    text: 'text-rose-400',
    border: 'border-rose-500/20',
    icon: XCircle
  },
  'Revision Needed': {
    label: 'Revision Needed',
    bg: 'bg-orange-950/40',
    text: 'text-orange-400',
    border: 'border-orange-500/20',
    icon: AlertCircle
  }
};

const mockVersions = {
  'DSN-001': [
    { version: 'v1.0', date: '2026-06-14', change: 'Initial mockup submitted', active: true },
  ],
  'DSN-002': [
    { version: 'v2.0', date: '2026-06-15', change: 'Adjusted size for bamboo texture', active: true },
    { version: 'v1.0', date: '2026-06-11', change: 'Original logo upload', active: false },
  ],
  'DSN-004': [
    { version: 'v1.0', date: '2026-06-12', change: 'Approved final vector layout', active: true },
  ],
  'DSN-005': [
    { version: 'v1.0', date: '2026-06-11', change: 'Logo embroidery file', active: true },
  ],
};

const getBgStyle = (bgName) => {
  if (bgName === 'premium-dark') return '#0f172a';
  if (bgName === 'studio-light') return '#f1f5f9';
  if (bgName === 'corporate-desk') return '#1e293b';
  return '#ffffff'; // minimal-white
};

export default function DesignApproval() {
  const { activeRole, personalizedDesigns, updateDesignStatus, showToast, addNotification } = useApp();
  const [versionsOpen, setVersionsOpen] = useState({});
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedDesignId, setSelectedDesignId] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [rejectionStatus, setRejectionStatus] = useState('Revision Needed');
  const [filterStatus, setFilterStatus] = useState('All');

  const handleApprove = (id) => {
    const design = personalizedDesigns.find(d => d.id === id);
    const clientName = design?.customerName || 'Apex Auto Industries';
    const productName = design?.productName || 'Premium Leather Notebook';

    updateDesignStatus(id, 'Approved', 'Approved by Admin. Ready for manufacturing production.');
    
    addNotification({
      role: 'admin',
      type: 'reminder',
      message: `Status Update: You approved the design mockup for ${clientName}.`,
      link: '/admin/design-approvals'
    });

    addNotification({
      role: 'customer',
      type: 'reminder',
      message: `Design Approved: Your personalization design for ${productName} is approved and ready for packing.`,
      link: '/customer/design-approvals'
    });

    showToast('✓ Design approved successfully!', 'success');
  };

  const handleOpenFeedback = (id) => {
    setSelectedDesignId(id);
    const design = personalizedDesigns.find(d => d.id === id);
    setFeedbackText(design?.adminFeedback || '');
    setRejectionStatus(design?.status === 'Rejected' ? 'Rejected' : 'Revision Needed');
    setFeedbackModalOpen(true);
  };

  const submitFeedback = () => {
    if (!feedbackText.trim()) {
      showToast('Please provide feedback notes explaining the decision.', 'error');
      return;
    }
    
    const design = personalizedDesigns.find(d => d.id === selectedDesignId);
    const clientName = design?.customerName || 'Stellar Retail Corp';
    const productName = design?.productName || 'Crystal Desk Organizer';

    updateDesignStatus(selectedDesignId, rejectionStatus, feedbackText);

    if (rejectionStatus === 'Rejected' || rejectionStatus === 'Revision Needed') {
      addNotification({
        role: 'admin',
        type: 'alert',
        message: `Status Update: You rejected the order request for ${clientName}.`,
        link: '/admin/design-approvals'
      });

      addNotification({
        role: 'customer',
        type: 'alert',
        message: `Action Required: Your personalization design for the ${productName} was rejected. Please review feedback.`,
        link: '/customer/design-approvals'
      });
    }

    showToast(`Design updated to ${rejectionStatus}`, 'info');
    setFeedbackModalOpen(false);
    setFeedbackText('');
    setSelectedDesignId(null);
  };

  const handleRevertToPending = (id) => {
    updateDesignStatus(id, 'Pending Review', '');
    showToast('Design reverted to Pending Review', 'info');
  };

  // Filter items based on selected tab
  const filtered = filterStatus === 'All'
    ? personalizedDesigns
    : personalizedDesigns.filter(d => d.status === filterStatus);

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Isolated Redesign Styles */}
      <style>{`
        @keyframes slide-down {
          from { height: 0; opacity: 0; }
          to { height: auto; opacity: 1; }
        }
        .animate-slide-down {
          animation: slide-down 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes pulse-subtle-glow {
          0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(245, 158, 11, 0); }
          100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
        }
        .animate-pulse-glow {
          animation: pulse-subtle-glow 2s infinite;
        }
      `}</style>

      {/* Header Info Section */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          {activeRole === 'admin' ? 'Design Approvals' : 'Design Approval Tracker'}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {activeRole === 'admin'
            ? 'Review and approve product mockups and artwork submissions.'
            : 'Track the status and review decisions for your submitted gift mockups.'}
        </p>
      </div>

      {/* Approval KPI Stats Header */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Designs', value: personalizedDesigns.length, color: 'text-brand-700 bg-brand-100 border-brand-200' },
          { label: 'Pending Review', value: personalizedDesigns.filter(d => d.status === 'Pending Review').length, color: 'text-amber-700 bg-amber-100 border-amber-200' },
          { label: 'Approved', value: personalizedDesigns.filter(d => d.status === 'Approved').length, color: 'text-emerald-700 bg-emerald-100 border-emerald-200' },
          { label: 'Rejected', value: personalizedDesigns.filter(d => d.status === 'Rejected').length, color: 'text-rose-700 bg-rose-100 border-rose-200' },
          { label: 'Revision Needed', value: personalizedDesigns.filter(d => d.status === 'Revision Needed').length, color: 'text-orange-700 bg-orange-100 border-orange-200' }
        ].map(stat => (
          <div key={stat.label} className="bg-[#ffffff] border border-[#000000] rounded-[20px] p-4 flex flex-col justify-between shadow-md transition-all duration-300">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</span>
            <div className="flex justify-between items-end mt-2">
              <span className="text-2xl font-black text-[#000000]">{stat.value}</span>
              <span className={`text-[9px] px-2 py-0.5 border rounded-full font-bold uppercase tracking-wider ${stat.color}`}>
                Active
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs Redesign */}
      <div className="flex p-1 gap-1 bg-[#ffffff] border border-[#000000] rounded-2xl overflow-x-auto no-scrollbar w-full max-w-2xl shadow-sm">
        {['All', 'Pending Review', 'Approved', 'Rejected', 'Revision Needed'].map(s => {
          const count = s === 'All' ? personalizedDesigns.length : personalizedDesigns.filter(d => d.status === s).length;
          const isActive = filterStatus === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setFilterStatus(s)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap ${
                isActive 
                  ? 'bg-brand-600 text-[#ffffff] shadow-lg shadow-brand-500/20' 
                  : 'text-slate-500 hover:text-[#000000] hover:bg-slate-100'
              }`}
            >
              <span>{s}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                isActive ? 'bg-[#ffffff]/25 text-[#ffffff]' : 'bg-slate-100 text-slate-650'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid view of Designs (Desktop: 3, Tablet: 2, Mobile: 1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 items-start">
        {filtered.map(design => {
          const statusCfg = STATUS_CONFIGS[design.status] || STATUS_CONFIGS['Pending Review'];
          const StatusIcon = statusCfg.icon;
          const verOpen = versionsOpen[design.id];
          const versions = mockVersions[design.id] || [
            { version: 'v1.0', date: design.submissionDate ? design.submissionDate.split('T')[0] : new Date().toISOString().split('T')[0], change: 'Initial mockup submitted', active: true }
          ];

          return (
            <div
              key={design.id}
              className="flex flex-col bg-[#ffffff] border border-[#000000] rounded-[24px] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-500/5"
            >
              {/* Mockup Preview Dynamic/Static Frame */}
              <div 
                style={{ backgroundColor: getBgStyle(design.previewBackground) }}
                className="relative h-60 w-full flex flex-col items-center justify-center overflow-hidden border-b border-white/[0.04] select-none"
              >
                {design.emoji ? (
                  /* Center product showcase canvas */
                  <div className="relative z-10 flex flex-col items-center justify-center gap-2.5 scale-75 transition-all duration-300">
                    {/* Main Product Emoji */}
                    <span className="text-6xl drop-shadow-[0_10px_20px_rgba(0,0,0,0.35)] select-none">
                      {design.emoji}
                    </span>

                    {/* Logo custom branding component */}
                    {design.logoUploaded && (
                      <div 
                        style={{ 
                          width: `${design.logoSize || 50}px`, 
                          height: `${design.logoSize || 50}px`,
                          transform: `rotate(${design.logoRotation || 0}deg)`,
                          backgroundColor: design.primaryColor || '#4f46e5',
                          borderColor: `${design.accentColor || '#10b981'}40`,
                        }}
                        className={`rounded-lg flex items-center justify-center border bg-white/10 backdrop-blur-md shadow-lg p-1.5 ${
                          design.logoPosition === 'Top' ? 'order-first mb-1' : design.logoPosition === 'Center' ? '' : 'order-last mt-1'
                        }`}
                      >
                        <span className="text-white text-[7px] font-black tracking-tight text-center leading-none select-none uppercase">
                          {design.logoName ? design.logoName.replace(/\.[^/.]+$/, '').slice(0, 8) : 'LOGO'}
                        </span>
                      </div>
                    )}

                    {/* Custom typography representation */}
                    {design.customText && (
                      <div 
                        className={`w-full ${design.textPosition === 'Top' ? 'order-first' : design.textPosition === 'Center' ? '' : 'order-last'}`}
                        style={{ textAlign: (design.textAlign || 'Center').toLowerCase() }}
                      >
                        <p 
                          style={{ 
                            fontSize: `${design.fontSize ? design.fontSize * 0.8 : 14}px`, 
                            color: design.accentColor || '#10b981', 
                            fontFamily: design.fontStyle || 'Inter', 
                            fontWeight: design.fontWeight === 'Bold' ? 'bold' : design.fontWeight === 'Medium' ? '500' : 'normal'
                          }} 
                          className="drop-shadow-md px-2 select-none whitespace-nowrap"
                        >
                          {design.customText}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <img
                      src={design.mockupImageUrl}
                      alt={design.productName}
                      className="object-cover w-full h-full group-hover:scale-[1.04] transition-transform duration-500"
                    />
                    {/* Visual decoration overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                  </>
                )}
                
                {/* Meta details overlay */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-[#ffffff] bg-[#000000]/80 backdrop-blur-md border border-white/25 px-3 py-1.5 rounded-lg shadow-sm">
                    {design.type}
                  </span>
                  <span className="text-[10px] text-slate-200 bg-[#000000]/80 backdrop-blur-md border border-white/5 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-mono shadow-sm">
                    ID: {design.id}
                  </span>
                </div>
              </div>
              
              {/* Body details */}
              <div className="p-6 flex flex-col gap-5 flex-1">
                
                {/* Title and Badge Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[#0f172a] font-extrabold text-lg tracking-tight line-clamp-1">{design.productName}</h3>
                    <p className="text-slate-655 text-xs mt-1.5 flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-semibold">{design.customerName}</span>
                    </p>
                  </div>
                  
                  {/* Status Badge */}
                  <span className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border} flex-shrink-0`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span>{statusCfg.label}</span>
                  </span>
                </div>

                {/* Submission date metadata */}
                <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-slate-600" />
                  <span>Submitted {formatRelativeTime(design.submissionDate)}</span>
                </div>

                {/* Horizontal Progress Timeline */}
                <div className="py-3 border border-[#000000] bg-[#ffffff] px-3 rounded-xl flex items-center justify-between shadow-sm">
                  {[
                    { label: 'Submitted', done: true, current: false },
                    { label: 'Reviewing', done: design.status !== 'Pending Review', current: design.status === 'Pending Review' },
                    { 
                      label: design.status === 'Rejected' ? 'Rejected' : design.status === 'Revision Needed' ? 'Revisions' : 'Approved', 
                      done: design.status === 'Approved' || design.status === 'Rejected' || design.status === 'Revision Needed', 
                      current: false,
                      color: design.status === 'Approved' ? 'bg-emerald-500' : (design.status === 'Rejected' || design.status === 'Revision Needed') ? 'bg-rose-500' : 'bg-slate-700'
                    }
                  ].map((step, sIdx, sArr) => {
                    return (
                      <div key={step.label} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center gap-1">
                          <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center border text-[9px] font-bold ${
                            step.done 
                              ? `${step.color || 'bg-brand-600'} border-transparent text-[#ffffff] shadow-md`
                              : step.current
                                ? 'bg-amber-50 border-amber-400 text-amber-700 animate-pulse-soft'
                                : 'bg-slate-200 border-slate-300 text-slate-500'
                          }`}>
                            {step.done ? '✓' : '⏳'}
                          </div>
                          <span className={`text-[8px] font-black uppercase tracking-wider ${
                            step.done ? 'text-slate-600' : step.current ? 'text-amber-700' : 'text-slate-450'
                          }`}>{step.label}</span>
                        </div>
                        {sIdx < sArr.length - 1 && (
                          <div className={`h-[1px] flex-1 mx-2 ${
                            sArr[sIdx+1].done ? 'bg-brand-500' : 'bg-slate-300'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Feedback Display comment card */}
                {design.adminFeedback && (design.status === 'Rejected' || design.status === 'Revision Needed') && (
                  <div className="p-4 rounded-xl border border-[#000000] bg-[#ffffff] flex flex-col gap-2 shadow-sm" style={{ borderLeftWidth: '4px', borderLeftColor: design.status === 'Rejected' ? '#e11d48' : '#ea580c' }}>
                    <p className={`font-black flex items-center gap-1.5 text-[9px] uppercase tracking-wider ${
                      design.status === 'Rejected' ? 'text-rose-700' : 'text-orange-700'
                    }`}>
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Reviewer Feedback Note</span>
                    </p>
                    <p className="italic leading-relaxed text-xs">"{design.adminFeedback}"</p>
                  </div>
                )}

                {/* Version History Accordion */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setVersionsOpen(prev => ({ ...prev, [design.id]: !verOpen }))}
                    className="flex items-center gap-2 text-xs text-slate-550 hover:text-[#000000] transition-colors w-full"
                  >
                    <History className="w-3.5 h-3.5 text-brand-400" />
                    <span className="font-bold">Review Cycles ({versions.length})</span>
                    <ChevronDown className={`w-4 h-4 ml-auto text-slate-500 transition-transform duration-250 ${verOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {verOpen && (
                    <div className="mt-3 flex flex-col gap-3 border-l-2 border-brand-500/30 pl-4 ml-3 animate-slide-down">
                      {versions.map((v) => (
                        <div key={v.version} className="relative flex flex-col gap-1">
                          {/* Timeline dot */}
                          <div className={`absolute -left-[21px] top-1.5 w-2 h-2 rounded-full ${
                            v.active ? 'bg-brand-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'bg-slate-300'
                          }`} />
                          
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-black font-mono px-2 py-0.5 rounded-full border ${
                              v.active 
                                ? 'bg-brand-5 border-brand-200 text-brand-700' 
                                : 'bg-slate-100 border-slate-200 text-slate-500'
                            }`}>{v.version}</span>
                            <span className="text-[10px] text-slate-500 font-bold">{v.date}</span>
                          </div>
                          <p className={`text-xs ${v.active ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                            {v.change}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions/Status Footer Section */}
                <div className="border-t border-slate-200 pt-4 mt-2 w-full">
                  {activeRole === 'admin' ? (
                    design.status === 'Approved' ? (
                      <div className="flex items-center justify-between w-full h-11 bg-[#ffffff] border border-[#000000] rounded-xl px-3 text-emerald-700 shadow-sm">
                        <span className="text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4" /> Production packing ready
                        </span>
                        <button 
                          type="button"
                          onClick={() => handleRevertToPending(design.id)}
                          className="px-3 py-1.5 text-[10px] font-bold text-slate-550 hover:text-slate-800 border border-slate-300 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
                        >
                          Reset
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-3 h-11 items-center w-full">
                        <button
                          type="button"
                          onClick={() => handleOpenFeedback(design.id)}
                          className="flex-1 h-11 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                          <span>Reject / Revisions</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(design.id)}
                          className="flex-1 h-11 bg-brand-600 hover:bg-brand-500 text-[#ffffff] text-xs font-bold rounded-xl shadow-lg hover:shadow-brand-500/20 transition-all flex items-center justify-center gap-1.5"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      </div>
                    )
                  ) : (
                    /* Customer tracking footer (Read Only) Premium Banners */
                    <div className="text-xs font-bold w-full">
                      {design.status === 'Approved' && (
                        <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-[#000000] bg-[#ffffff] shadow-sm">
                          <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-600" />
                          <span className="leading-relaxed font-semibold text-xs text-emerald-700">Approved! Your design is approved and ready for packing.</span>
                        </div>
                      )}
                      {design.status === 'Pending Review' && (
                        <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-[#000000] bg-[#ffffff] shadow-sm">
                          <Clock className="w-4 h-4 mt-0.5 flex-shrink-0 animate-pulse text-amber-600" />
                          <span className="leading-relaxed font-semibold text-xs text-amber-700">Awaiting administrator feedback. You will be notified.</span>
                        </div>
                      )}
                      {design.status === 'Revision Needed' && (
                        <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-[#000000] bg-[#ffffff] shadow-sm">
                          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 animate-bounce text-orange-600" />
                          <span className="leading-relaxed font-semibold text-xs text-orange-700">Revision Needed: {design.adminFeedback || 'Feedback pending'}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
 
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State Design */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 border border-dashed border-slate-800 rounded-3xl bg-slate-900/10 w-full max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-slate-950/40 border border-white/5 flex items-center justify-center">
            <FileText className="w-8 h-8 text-slate-500" />
          </div>
          <div className="text-center px-4">
            <h3 className="text-white font-extrabold text-lg">No Submissions Found</h3>
            <p className="text-slate-500 text-sm mt-1 leading-relaxed">
              There are currently no mockups matching the "{filterStatus}" status filter in your portal.
            </p>
          </div>
        </div>
      )}

      {/* Admin Action Rejection/Feedback Modal */}
      <Modal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        title="Reject or Request Changes"
        size="md"
        footer={
          <div className="flex gap-3 justify-end h-11">
            <button 
              onClick={() => setFeedbackModalOpen(false)}
              className="px-4 h-11 text-xs font-bold text-slate-400 hover:text-white border border-white/5 bg-slate-900/60 hover:bg-slate-950 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={submitFeedback}
              className="px-5 h-11 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-1.5"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              <span>Apply Decision</span>
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-slate-350 text-sm leading-relaxed">
            Explain the reasons for rejecting this mockup or requesting revisions. The customer will see this feedback in their tracker.
          </p>

          <SelectInput
            label="Rejection Type / Status"
            id="rejection-status"
            value={rejectionStatus}
            onChange={e => setRejectionStatus(e.target.value)}
            options={[
              { value: 'Revision Needed', label: 'Revision Needed (Customer can re-upload)' },
              { value: 'Rejected', label: 'Rejected (Complete disapproval)' }
            ]}
          />

          <TextArea
            label="Feedback & Change Instructions"
            id="admin-feedback-text"
            rows={4}
            value={feedbackText}
            onChange={e => setFeedbackText(e.target.value)}
            placeholder="Specify logo sizing, font issues, color matching instructions, alignment, etc..."
          />
        </div>
      </Modal>
    </div>
  );
}
