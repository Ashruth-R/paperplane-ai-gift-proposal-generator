import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AppContext = createContext(null);

const initialState = {
  isAuthenticated: !!localStorage.getItem('paperplane_token'),
  currentUser: JSON.parse(localStorage.getItem('paperplane_user') || 'null'),
  activeRole: 'customer',
  activeUser: null,
  proposals: [],
  notifications: [],
  personalizedDesigns: [],
  tickets: [],
  products: [],
  orders: [],
  returnRequests: [],
  orderedItems: [], // Not strictly needed if mapped from orders, keeping for UI compat
  users: [],
  sidebarCollapsed: false,
  toast: null,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_DATA':
      return { ...state, ...action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        currentUser: action.payload,
        activeUser: action.payload,
        activeRole: action.payload.role
      };
    case 'LOGOUT':
      return { ...state, isAuthenticated: false, currentUser: null, activeUser: null, proposals: [], tickets: [], orders: [] };
    case 'SWITCH_ROLE':
      return { ...state, activeRole: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case 'SET_SIDEBAR':
      return { ...state, sidebarCollapsed: action.payload };
    case 'MARK_NOTIFICATION_READ':
      return { ...state, notifications: state.notifications.map(n => n.id === action.payload ? { ...n, readStatus: true } : n) };
    case 'MARK_ALL_READ':
      return { ...state, notifications: state.notifications.map(n => ({ ...n, readStatus: true })) };
    case 'UPDATE_PROPOSAL_STATUS':
      return { ...state, proposals: state.proposals.map(p => p.id === action.payload.id ? { ...p, status: action.payload.status } : p) };
    case 'UPDATE_PROPOSAL':
      return { ...state, proposals: state.proposals.map(p => p.id === action.payload.id ? { ...p, ...action.payload.updates } : p) };
    case 'UPDATE_DESIGN_STATUS':
      return { ...state, personalizedDesigns: state.personalizedDesigns.map(d => d.id === action.payload.id ? { ...d, status: action.payload.status, adminFeedback: action.payload.adminFeedback || '' } : d) };
    case 'ADD_DESIGN':
      return { ...state, personalizedDesigns: [action.payload, ...state.personalizedDesigns] };
    case 'ADD_PROPOSAL':
      return { ...state, proposals: [action.payload, ...state.proposals] };
    case 'ADD_TICKET':
      return { ...state, tickets: [action.payload, ...state.tickets] };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'ADD_ORDERED_ITEMS':
      return { ...state, orderedItems: [...action.payload, ...state.orderedItems] };
    case 'RATE_ORDERED_ITEM':
      return { ...state, orderedItems: state.orderedItems.map(item => item.id === action.payload.id ? { ...item, rating: action.payload.rating } : item) };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'DELETE_PRODUCT':
      return { ...state, products: state.products.filter(p => p.id !== action.payload) };
    case 'UPDATE_PRODUCT':
      return { ...state, products: state.products.map(p => p.id === action.payload.id ? action.payload : p) };
    case 'ADD_ORDER':
      return { ...state, orders: [action.payload, ...state.orders] };
    case 'UPDATE_ORDER_STATUS':
      return { ...state, orders: state.orders.map(o => o.id === action.payload.id ? { ...o, status: action.payload.status } : o) };
    case 'ADD_RETURN_REQUEST':
      return { ...state, returnRequests: [action.payload, ...state.returnRequests] };
    case 'UPDATE_RETURN_STATUS':
      return { ...state, returnRequests: state.returnRequests.map(r => r.id === action.payload.id ? { ...r, status: action.payload.status, adminNote: action.payload.adminNote, resolutionNote: action.payload.resolutionNote } : r) };
    case 'UPDATE_TICKET_STATUS':
      return { ...state, tickets: state.tickets.map(t => t.id === action.payload.id ? { ...t, status: action.payload.status, assignedTo: action.payload.assignedTo } : t) };
    case 'ADD_TICKET_MESSAGE':
      return { ...state, tickets: state.tickets.map(t => t.id === action.payload.ticketId ? { ...t, chatHistory: [...(t.chatHistory || []), action.payload.message] } : t) };
    case 'ADD_PROPOSAL_MESSAGE':
      return { ...state, proposals: state.proposals.map(p => p.id === action.payload.proposalId ? { ...p, chatHistory: [...(p.chatHistory || []), action.payload.message] } : p) };
    case 'SHOW_TOAST':
      return { ...state, toast: action.payload };
    case 'CLEAR_TOAST':
      return { ...state, toast: null };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const location = useLocation();
  const navigate = useNavigate();

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    dispatch({ type: 'SHOW_TOAST', payload: { message, type } });
    setTimeout(() => dispatch({ type: 'CLEAR_TOAST' }), duration);
  }, []);

  // Fetch initial data when authenticated
  useEffect(() => {
    if (state.isAuthenticated) {
      const fetchData = async () => {
        try {
          const safeGet = (url, defaultData = []) => api.get(url).catch(e => {
            console.warn(`Failed to fetch ${url}`, e);
            return { data: { data: defaultData } };
          });

          const [propRes, tickRes, ordRes, retRes, prodRes, desRes, notifRes, meRes, usersRes] = await Promise.all([
            safeGet('/proposals', { proposals: [] }),
            safeGet('/tickets'),
            safeGet('/orders'),
            safeGet('/returns'),
            safeGet('/products'),
            safeGet('/designs'),
            safeGet('/notifications'),
            api.get('/auth/me'), // Keep auth/me strictly error-throwing if it fails, or maybe handle it?
            safeGet('/auth/users')
          ]);
          
          dispatch({ type: 'SET_DATA', payload: {
             proposals: propRes.data.data?.proposals || propRes.data.data || [],
             tickets: tickRes.data.data || [],
             orders: ordRes.data.data || [],
             returnRequests: retRes.data.data || [],
             products: prodRes.data.data || [],
             personalizedDesigns: desRes.data.data || [],
             notifications: notifRes.data.data || [],
             currentUser: meRes.data.data,
             activeUser: meRes.data.data,
             activeRole: meRes.data.data?.role || 'customer',
             users: usersRes.data.data || []
          }});
        } catch (e) {
          console.error('Failed to fetch critical data', e);
          if (e.response && e.response.status === 401) {
             signOut();
          }
        }
      };
      fetchData();
    }
  }, [state.isAuthenticated]);

  useEffect(() => {
    const handleAuthError = () => signOut();
    window.addEventListener('auth-error', handleAuthError);
    return () => window.removeEventListener('auth-error', handleAuthError);
  }, []);

  const loginUser = useCallback(async (credentials) => {
    try {
        if (credentials.is_register) {
            await api.post('/auth/register', credentials);
        }
        const res = await api.post('/auth/login', { email: credentials.email, password: credentials.password });
        localStorage.setItem('paperplane_token', res.data.data.token);
        localStorage.setItem('paperplane_user', JSON.stringify(res.data.data.user));
        dispatch({ type: 'LOGIN_SUCCESS', payload: res.data.data.user });
        showToast(credentials.is_register ? 'Registration successful!' : 'Login successful!');
        return true;
    } catch(e) {
        showToast(credentials.is_register ? 'Registration failed. Email might already exist.' : 'Invalid credentials', 'error');
        return false;
    }
  }, [showToast]);

  const signOut = useCallback(() => {
    localStorage.removeItem('paperplane_token');
    localStorage.removeItem('paperplane_user');
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  }, [navigate]);

  const switchRole = useCallback((role) => dispatch({ type: 'SWITCH_ROLE', payload: role }), []);
  const toggleSidebar = useCallback(() => dispatch({ type: 'TOGGLE_SIDEBAR' }), []);
  const setSidebar = useCallback((val) => dispatch({ type: 'SET_SIDEBAR', payload: val }), []);
  
  const markRead = useCallback(async (id) => {
    try { await api.patch(`/notifications/${id}/read`); dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id }); } catch(e){}
  }, []);
  const markAllRead = useCallback(async () => {
    try { await api.patch('/notifications/read-all'); dispatch({ type: 'MARK_ALL_READ' }); } catch(e){}
  }, []);
  
  const updateProposalStatus = useCallback(async (id, status) => {
    try { await api.patch(`/proposals/${id}/status`, { new_status: status, changed_by: state.activeUser?.name, notes: "Status updated" }); dispatch({ type: 'UPDATE_PROPOSAL_STATUS', payload: { id, status } }); } catch(e){}
  }, [state.activeUser]);
  const updateProposal = useCallback((id, updates) => dispatch({ type: 'UPDATE_PROPOSAL', payload: { id, updates } }), []);
  const updateDesignStatus = useCallback(async (id, status, adminFeedback) => {
    try { await api.patch(`/designs/${id}/status`, { status, adminFeedback }); dispatch({ type: 'UPDATE_DESIGN_STATUS', payload: { id, status, adminFeedback } }); } catch(e){}
  }, []);
  const addDesign = useCallback(async (design) => {
    try { const res = await api.post('/designs', design); dispatch({ type: 'ADD_DESIGN', payload: res.data.data }); showToast('Design request submitted'); } catch(e){ showToast('Failed to submit design', 'error'); }
  }, [showToast]);
  
  const addProposal = useCallback(async (proposal) => {
    const reqPayload = { 
      client_name: proposal.clientName || proposal.customerName || 'Unknown', 
      client_email: proposal.contactEmail || proposal.customerEmail || 'email@example.com', 
      client_company: proposal.clientName || proposal.companyName || 'Unknown', 
      client_type: 'ENTERPRISE', 
      occasion: 'CUSTOM', 
      budget_per_unit: (proposal.budget / (proposal.quantity || 1)) || 0, 
      quantity: proposal.quantity || 1, 
      delivery_deadline: '2026-12-31' 
    };
    try { 
      const res = await api.post('/proposals', reqPayload); 
      
      const newFullProposal = {
        id: res.data.data.proposal_id || res.data.data.id,
        ...reqPayload,
        status: res.data.data.status || 'Draft',
        created_at: res.data.data.created_at || new Date().toISOString(),
        priority: 'High'
      };

      dispatch({ type: 'ADD_PROPOSAL', payload: newFullProposal }); 
      showToast('Proposal created'); 
      return newFullProposal; 
    } catch(e) { 
      console.error(e);
      // Fallback for offline mode or demo
      const mockFullProposal = {
        id: `PROP-MOCK-${Math.floor(Math.random() * 9000) + 1000}`,
        ...reqPayload,
        status: 'Draft',
        created_at: new Date().toISOString(),
        priority: 'High'
      };
      dispatch({ type: 'ADD_PROPOSAL', payload: mockFullProposal });
      showToast('Proposal generated (Offline Mode)'); 
      return mockFullProposal; 
    }
  }, [showToast]);
  
  const addTicket = useCallback(async (ticket) => {
    try { const res = await api.post('/tickets', ticket); dispatch({ type: 'ADD_TICKET', payload: res.data.data }); showToast('Ticket raised'); return res.data.data; } catch(e){ showToast('Error raising ticket', 'error'); return null; }
  }, [showToast]);
  const updateTicketStatus = useCallback(async (id, status, assignedTo) => {
    try { await api.patch(`/tickets/${id}/status`, { status, assignedTo }); dispatch({ type: 'UPDATE_TICKET_STATUS', payload: { id, status, assignedTo } }); } catch(e){}
  }, []);
  const addTicketMessage = useCallback(async (ticketId, message) => {
    try { await api.post(`/tickets/${ticketId}/message`, { message, role: state.activeRole }); dispatch({ type: 'ADD_TICKET_MESSAGE', payload: { ticketId, message } }); } catch(e){}
  }, [state.activeRole]);
  
  const addNotification = useCallback(async (payload) => {
    try { const res = await api.post('/notifications', payload); dispatch({ type: 'ADD_NOTIFICATION', payload: res.data.data }); } catch(e){}
  }, []);
  
  const addOrder = useCallback(async (userName, companyName, customerEmail, cart, total) => {
    try { const res = await api.post('/orders', { userName, companyName, customerEmail, cart, total }); dispatch({ type: 'ADD_ORDER', payload: res.data.data }); showToast('Order placed successfully'); } catch(e){ showToast('Error placing order', 'error'); }
  }, [showToast]);
  const updateOrderStatus = useCallback(async (id, status) => {
    try { await api.patch(`/orders/${id}/status`, { status }); dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { id, status } }); } catch(e){}
  }, []);
  
  const addReturnRequest = useCallback(async (req) => {
    try { const res = await api.post('/returns', req); dispatch({ type: 'ADD_RETURN_REQUEST', payload: res.data.data }); showToast('Return requested'); return res.data.data; } catch(e){ showToast('Error requesting return', 'error'); return null; }
  }, [showToast]);
  const updateReturnStatus = useCallback(async (id, status, adminNote, resolutionNote) => {
    try { await api.patch(`/returns/${id}/status`, { status, adminNote, resolutionNote }); dispatch({ type: 'UPDATE_RETURN_STATUS', payload: { id, status, adminNote, resolutionNote } }); } catch(e){}
  }, []);

  const addOrderedItems = useCallback((items) => dispatch({ type: 'ADD_ORDERED_ITEMS', payload: items }), []);
  const rateOrderedItem = useCallback((id, rating) => dispatch({ type: 'RATE_ORDERED_ITEM', payload: { id, rating } }), []);
  const addProduct = useCallback((product) => dispatch({ type: 'ADD_PRODUCT', payload: product }), []);
  const deleteProduct = useCallback((id) => dispatch({ type: 'DELETE_PRODUCT', payload: id }), []);
  const updateProduct = useCallback((product) => dispatch({ type: 'UPDATE_PRODUCT', payload: product }), []);
  const addProposalMessage = useCallback((proposalId, message) => dispatch({ type: 'ADD_PROPOSAL_MESSAGE', payload: { proposalId, message } }), []);

  // Filter logic remains same but uses state
  const isCustomer = state.activeRole === 'customer';
  const filterByOwner = (arr) => arr.filter(i => !isCustomer || i.customerEmail === state.activeUser?.email);

  return (
    <AppContext.Provider value={{
      ...state,
      tickets: filterByOwner(state.tickets),
      proposals: filterByOwner(state.proposals),
      orders: filterByOwner(state.orders),
      returnRequests: filterByOwner(state.returnRequests),
      orderedItems: filterByOwner(state.orderedItems),
      personalizedDesigns: filterByOwner(state.personalizedDesigns),
      notifications: filterByOwner(state.notifications),
      unreadCount: filterByOwner(state.notifications).filter(n => !n.readStatus).length,
      switchRole, toggleSidebar, setSidebar, markRead, markAllRead,
      updateProposalStatus, updateProposal, updateDesignStatus, addDesign, addProposal,
      addTicket, showToast, addNotification, loginUser, signOut, addOrderedItems,
      rateOrderedItem, addProduct, deleteProduct, updateProduct, addOrder, updateOrderStatus,
      addReturnRequest, updateReturnStatus, updateTicketStatus, addTicketMessage, addProposalMessage
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export default AppContext;
