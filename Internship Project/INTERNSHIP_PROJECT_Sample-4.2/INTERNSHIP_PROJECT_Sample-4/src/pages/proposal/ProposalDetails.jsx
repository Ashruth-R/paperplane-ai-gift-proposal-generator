import { useParams, useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { ArrowLeft, Sparkles, AlertTriangle, Info, CheckCircle, DollarSign, Star, Clock, Download, Send, XCircle, MessageSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import StatusBadge, { PriorityBadge } from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Timeline from '../../components/proposal/Timeline';
import Modal from '../../components/common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Tooltip from '../../components/common/Tooltip';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import ProposalPDFPreview from '../../components/proposal/ProposalPDFPreview';

const alertIcons = { info: Info, warning: AlertTriangle, error: XCircle };
const alertColors = { info: 'border-blue-700/40 bg-blue-900/10 text-blue-300', warning: 'border-amber-700/40 bg-amber-900/10 text-amber-300', error: 'border-rose-700/40 bg-rose-900/10 text-rose-300' };

export default function ProposalDetails() {
  const { id } = useParams();
  const { proposals, updateProposal, showToast, addNotification, activeRole, addProposalMessage, tickets, updateTicketStatus, addTicketMessage, products } = useApp();
  const navigate = useNavigate();
  const proposal = proposals.find(p => p.id === id);
  const [chatMessage, setChatMessage] = useState('');
  const chatEndRef = useRef(null);

  const [approving, setApproving] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [exportModal, setExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  if (!proposal) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-surface-400">
        <Sparkles className="w-12 h-12 mb-4 text-surface-600" />
        <h2 className="text-xl font-bold text-surface-200">Proposal Not Found</h2>
        <p className="mt-2 text-sm">The requested proposal could not be found or has been removed.</p>
        <Button onClick={() => navigate(activeRole === 'admin' ? '/admin/proposals' : '/customer/enquiries')} className="mt-6">Return</Button>
      </div>
    );
  }

  const handleApprove = () => {
    setApproving(true);
    setTimeout(() => {
      setApproving(false);
      
      const unitBudget = proposal.budget / proposal.quantity;

      const getOccasionSuitability = (product, occasion) => {
        if (!occasion) return true;
        const occ = occasion.toLowerCase();
        const tags = (product.tags || []).map(t => t.toLowerCase());
        const name = product.name.toLowerCase();
        const category = product.category.toLowerCase();

        if (occ.includes('festive') || occ.includes('new year') || occ.includes('christmas') || occ.includes('diwali') || occ.includes('season')) {
          return (
            category === 'hampers' ||
            category === 'food & beverage' ||
            category === 'lifestyle' ||
            tags.includes('festive') ||
            tags.includes('gourmet') ||
            name.includes('hamper') ||
            name.includes('chocolate') ||
            name.includes('gift box')
          );
        }
        if (occ.includes('board') || occ.includes('executive') || occ.includes('client') || occ.includes('appreciation')) {
          return (
            tags.includes('executive') ||
            tags.includes('premium') ||
            tags.includes('luxury') ||
            category === 'stationery' ||
            category === 'office' ||
            name.includes('leather') ||
            name.includes('crystal') ||
            name.includes('holder')
          );
        }
        if (occ.includes('employee') || occ.includes('team') || occ.includes('rewards') || occ.includes('casual')) {
          return (
            category === 'apparel' ||
            category === 'electronics' ||
            category === 'lifestyle' ||
            tags.includes('utility') ||
            tags.includes('team') ||
            tags.includes('casual') ||
            name.includes('hoodie') ||
            name.includes('bottle') ||
            name.includes('charger')
          );
        }
        if (occ.includes('launch') || occ.includes('opening') || occ.includes('tech') || occ.includes('modern')) {
          return (
            category === 'electronics' ||
            category === 'stationery' ||
            tags.includes('modern') ||
            tags.includes('utility') ||
            tags.includes('tech') ||
            name.includes('charger') ||
            name.includes('bottle') ||
            name.includes('pen')
          );
        }
        if (occ.includes('healthcare') || occ.includes('eco') || occ.includes('sustainable') || occ.includes('csr')) {
          return (
            category === 'eco-friendly' ||
            category === 'lifestyle' ||
            tags.includes('eco') ||
            tags.includes('sustainable') ||
            tags.includes('wellness') ||
            name.includes('bamboo') ||
            name.includes('bottle')
          );
        }
        if (occ.includes('vip') || occ.includes('welcome') || occ.includes('guest') || occ.includes('hospitality')) {
          return (
            category === 'lifestyle' ||
            category === 'hampers' ||
            tags.includes('luxury') ||
            tags.includes('premium') ||
            name.includes('bathrobe') ||
            name.includes('slipper') ||
            name.includes('hamper')
          );
        }
        return true;
      };

      const getBrandingSuitability = (product, reqs) => {
        if (!reqs || reqs.length === 0) return true;
        
        const name = product.name.toLowerCase();
        const desc = (product.description || '').toLowerCase();
        const tags = (product.tags || []).map(t => t.toLowerCase());

        return reqs.some(req => {
          const r = req.toLowerCase();
          
          if (r.includes('embossing')) {
            return name.includes('leather') || desc.includes('leather') || name.includes('notebook') || name.includes('book');
          }
          if (r.includes('laser engraving') || r.includes('laser-engraved') || r.includes('engraving')) {
            return name.includes('crystal') || name.includes('bamboo') || name.includes('holder') || name.includes('bottle') || name.includes('nameplate') || name.includes('wooden') || desc.includes('engrav') || desc.includes('laser');
          }
          if (r.includes('screen printing') || r.includes('screen print') || r.includes('printing')) {
            return name.includes('charger') || name.includes('tote') || name.includes('bag') || name.includes('hoodie') || name.includes('cap') || name.includes('bottle') || desc.includes('screen') || desc.includes('pad print');
          }
          if (r.includes('embroidery') || r.includes('embroidered')) {
            return name.includes('hoodie') || name.includes('cap') || name.includes('bathrobe') || name.includes('slipper') || desc.includes('embroid');
          }
          if (r.includes('digital print')) {
            return name.includes('charger') || name.includes('tote') || name.includes('bag') || name.includes('hoodie') || name.includes('cap') || desc.includes('digital') || desc.includes('print');
          }
          if (r.includes('gold foil')) {
            return name.includes('leather') || name.includes('notebook') || name.includes('chocolate') || name.includes('holder') || desc.includes('gold') || desc.includes('foil');
          }
          if (r.includes('monogram')) {
            return name.includes('leather') || name.includes('notebook') || name.includes('crystal') || name.includes('holder') || name.includes('flask') || name.includes('bottle') || name.includes('nameplate') || desc.includes('monogram') || desc.includes('engrav');
          }
          if (r.includes('packaging')) {
            return name.includes('leather') || name.includes('notebook') || name.includes('chocolate') || name.includes('bathrobe') || name.includes('slipper') || name.includes('hamper') || name.includes('basket') || desc.includes('package') || desc.includes('box');
          }
          if (r.includes('label')) {
            return name.includes('notebook') || name.includes('charger') || name.includes('chocolate') || name.includes('bamboo') || name.includes('hamper') || name.includes('label');
          }
          if (r.includes('eco-friendly') || r.includes('sustainable') || r.includes('eco')) {
            return name.includes('bamboo') || name.includes('tote') || name.includes('bag') || tags.includes('eco') || tags.includes('sustainable') || desc.includes('eco') || desc.includes('biodegradable');
          }
          
          return false;
        });
      };

      // Filter catalog products to only those whose individual actual price is <= unitBudget
      const underBudgetProducts = (products || []).filter(p => p.price <= unitBudget);

      // Sort underBudgetProducts: prioritize branding and occasion match, then price descending
      const getSuitabilityGroup = (product) => {
        const matchesOccasion = getOccasionSuitability(product, proposal.occasion);
        const matchesBranding = getBrandingSuitability(product, proposal.brandingReqs);
        
        if (matchesOccasion && matchesBranding) return 3;
        if (matchesBranding) return 2;
        if (matchesOccasion) return 1;
        return 0;
      };

      const sortedProducts = [...underBudgetProducts].sort((a, b) => {
        const groupA = getSuitabilityGroup(a);
        const groupB = getSuitabilityGroup(b);
        if (groupA !== groupB) return groupB - groupA;
        return b.price - a.price; // Higher price first
      });

      // Greedily select items whose sum doesn't exceed unitBudget
      const selectedProducts = [];
      let currentSum = 0;

      for (const p of sortedProducts) {
        if (currentSum + p.price <= unitBudget) {
          selectedProducts.push(p);
          currentSum += p.price;
        }
      }

      // If we couldn't find any products under budget, fallback to the single cheapest product in the catalog
      if (selectedProducts.length === 0 && (products || []).length > 0) {
        const cheapest = [...(products || [])].sort((a, b) => a.price - b.price)[0];
        selectedProducts.push(cheapest);
        currentSum = cheapest.price;
      }

      const generatedRecommendations = selectedProducts.map((p, idx) => {
        return {
          id: `rec-${p.id}-${idx}`,
          product: p.name,
          score: Math.floor(92 + Math.random() * 8),
          reason: `Perfect fit for your ${proposal.occasion || 'corporate'} occasion, and fits exactly within your budget.`,
          price: p.price, // Use actual store catalog price (unscaled)
          category: p.category
        };
      });

      // Total Investment = sum of actual item prices
      const itemsTotal = currentSum;

      const generatedCostSummary = {
        productCost: itemsTotal,
        brandingCost: 0,
        packagingCost: 0,
        logisticsCost: 0,
        total: itemsTotal
      };

      updateProposal(proposal.id, {
        status: 'Approved',
        aiRecommendations: generatedRecommendations,
        costSummary: generatedCostSummary,
        budget: itemsTotal
      });

      // Admin Notification
      addNotification({
        role: 'admin',
        type: 'reminder',
        message: `Status Update: You approved the design mockup for ${proposal.clientName}.`,
        link: `/admin/proposals/${proposal.id}`
      });

      // Update the related ticket if there is one
      const relatedTicket = tickets?.find(t => t.proposalId === proposal.id || t.id === proposal.ticketId);
      if (relatedTicket) {
        updateTicketStatus(relatedTicket.id, 'Resolved');
        addTicketMessage(relatedTicket.id, {
          sender: 'admin',
          text: `Great news! Your custom proposal (${proposal.id}) has been Approved by the administration team. You can view the details in the Proposals section.`,
          timestamp: new Date().toISOString()
        });
      }

      // Customer Notifications
      const occasionName = proposal.occasion || 'Diwali event';
      addNotification({
        role: 'customer',
        type: 'alert',
        message: `Proposal Ready: Your AI corporate gift proposal for the ${occasionName} is ready to view.`,
        link: '/customer/store',
        customerEmail: proposal.contactEmail,
        companyName: proposal.clientName
      });

      const firstRec = proposal.aiRecommendations?.[0]?.product || 'Leather Notebooks';
      const qty = proposal.quantity || 50;
      addNotification({
        role: 'customer',
        type: 'reminder',
        message: `Order Confirmed: Your bulk order for ${qty} ${firstRec} has been confirmed.`,
        link: '/customer/store',
        customerEmail: proposal.contactEmail,
        companyName: proposal.clientName
      });

      showToast('Proposal approved successfully!', 'success');
    }, 1500);
  };

  const handleReject = () => {
    setRejecting(true);
    setTimeout(() => {
      setRejecting(false);
      setRejectModal(false);
      updateProposal(proposal.id, { status: 'Rejected' });

      // Admin Notification
      addNotification({
        role: 'admin',
        type: 'alert',
        message: `Status Update: You rejected the proposal for ${proposal.clientName}.`,
        link: `/admin/proposals/${proposal.id}`
      });

      // Update the related ticket if there is one
      const relatedTicket = tickets?.find(t => t.proposalId === proposal.id || t.id === proposal.ticketId);
      if (relatedTicket) {
        updateTicketStatus(relatedTicket.id, 'Closed');
        addTicketMessage(relatedTicket.id, {
          sender: 'admin',
          text: `Unfortunately, your custom proposal (${proposal.id}) has been Rejected by the administration team. Reason: ${rejectReason}`,
          timestamp: new Date().toISOString()
        });
      }

      // Customer Notification
      const firstRec = proposal.aiRecommendations?.[0]?.product || 'Crystal Desk Organizer';
      addNotification({
        role: 'customer',
        type: 'alert',
        message: `Action Required: Your personalization design for the ${firstRec} was rejected. Please review feedback.`,
        link: '/customer/design-approvals',
        customerEmail: proposal.contactEmail,
        companyName: proposal.clientName
      });

      showToast('Proposal sent back for revision.', 'error');
    }, 1500);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const input = document.getElementById('pdf-content');
      if (!input) throw new Error('PDF content not found');
      
      // Momentarily ensure no scaling issues by waiting for next frame
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(input, { 
        scale: 2, 
        useCORS: true, 
        logging: false, 
        letterRendering: true 
      });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [800, 1131]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, 800, 1131);
      const safeName = proposal.clientName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      pdf.save(`proposal_${proposal.id}_${safeName}.pdf`);
      
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
    if (!chatMessage.trim() || !proposal) return;
    addProposalMessage(proposal.id, { sender: activeRole, text: chatMessage, timestamp: new Date().toISOString() });
    setChatMessage('');
    
    // Notify the other party
    const targetRole = activeRole === 'admin' ? 'customer' : 'admin';
    addNotification({
      role: targetRole,
      type: 'message',
      message: `New message on proposal ${proposal.id} from ${activeRole === 'admin' ? 'coordinator' : 'customer'}.`,
      link: `/${targetRole}/proposals/${proposal.id}`,
      ...(targetRole === 'customer' ? { customerEmail: proposal.contactEmail, companyName: proposal.clientName } : {})
    });
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const { costSummary: cs } = proposal;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <button 
          onClick={() => navigate(activeRole === 'admin' ? '/admin/proposals' : '/customer/enquiries')} 
          className="flex items-center gap-1.5 text-surface-400 hover:text-surface-100 text-sm transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" /> {activeRole === 'admin' ? 'All Proposals' : 'Corporate Enquiries'}
        </button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-surface-100">{proposal.clientName}</h1>
            <StatusBadge status={proposal.status} />
            <PriorityBadge priority={proposal.priority} />
          </div>
          <p className="text-surface-500 text-sm mt-1">{proposal.id} · {proposal.occasion} · {proposal.clientType}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon={Download} size="sm" onClick={() => setExportModal(true)}>Export PDF</Button>
          {activeRole === 'admin' && proposal.status !== 'Approved' && proposal.status !== 'Dispatched' && (
            <>
              <Button variant="danger" size="sm" icon={XCircle} onClick={() => setRejectModal(true)}>Reject</Button>
              <Button variant="success" size="sm" loading={approving} icon={CheckCircle} onClick={handleApprove}>Approve</Button>
            </>
          )}
          {activeRole === 'admin' && (
            <Tooltip content="Feature requires backend integration" position="left">
              <Button variant="ghost" size="sm" disabled icon={Send}>Send to CRM</Button>
            </Tooltip>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* AI Recommendations */}
          <div className="bg-surface-800 border border-surface-700/50 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-brand-600/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <h2 className="text-surface-100 font-semibold">AI Recommendations</h2>
                <p className="text-surface-500 text-xs">AI-curated gift selections based on client profile</p>
              </div>
            </div>
            {proposal.aiRecommendations.length === 0 ? (
              <div className="flex items-center gap-3 p-4 bg-blue-900/10 border border-blue-700/30 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-blue-400 animate-spin-slow" />
                </div>
                <div>
                  <p className="text-blue-300 text-sm font-medium">AI Processing in Progress</p>
                  <p className="text-blue-400/60 text-xs">Recommendations will appear once the AI engine completes analysis</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {proposal.aiRecommendations.map(rec => (
                  <div key={rec.id} className="flex items-start gap-4 p-4 bg-surface-900/50 rounded-xl border border-surface-700/30 hover:border-brand-500/30 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-900/60 to-brand-800/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">🎁</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-surface-100 font-semibold text-sm">{rec.product}</p>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-amber-300 text-xs font-bold">{rec.score}</span>
                        </div>
                      </div>
                      <p className="text-surface-400 text-xs mt-0.5 leading-relaxed">{rec.reason}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-brand-400 font-semibold text-sm">{formatCurrency(rec.price)}</span>
                        <span className="text-xs text-surface-600">per unit</span>
                        <span className="ml-auto text-xs bg-surface-700 text-surface-300 px-2 py-0.5 rounded-full">{rec.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Alerts */}
          {proposal.systemAlerts.length > 0 && (
            <div className="bg-surface-800 border border-surface-700/50 rounded-2xl p-5">
              <h2 className="text-surface-100 font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                System Alerts
              </h2>
              <div className="flex flex-col gap-3">
                {proposal.systemAlerts.map((alert, i) => {
                  const Icon = alertIcons[alert.type] || Info;
                  return (
                    <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${alertColors[alert.type]}`}>
                      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm leading-relaxed">{alert.message}</p>
                        <p className="text-xs opacity-60 mt-1">{formatDate(alert.time, { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Proposal Timeline */}
          <div className="bg-surface-800 border border-surface-700/50 rounded-2xl p-5">
            <h2 className="text-surface-100 font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-400" />
              Proposal History
            </h2>
            <Timeline events={proposal.actionHistory} />
          </div>

          {/* Proposal Communication / Chat Interface */}
          <div className="bg-surface-800 border border-surface-700/50 rounded-2xl p-5">
            <h2 className="text-surface-100 font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-400" />
              Message Coordinator
            </h2>
            <div className="flex flex-col gap-4 h-[300px] bg-surface-900/50 border border-surface-700/50 rounded-xl p-4 shadow-inner">
              <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2 no-scrollbar">
                {(proposal.chatHistory || []).map((msg, i) => {
                  const textContent = msg.text || (msg.message && msg.message.text) || msg.message || '';
                  const msgSender = msg.sender || (msg.message && msg.message.sender) || 'customer';
                  const isMe = msgSender === activeRole;
                  return (
                    <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <span className="text-[10px] text-surface-500 font-bold uppercase tracking-wider mb-1">
                        {isMe ? 'You' : (msgSender === 'admin' ? 'Coordinator' : 'Customer')}
                      </span>
                      <div className={`px-3 py-2 rounded-xl text-sm max-w-[85%] shadow-md ${isMe ? 'bg-brand-600/80 text-white' : 'bg-surface-800 border border-surface-700/50 text-surface-200'}`}>
                        {textContent}
                      </div>
                      <span className="text-[9px] text-surface-600 mt-1">{formatDate(msg.timestamp || new Date().toISOString(), { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  );
                })}
                {(!proposal.chatHistory || proposal.chatHistory.length === 0) && (
                  <p className="text-center text-surface-500 text-xs mt-10">No messages yet. Send a message to start the conversation.</p>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="flex gap-2">
                <input 
                  value={chatMessage} onChange={e => setChatMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 bg-surface-950 border border-surface-700/50 rounded-xl px-4 py-2 text-sm text-surface-100 focus:outline-none focus:border-brand-500 transition-colors"
                />
                <button onClick={handleSendMessage} disabled={!chatMessage.trim()} className="px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:bg-surface-800 disabled:text-surface-500 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4">
          {/* Key Info */}
          <div className="bg-surface-800 border border-surface-700/50 rounded-2xl p-5">
            <h3 className="text-surface-100 font-semibold text-sm mb-4">Proposal Details</h3>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Contact Person', value: proposal.contactPerson || '—' },
                { label: 'Email', value: proposal.contactEmail || '—' },
                { label: 'Quantity', value: `${proposal.quantity?.toLocaleString()} units` },
                { label: 'Delivery Date', value: formatDate(proposal.deliveryTimeline) },
                { label: 'Created', value: formatDate(proposal.createdAt) },
                { label: 'Last Updated', value: formatDate(proposal.updatedAt) },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-start gap-2 pb-2.5 border-b border-surface-700/30 last:border-0 last:pb-0">
                  <span className="text-surface-500 text-xs flex-shrink-0">{item.label}</span>
                  <span className="text-surface-200 text-xs text-right font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Summary */}
          <div className="bg-surface-800 border border-surface-700/50 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <h3 className="text-surface-100 font-semibold text-sm">Cost Summary</h3>
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <span className="text-surface-200 font-semibold text-sm">Total Investment</span>
                <span className="text-brand-400 font-bold">{formatCurrency(cs?.total || proposal.budget)}</span>
              </div>
            </div>
          </div>

          {/* Branding Reqs */}
          <div className="bg-surface-800 border border-surface-700/50 rounded-2xl p-5">
            <h3 className="text-surface-100 font-semibold text-sm mb-3">Branding Requirements</h3>
            <div className="flex flex-wrap gap-1.5">
              {proposal.brandingReqs?.map(req => (
                <span key={req} className="text-xs bg-brand-900/30 text-brand-300 border border-brand-700/30 px-2 py-0.5 rounded-full">{req}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      <Modal isOpen={rejectModal} onClose={() => setRejectModal(false)} title="Reject Design / Proposal" size="sm"
        footer={<><Button variant="ghost" onClick={() => setRejectModal(false)}>Cancel</Button><Button variant="danger" loading={rejecting} icon={XCircle} onClick={handleReject}>Confirm Rejection</Button></>}>
        <div className="flex flex-col gap-4">
          <p className="text-surface-300 text-sm">Please provide a reason for rejection so the team can revise accordingly.</p>
          <textarea
            rows={4}
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="e.g. Logo placement is incorrect, brand colors don't match guidelines..."
            className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-surface-100 text-sm placeholder-surface-500 focus:outline-none focus:border-brand-500 resize-none"
          />
        </div>
      </Modal>

      {/* Export Modal */}
      <Modal isOpen={exportModal} onClose={() => setExportModal(false)} title="Proposal PDF Preview" size="xl"
        footer={<><Button variant="ghost" onClick={() => setExportModal(false)}>Cancel</Button><Button loading={exporting} icon={Download} onClick={handleExport}>Download PDF</Button></>}>
        <div className="flex flex-col gap-3 h-full">
          <p className="text-surface-300 text-sm">Review the generated PDF preview for <strong className="text-surface-100">{proposal.clientName}</strong>. Click Download PDF to save it.</p>
          <div className="flex-1 bg-slate-900 rounded-xl p-4 overflow-y-auto max-h-[65vh] flex justify-center shadow-inner">
             {/* The wrapper scales it down purely visually so it fits inside the modal without horizontal scrolling */}
             <div className="origin-top" style={{ transform: 'scale(0.8)', marginBottom: '-220px' }}>
                <ProposalPDFPreview proposal={proposal} />
             </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
