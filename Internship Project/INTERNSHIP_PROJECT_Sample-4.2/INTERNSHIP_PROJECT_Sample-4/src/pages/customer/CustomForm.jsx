import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, CheckCircle, Loader2, ArrowRight, Clipboard, Sparkles, Info, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { OCCASIONS, BRANDING_OPTIONS, CLIENT_TYPES } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';

const STEPS = ['Recipient Details', 'Budget & Quantity', 'Occasion & Branding', 'Confirmation'];

const SECTION_HEADERS = [
  {
    title: 'Recipient Details',
    subtitle: 'Tell us who will receive this corporate gift',
    icon: Gift,
    color: 'from-brand-500/20 to-indigo-500/10 text-brand-400'
  },
  {
    title: 'Budget & Quantity',
    subtitle: 'Define your quantities and target budget per unit',
    icon: Clipboard,
    color: 'from-blue-500/20 to-indigo-500/10 text-blue-400'
  },
  {
    title: 'Occasion & Branding',
    subtitle: 'Select the occasion theme and branding requirements',
    icon: Sparkles,
    color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400'
  },
  {
    title: 'Review Request',
    subtitle: 'Verify your corporate gift request details before submitting',
    icon: CheckCircle,
    color: 'from-pink-500/20 to-rose-500/10 text-pink-400'
  }
];

