import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, TrendingUp, AlertTriangle, RefreshCw, Database, Star, Minus, Search } from 'lucide-react';
import MetricCard from '../../components/dashboard/MetricCard';
import ActionList from '../../components/dashboard/ActionList';
import PriorityQueue from '../../components/dashboard/PriorityQueue';
import ApprovalBoard from '../../components/proposal/ApprovalBoard';
import { useApp } from '../../context/AppContext';
import Tooltip from '../../components/common/Tooltip';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge, { PriorityBadge } from '../../components/common/StatusBadge';
import { formatCurrency } from '../../utils/formatters';

export default function AdminDash() {
  const navigate = useNavigate();
  const { proposals, returnRequests, orderedItems, users } = useApp();
  const [showTotalModal, setShowTotalModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [showValueModal, setShowValueModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [usersSearchQuery, setUsersSearchQuery] = useState('');
  const [proposalsSearchQuery, setProposalsSearchQuery] = useState('');
  const [highPrioritySearchQuery, setHighPrioritySearchQuery] = useState('');
  
  const isHighPriority = (p) => p.priority === 'High' || p.status === 'Designer-Review' || (p.budget_per_unit * p.quantity >= 5000) || (p.budget >= 5000);
  const highPriority = proposals.filter(isHighPriority);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const activeCustomers = (users || []).filter(u => u.role === 'customer');
  const displayActiveUsers = activeCustomers.length > 0 ? activeCustomers.length : 1;
  
  // Safely parse dates to avoid Safari 'Invalid Date' on python ISO strings
  const parseDateSafely = (dateStr) => {
    if (!dateStr) return new Date();
    const cleanStr = typeof dateStr === 'string' ? dateStr.split('.')[0] : dateStr;
    const d = new Date(cleanStr);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  // Include all proposals in the dashboard metrics to ensure visibility
  const thisMonthProposals = proposals || [];
  
  const totalBudgetThisMonth = thisMonthProposals.filter(p => p.status !== 'Rejected' && p.status !== 'REJECTED').reduce((sum, p) => sum + ((p.budget_per_unit * p.quantity) || p.budget || 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-100">Admin Overview</h1>
          <p className="text-surface-400 text-sm mt-1">System-wide status and operations control</p>
        </div>
        <div className="flex gap-2">
          <Tooltip content="Feature requires backend integration" position="left">
            <Button variant="ghost" disabled icon={Database}>Sync CRM</Button>
          </Tooltip>
          <Tooltip content="Feature requires backend integration" position="left">
            <Button variant="ghost" disabled icon={RefreshCw}>Live Inventory</Button>
          </Tooltip>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Proposals" 
          value={proposals.length} 
          change={12} 
          changeLabel="vs last month" 
          icon={FileText} 
          color="brand" 
          onClick={() => setShowTotalModal(true)}
        />
        <MetricCard 
          title="Total Pipeline Value" 
          value={totalBudgetThisMonth} 
          format="currency" 
          change={8} 
          icon={TrendingUp} 
          color="emerald" 
          onClick={() => setShowValueModal(true)}
        />
        <MetricCard 
          title="High Priority" 
          value={highPriority.length} 
          change={-2} 
          icon={AlertTriangle} 
          color="rose" 
          onClick={() => setShowPriorityModal(true)}
        />
        <MetricCard 
          title="Active Users" 
          value={displayActiveUsers} 
          change={3} 
          icon={Users} 
          color="blue" 
          onClick={() => setShowUsersModal(true)}
        />
      </div>

      {/* Board + Actions */}
      <div>
        <h2 className="text-surface-100 font-semibold mb-3">Pipeline Board</h2>
        <ApprovalBoard proposals={proposals} />
      </div>

      <div className="mt-6 mb-8">
        <PriorityQueue title="High Priority Proposals" items={highPriority} />
      </div>


      {/* Total Proposals Modal */}
      <Modal
        isOpen={showTotalModal}
        onClose={() => setShowTotalModal(false)}
        title="All Proposals"
        size="lg"
      >
        <div className="flex flex-col gap-3">
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input 
              type="text" 
              placeholder="Search by ID or Client..." 
              value={proposalsSearchQuery}
              onChange={(e) => setProposalsSearchQuery(e.target.value)}
              className="w-full bg-surface-900 border border-surface-700 rounded-xl pl-9 pr-4 py-2 text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-surface-700/60 text-surface-400 font-medium pb-2">
                  <th className="py-2 pr-4">ID</th>
                  <th className="py-2 pr-4">Client</th>
                  <th className="py-2 pr-4">Occasion</th>
                  <th className="py-2 pr-4">Budget</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-700/30 text-surface-200">
                {proposals
                  .filter(p => {
                    const q = proposalsSearchQuery.toLowerCase();
                    return !q || 
                           (p.id && String(p.id).toLowerCase().includes(q)) ||
                           (p.clientName && p.clientName.toLowerCase().includes(q)) ||
                           (p.client_name && p.client_name.toLowerCase().includes(q));
                  })
                  .map(p => (
                  <tr key={p.id} className="hover:bg-surface-700/20 transition-colors">
                    <td className="py-3 pr-4 font-mono text-brand-400 text-xs font-semibold">{p.id}</td>
                    <td className="py-3 pr-4 font-medium text-surface-100">{p.clientName || p.client_name}</td>
                    <td className="py-3 pr-4 text-xs text-surface-400">{p.occasion || 'General Gifting'}</td>
                    <td className="py-3 pr-4 font-semibold text-emerald-400">{formatCurrency(p.budget || (p.budget_per_unit * p.quantity) || 0)}</td>
                    <td className="py-3 pr-4"><StatusBadge status={p.status} /></td>
                    <td className="py-3"><PriorityBadge priority={p.priority || (isHighPriority(p) ? 'High' : 'Medium')} /></td>
                  </tr>
                ))}
                {proposals.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-surface-400 text-sm">
                      No proposals found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* High Priority Proposals Modal */}
      <Modal
        isOpen={showPriorityModal}
        onClose={() => setShowPriorityModal(false)}
        title="High Priority Proposals"
        size="lg"
      >
        <div className="flex flex-col gap-3">
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input 
              type="text" 
              placeholder="Search by ID or Client..." 
              value={highPrioritySearchQuery}
              onChange={(e) => setHighPrioritySearchQuery(e.target.value)}
              className="w-full bg-surface-900 border border-surface-700 rounded-xl pl-9 pr-4 py-2 text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
              <tr className="border-b border-surface-700/60 text-surface-400 font-medium pb-2">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Client</th>
                <th className="py-2 pr-4">Occasion</th>
                <th className="py-2 pr-4">Budget</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Priority</th>
              </tr>
            </thead>
              <tbody className="divide-y divide-surface-700/30 text-surface-200">
                {highPriority
                  .filter(p => {
                    const q = highPrioritySearchQuery.toLowerCase();
                    return !q || 
                           (p.id && String(p.id).toLowerCase().includes(q)) ||
                           (p.clientName && p.clientName.toLowerCase().includes(q)) ||
                           (p.client_name && p.client_name.toLowerCase().includes(q));
                  })
                  .map(p => (
                  <tr key={p.id} className="hover:bg-surface-700/20 transition-colors">
                    <td className="py-3 pr-4 font-mono text-brand-400 text-xs font-semibold">{p.id}</td>
                  <td className="py-3 pr-4 font-medium text-surface-100">{p.clientName || p.client_name}</td>
                  <td className="py-3 pr-4 text-xs text-surface-400">{p.occasion || 'General Gifting'}</td>
                  <td className="py-3 pr-4 font-semibold text-emerald-400">{formatCurrency(p.budget || (p.budget_per_unit * p.quantity) || 0)}</td>
                  <td className="py-3 pr-4"><StatusBadge status={p.status} /></td>
                  <td className="py-3"><PriorityBadge priority={p.priority || (isHighPriority(p) ? 'High' : 'Medium')} /></td>
                </tr>
              ))}
              {highPriority.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-surface-400 text-sm">
                    No high priority proposals found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>

      {/* Total Pipeline Value This Month Modal */}
      <Modal
        isOpen={showValueModal}
        onClose={() => setShowValueModal(false)}
        title="Pipeline Value This Month"
        size="lg"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-surface-700/60 text-surface-400 font-medium pb-2">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Company</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4 text-right">Budget Given</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700/30 text-surface-200">
              {thisMonthProposals.map(p => (
                <tr key={p.id} className="hover:bg-surface-700/20 transition-colors">
                  <td className="py-3 pr-4 font-mono text-brand-400 text-xs font-semibold">{p.id}</td>
                  <td className="py-3 pr-4 font-medium text-surface-100">{p.clientName}</td>
                  <td className="py-3 pr-4 text-xs text-surface-400">{new Date(p.createdAt || p.updatedAt || new Date()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="py-3 pr-4 text-right font-semibold text-emerald-400">{formatCurrency(p.budget || 0)}</td>
                </tr>
              ))}
              {thisMonthProposals.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-surface-400">No proposals recorded this month.</td>
                </tr>
              )}
            </tbody>
            <tfoot className="border-t border-surface-700/60 bg-surface-900/20">
              <tr>
                <td colSpan={3} className="py-4 font-semibold text-right pr-4 text-surface-300">Total Pipeline Value:</td>
                <td className="py-4 font-black text-emerald-400 text-right pr-4 text-lg">{formatCurrency(totalBudgetThisMonth)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Modal>

      {/* Active Users Modal */}
      <Modal
        isOpen={showUsersModal}
        onClose={() => setShowUsersModal(false)}
        title="Active Users"
        size="md"
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 mb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input 
                type="text" 
                placeholder="Search by name, email or company..." 
                value={usersSearchQuery}
                onChange={(e) => setUsersSearchQuery(e.target.value)}
                className="w-full bg-surface-900 border border-surface-700 rounded-xl pl-9 pr-4 py-2 text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>
          
          {activeCustomers.filter(u => {
            const q = usersSearchQuery.toLowerCase();
            return !q || 
                   (u.name && u.name.toLowerCase().includes(q)) || 
                   (u.email && u.email.toLowerCase().includes(q)) || 
                   (u.company && u.company.toLowerCase().includes(q));
          }).map(user => (
            <div key={user.id} className="bg-surface-800/50 border border-surface-700/50 p-4 rounded-xl flex items-center justify-between hover:bg-surface-800 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-200/60 shadow-sm shrink-0 overflow-hidden">
                  {user.avatar?.startsWith('http') ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-surface-100">{user.name}</h4>
                  <p className="text-xs text-surface-300 font-medium">{user.company || 'Customer'}</p>
                  <p className="text-[11px] text-surface-400 mt-0.5">{user.email}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold px-2 py-1 rounded bg-surface-700/50 text-surface-300 uppercase tracking-wider">{user.role}</span>
                <p className="text-[10px] text-surface-500 mt-1">{user.department}</p>
              </div>
            </div>
          ))}
          {activeCustomers.filter(u => {
            const q = usersSearchQuery.toLowerCase();
            return !q || 
                   (u.name && u.name.toLowerCase().includes(q)) || 
                   (u.email && u.email.toLowerCase().includes(q)) || 
                   (u.company && u.company.toLowerCase().includes(q));
          }).length === 0 && (
            <div className="text-center py-6 text-surface-400 bg-surface-800/30 rounded-xl border border-surface-700/30">
              No users match your search.
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