// Custom floating label text input
function FloatingInput({ label, id, value, onChange, placeholder, type = 'text', min }) {
  const [focused, setFocused] = useState(false);
  const isFilled = value !== undefined && value !== null && value.toString().length > 0;
  const active = focused || isFilled;
  
  return (
    <div className="relative w-full group">
      <input
        type={type}
        id={id}
        min={min}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full h-[56px] px-4 pt-5 pb-1 bg-[#ffffff] border border-slate-500 rounded-[14px] text-sm text-slate-800 placeholder-transparent outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all duration-300"
        placeholder={placeholder}
      />
      <label
        htmlFor={id}
        className={`absolute left-4 pointer-events-none transition-all duration-200 ${
          active 
            ? 'top-1.5 text-[10px] font-bold text-brand-600' 
            : 'top-[17px] text-sm text-slate-500'
        }`}
      >
        {label}
      </label>
    </div>
  );
}

// Custom floating label select — fully custom to support light-blue hover highlight
function FloatingSelect({ label, id, value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isFilled = value !== undefined && value !== null && value.toString().length > 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (opt) => {
    onChange({ target: { value: opt } });
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative w-full" id={id}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full h-[56px] px-4 text-left border rounded-[14px] text-sm transition-all duration-300 flex items-end pb-1 ${
          open
            ? 'border-brand-500 ring-2 ring-brand-500/20'
            : 'border-slate-500'
        }`}
        style={{ backgroundColor: '#ffffff', color: isFilled ? '#1e293b' : 'transparent' }}
      >
        {value || '\u00A0'}
      </button>

      {/* Floating label */}
      <label
        className={`absolute left-4 pointer-events-none transition-all duration-200 ${
          isFilled || open
            ? 'top-1.5 text-[10px] font-bold text-brand-600'
            : 'top-[17px] text-sm text-slate-500'
        }`}
      >
        {label}
      </label>

      {/* Chevron icon */}
      <div className={`absolute right-4 top-[20px] pointer-events-none transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
        <svg className="w-4 h-4 fill-current text-slate-500" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>

      {/* Dropdown list */}
      {open && (
        <div
          className="absolute z-50 w-full mt-1 rounded-[14px] border border-slate-300 overflow-hidden shadow-lg"
          style={{ backgroundColor: '#ffffff' }}
        >
          <div className="max-h-52 overflow-y-auto">
            {options.map(opt => (
              <button
                type="button"
                key={opt}
                onClick={() => handleSelect(opt)}
                className="w-full text-left px-4 py-2.5 text-sm transition-colors duration-150"
                style={{
                  backgroundColor: opt === value ? '#bae6fd' : '#ffffff',
                  color: opt === value ? '#0369a1' : '#1e293b',
                  fontWeight: opt === value ? '600' : '400',
                }}
                onMouseEnter={e => {
                  if (opt !== value) {
                    e.currentTarget.style.backgroundColor = '#e0f2fe';
                    e.currentTarget.style.color = '#0369a1';
                  }
                }}
                onMouseLeave={e => {
                  if (opt !== value) {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.color = '#1e293b';
                  }
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Custom floating label textarea
function FloatingTextArea({ label, id, value, onChange, placeholder, rows = 3 }) {
  const [focused, setFocused] = useState(false);
  const isFilled = value !== undefined && value !== null && value.toString().length > 0;
  const active = focused || isFilled;

  return (
    <div className="relative w-full group">
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full px-4 pt-6 pb-2 bg-[#ffffff] border border-slate-500 rounded-[14px] text-sm text-slate-800 placeholder-transparent outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all duration-300 resize-none"
        placeholder={placeholder}
      />
      <label
        htmlFor={id}
        className={`absolute left-4 pointer-events-none transition-all duration-200 ${
          active 
            ? 'top-1.5 text-[10px] font-bold text-brand-600' 
            : 'top-[18px] text-sm text-slate-500'
        }`}
      >
        {label}
      </label>
    </div>
  );
}

// Custom range slider
function CustomRangeSlider({ label, id, min, max, value, onChange, formatValue }) {
  return (
    <div className="space-y-3.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        <span className="text-brand-400 font-extrabold text-sm bg-brand-500/10 border border-brand-500/20 px-3 py-1 rounded-full">{formatValue(value)}</span>
      </div>
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        className="w-full accent-brand-500 bg-slate-950/60 h-2 rounded-lg cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
}

// Custom multi-select component styled as glass pills
function CustomMultiSelect({ label, options, selected = [], onChange }) {
  const toggleOption = (opt) => {
    const next = selected.includes(opt) 
      ? selected.filter(o => o !== opt)
      : [...selected, opt];
    onChange(next);
  };

  return (
    <div className="space-y-3.5">
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</label>
      <div className="flex flex-wrap gap-2.5">
        {options.map(opt => {
          const isSelected = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggleOption(opt)}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200 ${
                isSelected 
                  ? 'bg-brand-600 text-white border-brand-500/30 shadow-md shadow-brand-500/25 hover:shadow-brand-500/40' 
                  : 'bg-[#ffffff] text-slate-600 border-slate-400 hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function CustomForm() {
  const { showToast, addTicket, addNotification, activeUser, addProposal } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [generatedTicketId, setGeneratedTicketId] = useState('');

  const [form, setForm] = useState({
    recipientName: '', recipientRole: '', company: '', industry: '',
    quantity: 1, budget: 5000,
    occasion: '', brandingReqs: [], message: '', notes: '',
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = () => {
    setLoading(true);
    setTimeout(() => {
      const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const orderDetails = {
        recipientName: form.recipientName || 'Unspecified Recipient',
        recipientRole: form.recipientRole || 'Unspecified Role',
        company: form.company || 'Unspecified Company',
        industry: form.industry || CLIENT_TYPES[0],
        quantity: form.quantity,
        budget: form.budget,
        occasion: form.occasion || OCCASIONS[0],
        brandingReqs: form.brandingReqs,
        notes: form.notes || form.message || 'No additional notes'
      };

      const proposalId = `PRO-${Math.floor(1000 + Math.random() * 9000)}`;

      const newTicket = {
        id: ticketId,
        ticketId: ticketId,
        proposalId: proposalId,
        subject: `Custom Gift Order: ${form.occasion || 'General Gifting'} request for ${form.recipientName || 'Client'} (${form.company || 'Enterprise'})`,
        type: 'Custom Gift Order',
        priority: 'High',
        status: 'Open',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        assignedTo: 'Unassigned',
        messages: 0,
        orderDetails: orderDetails,
        customerEmail: activeUser?.email,
        companyName: activeUser?.company,
        customerName: activeUser?.name
      };

      addTicket(newTicket);

      const userName = activeUser?.name || 'Priya Sharma';
      const userCompany = activeUser?.company || 'TechNova Solutions';

      const totalBudget = form.budget * form.quantity;

      const newProposal = {
        id: proposalId,
        ticketId: ticketId,
        clientName: form.company || userCompany,
        clientType: form.industry || CLIENT_TYPES[0],
        contactPerson: form.recipientName || 'Unspecified Recipient',
        contactEmail: activeUser?.email || 'email@example.com',
        contactName: activeUser?.name || 'Unspecified Name',
        quantity: form.quantity,
        budget: totalBudget,
        brandingReqs: form.brandingReqs,
        deliveryTimeline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Draft',
        priority: 'Medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        occasion: form.occasion || OCCASIONS[0],
        aiRecommendations: [],
        costSummary: { productCost: totalBudget, brandingCost: 0, packagingCost: 0, logisticsCost: 0, total: totalBudget },
        systemAlerts: [],
        actionHistory: [
          { id: 1, actor: userName, action: 'Draft proposal created via Custom Form', timestamp: new Date().toISOString(), status: 'Draft' },
        ],
      };
      addProposal(newProposal);

      addNotification({
        role: 'customer',
        type: 'message',
        message: `Success: Your Custom Gift Form was submitted. Ticket ID: ${ticketId}.`,
        link: '/customer/enquiries',
        customerEmail: activeUser?.email
      });

      addNotification({
        role: 'admin',
        type: 'message',
        message: `New Enquiry: Received a new custom gift form submission from ${userName} (${ticketId}).`,
        link: '/customer/enquiries'
      });

      addNotification({
        role: 'admin',
        type: 'alert',
        message: `New Proposal Request: ${userCompany} has requested a new AI proposal.`,
        link: '/admin/proposals'
      });

      setGeneratedTicketId(ticketId);
      setLoading(false);
      setDone(true);
      showToast(`Success! Custom gift ticket ${ticketId} created.`, 'success');
    }, 1500);
  };

  const isStepValid = () => {
    if (step === 0) {
      return (
        form.recipientName.trim() !== '' &&
        form.recipientRole.trim() !== '' &&
        form.company.trim() !== '' &&
        form.industry !== ''
      );
    }
    if (step === 1) {
      return form.quantity && form.quantity >= 1 && form.budget && form.budget >= 500;
    }
    if (step === 2) {
      return form.occasion !== '';
    }
    return true;
  };

  const ActiveHeader = SECTION_HEADERS[step];

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[480px] gap-6 text-center max-w-lg mx-auto py-8">
        <div className="w-20 h-20 rounded-full bg-emerald-950/40 border-2 border-emerald-500/50 flex items-center justify-center shadow-glow shadow-emerald-500/10">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Custom Gift Request Submitted!</h2>
          <p className="text-slate-500 text-sm mt-2">
            Your custom gift request has been submitted successfully. A tracking ticket has been generated to monitor its review status.
          </p>
        </div>

        {/* Ticket ID Display Card */}
        <div className="bg-[#ffffff] border border-slate-900 rounded-2xl p-5 w-full flex flex-col gap-3 shadow-sm">
          <div className="flex justify-between items-center bg-[#f8fafc] px-4 py-3 rounded-xl border border-slate-900">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Tracking Ticket ID</span>
            <div className="flex items-center gap-2">
              <span className="text-brand-600 font-mono font-bold text-base">{generatedTicketId}</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(generatedTicketId);
                  showToast('Ticket ID copied to clipboard!', 'success');
                }}
                className="text-slate-500 hover:text-slate-900 p-1 transition-colors"
                title="Copy Ticket ID"
              >
                <Clipboard className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-slate-500 text-xs text-left">
            You can track this request's timeline, view details, and chat with our gifting coordinators in the Enquiry Portal.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3.5 w-full">
          <button 
            onClick={() => { 
              setDone(false); 
              setStep(0); 
              setForm({ recipientName: '', recipientRole: '', company: '', industry: '', quantity: 1, budget: 5000, occasion: '', brandingReqs: [], message: '', notes: '' }); 
            }}
            className="flex-1 py-3 text-sm font-bold bg-[#ffffff] border border-slate-400 text-slate-600 hover:text-slate-900 hover:border-slate-900 rounded-xl transition-all"
          >
            Submit Another Request
          </button>
          <button 
            onClick={() => navigate('/customer/enquiries')}
            className="flex-1 py-3 text-sm font-bold bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-lg hover:shadow-brand-500/25 hover:shadow-brand-500/40 transition-all flex items-center justify-center gap-1.5"
          >
            <span>Track in Enquiry Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Isolated Styles */}
      <style>{`
        @keyframes pulse-subtle {
          0% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(168, 85, 247, 0); }
          100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s infinite;
        }
        @keyframes fadeInSlide {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-step-transition {
          animation: fadeInSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Custom Gift Request</h1>
        <p className="text-slate-400 text-sm mt-1">Describe your requirements and we'll create a personalized gifting experience</p>
      </div>

      {/* Modern Multi-Step Wizard */}
      <div className="flex items-center justify-between w-full mb-6 relative px-2 max-w-4xl mx-auto">
        {/* Background Line */}
        <div className="absolute top-[22px] left-10 right-10 h-[2px] bg-slate-200 -z-10" />
        {/* Foreground Progress Line */}
        <div 
          className="absolute top-[22px] left-10 right-10 h-[2px] bg-gradient-to-r from-brand-500 to-indigo-500 -z-10 transition-all duration-300"
          style={{ width: `${(step / (STEPS.length - 1)) * 95}%` }}
        />

        {STEPS.map((s, i) => {
          const isCompleted = i < step;
          const isActive = i === step;
          return (
            <div key={i} className="flex flex-col items-center flex-1 relative group select-none">
              {/* Circle Indicator */}
              <div 
                className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-[#ffffff] border-brand-600 text-brand-600 shadow-sm' 
                    : isActive 
                      ? 'bg-[#ffffff] border-2 border-brand-600 text-brand-600 shadow-md shadow-brand-500/10 animate-pulse-subtle' 
                      : 'bg-[#ffffff] border-slate-300 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-brand-600" />
                ) : (
                  <span className="text-xs font-black">{i + 1}</span>
                )}
              </div>
              {/* Step Name */}
              <span 
                className={`text-[10px] md:text-xs mt-3 font-bold transition-all duration-300 whitespace-nowrap tracking-wider uppercase ${
                  isActive 
                    ? 'text-brand-600 font-extrabold' 
                    : isCompleted 
                      ? 'text-slate-800' 
                      : 'text-slate-400'
                }`}
              >
                <span className="hidden md:inline">{s}</span>
                <span className="inline md:hidden">{s.split(' ')[0]}</span>
              </span>
            </div>
          );
        })}
      </div>

      {/* Guided Corporate Gifting Grid (Left Form + Right Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto w-full">
        
        {/* Main Form Container (lg:col-span-8) */}
        <div className="lg:col-span-8 bg-[#ffffff] border border-slate-900 rounded-[24px] p-6 md:p-8 shadow-sm relative w-full">
          
          {/* Section Header */}
          <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${ActiveHeader.color} flex items-center justify-center`}>
              <ActiveHeader.icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">{ActiveHeader.title}</h2>
              <p className="text-slate-500 text-xs mt-0.5">{ActiveHeader.subtitle}</p>
            </div>
          </div>

          {/* Form Step Body */}
          <div key={step} className="animate-step-transition">
            {step === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FloatingInput label="Recipient Name" id="rname" value={form.recipientName} onChange={e => set('recipientName', e.target.value)} placeholder="e.g. Priya Sharma" />
                <FloatingInput label="Role / Designation" id="rrole" value={form.recipientRole} onChange={e => set('recipientRole', e.target.value)} placeholder="e.g. CEO, HR Manager, Client" />
                <FloatingInput label="Company Name" id="rcomp" value={form.company} onChange={e => set('company', e.target.value)} placeholder="e.g. TechNova Solutions" />
                <FloatingSelect label="Industry" id="rind" options={CLIENT_TYPES} value={form.industry} onChange={e => set('industry', e.target.value)} />
              </div>
            )}

            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FloatingInput label="Quantity (units)" id="qty" type="number" min="1" value={form.quantity} onChange={e => set('quantity', parseInt(e.target.value) || 1)} />
                <CustomRangeSlider label="Budget per unit" id="budget" min={500} max={50000} value={form.budget} onChange={e => set('budget', parseInt(e.target.value))} formatValue={formatCurrency} />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <FloatingSelect label="Occasion" id="occ" options={OCCASIONS} value={form.occasion} onChange={e => set('occasion', e.target.value)} />
                <CustomMultiSelect label="Branding Requirements" options={BRANDING_OPTIONS} selected={form.brandingReqs} onChange={v => set('brandingReqs', v)} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FloatingTextArea label="Personal Message (Optional)" id="msg" value={form.message} onChange={e => set('message', e.target.value)} placeholder="Add a personal note to include with the gift..." rows={3} />
                  <FloatingTextArea label="Additional Notes" id="notes" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any special requirements or preferences..." rows={3} />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Recipient', value: form.recipientName || '—', icon: '👤' },
                  { label: 'Company', value: form.company || '—', icon: '🏢' },
                  { label: 'Occasion', value: form.occasion || '—', icon: '🎉' },
                  { label: 'Quantity', value: `${form.quantity} unit(s)`, icon: '📦' },
                  { label: 'Budget/unit', value: formatCurrency(form.budget), icon: '💵' },
                  { label: 'Total Est.', value: formatCurrency(form.budget * form.quantity), icon: '📈' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3.5 bg-[#ffffff] border border-slate-900 rounded-xl p-4 shadow-sm">
                    <span className="text-xl select-none">{item.icon}</span>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">{item.label}</span>
                      <span className="text-slate-800 text-sm font-semibold block mt-0.5">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Action Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-white/[0.04]">
            <button 
              type="button"
              disabled={step === 0} 
              onClick={() => setStep(s => s - 1)}
              className="px-6 h-12 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-400 hover:text-white hover:bg-white/5"
            >
              ← Back
            </button>
            {step < STEPS.length - 1 ? (
              <button 
                type="button"
                disabled={!isStepValid()}
                onClick={() => setStep(s => s + 1)}
                className="px-6 h-12 bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-brand-500/25 hover:shadow-brand-500/40 transition-all duration-300 flex items-center gap-1.5 hover:-translate-y-[1px] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                type="button"
                disabled={loading || !isStepValid()}
                onClick={submit}
                className="px-6 h-12 bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-brand-500/25 hover:shadow-brand-500/40 transition-all duration-300 flex items-center gap-1.5 hover:-translate-y-[1px] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Gift className="w-4 h-4" />
                    <span>Submit Request</span>
                  </>
                )}
              </button>
            )}
          </div>

        </div>

        {/* Right Info Sidebar (lg:col-span-4 hidden lg:block) */}
        <div className="lg:col-span-4 hidden lg:flex flex-col gap-6">
          
          <div className="bg-[#ffffff] border border-slate-900 rounded-[24px] p-6 shadow-sm space-y-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-3">
              Gifting Services
            </h3>

            <div className="space-y-4">
              <div className="flex gap-3.5">
                <span className="text-2xl mt-0.5 select-none">🎁</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Personalized Recommendations</h4>
                  <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">
                    AI-curated selections matching your recipient designation & corporate occasion.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5">
                <span className="text-2xl mt-0.5 select-none">🏷</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Branding Options Available</h4>
                  <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">
                    Laser engraving, gold foil stamp, screen print, and custom embossing logo pads.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5">
                <span className="text-2xl mt-0.5 select-none">🚚</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Bulk Order Support</h4>
                  <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">
                    Dedicated operations shipping and delivery logistics for corporate requests.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5">
                <span className="text-2xl mt-0.5 select-none">🎨</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Custom Packaging</h4>
                  <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">
                    Luxury premium cardboard boxes, wooden baskets, and custom gift tags.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Help Card */}
          <div className="bg-brand-50/50 border border-brand-100 rounded-[24px] p-6 shadow-sm space-y-3">
            <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center">
              <Info className="w-4 h-4 text-brand-600" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-brand-700 uppercase tracking-wider">Need Assistance?</h4>
              <p className="text-[10px] text-slate-600 mt-2 leading-relaxed">
                Our B2B gifting team is ready to help you assemble custom hampers and finalize themes.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
