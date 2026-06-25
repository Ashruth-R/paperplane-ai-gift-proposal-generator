import { useState } from 'react';
import { 
  Calendar, ChevronLeft, ChevronRight, Sparkles, Gift, Users, Star, Zap, Plus, Clock, X, CheckCircle, AlertCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useApp } from '../../context/AppContext';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const EVENT_TYPES = {
  appreciation: { label: 'Appreciation', color: 'bg-emerald-600', text: 'text-emerald-300', bg: 'bg-emerald-900/30', border: 'border-emerald-700/40', icon: Star },
  meeting: { label: 'Board Meeting', color: 'bg-blue-600', text: 'text-blue-300', bg: 'bg-blue-900/30', border: 'border-blue-700/40', icon: Users },
  celebration: { label: 'Celebration', color: 'bg-amber-600', text: 'text-amber-300', bg: 'bg-amber-900/30', border: 'border-amber-700/40', icon: Gift },
  milestone: { label: 'Milestone', color: 'bg-violet-600', text: 'text-violet-300', bg: 'bg-violet-900/30', border: 'border-violet-700/40', icon: Zap },
  team: { label: 'Team Event', color: 'bg-rose-600', text: 'text-rose-300', bg: 'bg-rose-900/30', border: 'border-rose-700/40', icon: Users },
};

const MOCK_EVENTS = {};

export default function OccasionCalendarPage() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1)); // June 2026
  const [selectedDay, setSelectedDay] = useState(null);
  const [addEventModal, setAddEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', type: 'appreciation', note: '', date: '' });
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;

  const prevMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const getDateKey = (day) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;



  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date) { showToast('Please fill in title and date.', 'error'); return; }
    setEvents(prev => ({
      ...prev,
      [newEvent.date]: [...(prev[newEvent.date] || []), { id: Date.now(), title: newEvent.title, type: newEvent.type, note: newEvent.note }],
    }));
    setAddEventModal(false);
    setNewEvent({ title: '', type: 'appreciation', note: '', date: '' });
    showToast('Event added to your occasion calendar!', 'success');
  };

  const getDateDiffString = (eventDateStr) => {
    const eventDate = new Date(eventDateStr);
    const refDate = new Date(2026, 5, 1); // June 1, 2026 reference
    const diffTime = eventDate - refDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? `${diffDays} Days Remaining` : 'Event Passed';
  };

  // Extract all events of the current month
  const allMonthEvents = Object.entries(events)
    .filter(([k]) => k.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`))
    .flatMap(([k, evts]) => evts.map(e => ({ ...e, date: k })));

  // Filter events based on selected category chip
  const filteredEventsForMonth = allMonthEvents.filter(
    e => selectedCategory === 'All' || e.type === selectedCategory
  );

  // Find nearest upcoming event in this month
  const upcomingEvent = allMonthEvents
    .filter(e => new Date(e.date) >= new Date(2026, 5, 1))
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const selectedEvents = selectedDay ? (events[getDateKey(selectedDay)] || []) : [];
  const filteredSelectedEvents = selectedEvents.filter(
    e => selectedCategory === 'All' || e.type === selectedCategory
  );

  const eligibleCount = allMonthEvents.filter(e => ['celebration', 'appreciation', 'team'].includes(e.type)).length;

  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const todaysEvents = events[todayKey] || [];

  return (
    <div className="flex flex-col gap-8">
      {/* Isolated styling */}
      <style>{`
        @keyframes pulse-subtle-glow {
          0% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(168, 85, 247, 0); }
          100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0); }
        }
        .animate-pulse-glow {
          animation: pulse-subtle-glow 2s infinite;
        }
        .premium-glass-card {
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.03);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }
        @keyframes slide-down {
          from { height: 0; opacity: 0; }
          to { height: auto; opacity: 1; }
        }
        .animate-slide-down {
          animation: slide-down 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Calendar Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#ffffff] p-6 rounded-[24px] border border-[#000000] shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-[#000000] tracking-tight">Occasion Calendar</h1>
          <p className="text-slate-600 text-sm mt-1">
            Manage milestones, celebrations, and corporate events to automate B2B gifting workflows.
          </p>
        </div>
        <div className="flex items-center gap-4.5 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block">Month Tracker</span>
            <span className="text-xs font-black text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-lg mt-1 inline-block">
              {allMonthEvents.length} Events Scheduled
            </span>
          </div>
          <button
            type="button"
            onClick={() => setAddEventModal(true)}
            className="h-11 px-5 bg-brand-600 hover:bg-brand-500 text-[#ffffff] text-xs font-bold rounded-xl shadow-lg hover:shadow-brand-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Today's Events Alert */}
      {todaysEvents.length > 0 && (
        <div className="bg-brand-600/20 border border-brand-500/50 rounded-2xl p-4 flex items-center justify-between shadow-[0_0_20px_rgba(168,85,247,0.15)] animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center border border-brand-400/30">
              <Sparkles className="w-5 h-5 text-brand-300 animate-pulse" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Today is your noted Occasion!</h3>
              <p className="text-brand-200 text-xs mt-0.5">
                Today is the particular occasion which you noted before ({todaysEvents.map(e => e.title).join(', ')}), so please Order gifts or make proposals for completing your occasion.
              </p>
            </div>
          </div>
          <Button onClick={() => navigate('/customer/store')} className="text-xs px-4 h-9 whitespace-nowrap">Order Gifts Now</Button>
        </div>
      )}

      {/* Calendar Statistics KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Events', value: allMonthEvents.length, icon: Calendar, color: 'text-brand-700 bg-brand-50 border-brand-200' },
          { label: 'Celebrations', value: allMonthEvents.filter(e => e.type === 'celebration').length, icon: Gift, color: 'text-amber-700 bg-amber-50 border-amber-200' },
          { label: 'Meetings', value: allMonthEvents.filter(e => e.type === 'meeting').length, icon: Users, color: 'text-blue-700 bg-blue-50 border-blue-200' },
          { label: 'Milestones', value: allMonthEvents.filter(e => e.type === 'milestone').length, icon: Zap, color: 'text-violet-700 bg-violet-50 border-violet-200' },
          { label: 'Team Events', value: allMonthEvents.filter(e => e.type === 'team').length, icon: Users, color: 'text-rose-700 bg-rose-50 border-rose-200' }
        ].map(stat => {
          const StatIcon = stat.icon;
          return (
            <div key={stat.label} className="bg-[#ffffff] border border-[#000000] rounded-[20px] p-4 flex flex-col justify-between shadow-md transition-all duration-300">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{stat.label}</span>
                <StatIcon className={`w-4 h-4 ${stat.color.split(' ')[0]}`} />
              </div>
              <div className="flex justify-between items-end mt-3">
                <span className="text-2xl font-black text-[#000000]">{stat.value}</span>
                <span className={`text-[8px] px-2 py-0.5 border rounded-full font-bold uppercase tracking-wider ${stat.color}`}>
                  Active
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Corporate Gifting Insights Card */}
      <div className="bg-[#eff6ff] border border-[#000000] rounded-[20px] p-5 flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center flex-shrink-0">
            <Gift className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <h4 className="text-[#1e3a8a] font-bold text-sm">Gifting Opportunities Detected</h4>
            <p className="text-blue-900 text-xs mt-0.5">
              There are <span className="text-brand-700 font-black">{eligibleCount} events</span> eligible for automated gifting workflows in {MONTHS[month]} {year}.
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg">
            AI-POWERED PRESETS ACTIVE
          </span>
        </div>
      </div>

      {/* Event Category Filter Chips */}
      <div className="flex flex-wrap gap-2.5">
        {[['All', 'All Occasions', 'bg-brand-900/20 border-brand-700/40 text-brand-300 bg-brand-500'], ...Object.entries(EVENT_TYPES)].map(([k, v]) => {
          const isActive = selectedCategory === k;
          const label = k === 'All' ? v : v.label;
          const colorBullet = k === 'All' ? v.split(' ')[3] : v.color;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setSelectedCategory(k)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 border ${
                isActive
                  ? `${colorBullet} text-[#ffffff] border-transparent shadow-[0_0_15px_rgba(168,85,247,0.2)] scale-[1.03]`
                  : 'bg-[#ffffff] text-[#000000] border-[#000000] hover:bg-slate-100 hover:text-[#000000]'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#ffffff] animate-pulse' : colorBullet}`} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Calendar Panel */}
        <div className="lg:col-span-2 bg-[#ffffff] border border-[#000000] rounded-[24px] p-6 shadow-xl">
          {/* Month Navigation Row */}
          <div className="flex items-center justify-between mb-6">
            <button 
              type="button"
              onClick={prevMonth} 
              className="flex items-center gap-1.5 px-4 h-10 text-xs font-bold text-[#000000] hover:text-[#000000] border border-[#000000] bg-[#ffffff] hover:bg-slate-100 rounded-xl transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Month</span>
            </button>
            <h2 className="text-[#000000] font-extrabold text-lg tracking-wider uppercase font-mono">{MONTHS[month]} {year}</h2>
            <button 
              type="button"
              onClick={nextMonth} 
              className="flex items-center gap-1.5 px-4 h-10 text-xs font-bold text-[#000000] hover:text-[#000000] border border-[#000000] bg-[#ffffff] hover:bg-slate-100 rounded-xl transition-all"
            >
              <span>Next Month</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 mb-3">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-extrabold text-slate-700 uppercase tracking-widest py-1.5">{d}</div>
            ))}
          </div>

          {/* Date Grid */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: totalCells }).map((_, idx) => {
              const day = idx - firstDayOfMonth + 1;
              const isCurrentMonth = day >= 1 && day <= daysInMonth;
              const dateKey = getDateKey(day);
              const dayEvents = isCurrentMonth ? (events[dateKey] || []) : [];
              const filteredDayEvents = dayEvents.filter(
                e => selectedCategory === 'All' || e.type === selectedCategory
              );
              const isToday = isCurrentMonth && today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
              const isSelected = selectedDay === day;

              return (
                <div
                  key={idx}
                  onClick={() => isCurrentMonth && setSelectedDay(selectedDay === day ? null : day)}
                  className={`min-h-[96px] rounded-2xl p-2 flex flex-col justify-between transition-all border duration-250 ${
                    !isCurrentMonth 
                      ? 'opacity-20 pointer-events-none border-transparent' 
                      : 'cursor-pointer'
                  } ${
                    isSelected 
                      ? 'bg-brand-50 border-2 border-brand-600 shadow-[0_0_15px_rgba(168,85,247,0.15)] -translate-y-0.5' 
                      : isToday 
                        ? 'bg-brand-100 border-2 border-brand-600 animate-pulse-glow' 
                        : 'bg-[#ffffff] border-[#000000] hover:border-brand-500/50 hover:-translate-y-0.5 hover:shadow-md'
                  }`}
                >
                  <span className={`text-xs font-black w-6.5 h-6.5 flex items-center justify-center rounded-full ${
                    isToday 
                      ? 'bg-brand-600 text-[#ffffff] shadow-md' 
                      : isSelected 
                        ? 'text-brand-700' 
                        : 'text-[#000000]'
                  }`}>
                    {isCurrentMonth ? day : ''}
                  </span>
                  
                  {/* Event Markers Inside Cell */}
                  <div className="flex flex-col gap-1 overflow-hidden mt-1.5 w-full">
                    {filteredDayEvents.slice(0, 2).map(ev => {
                      const cfg = EVENT_TYPES[ev.type];
                      const Icon = cfg.icon;
                      return (
                        <div 
                          key={ev.id} 
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold ${cfg.bg} ${cfg.text} ${cfg.border} truncate`}
                          title={ev.title}
                        >
                          <Icon className="w-2.5 h-2.5 flex-shrink-0" />
                          <span className="truncate">{ev.title}</span>
                        </div>
                      );
                    })}
                    {filteredDayEvents.length > 2 && (
                      <span className="text-[8px] font-black text-brand-400 bg-brand-950/30 border border-brand-500/10 px-1.5 py-0.5 rounded self-start">
                        +{filteredDayEvents.length - 2} More
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Details & Timeline Panel */}
        <div className="flex flex-col gap-6 w-full">
          {/* Selected Event Details Panel */}
          {selectedDay && filteredSelectedEvents.length > 0 ? (
            <div id="selected-details-anchor" className="bg-[#ffffff] border border-[#000000] rounded-[24px] p-6 shadow-xl flex flex-col gap-4 animate-slide-down">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3.5">
                <div>
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block">Selected Occasion</span>
                  <h3 className="text-[#000000] font-extrabold text-base mt-1">{MONTHS[month]} {selectedDay}, {year}</h3>
                </div>
                <button 
                  type="button"
                  onClick={() => setSelectedDay(null)} 
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-655 hover:text-[#000000] transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {filteredSelectedEvents.map(ev => {
                  const cfg = EVENT_TYPES[ev.type];
                  const Icon = cfg.icon;
                  return (
                    <div key={ev.id} className="p-4 rounded-xl border flex flex-col gap-3 bg-[#ffffff] border-slate-200">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                          <Icon className={`w-4 h-4 ${cfg.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 justify-between">
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border rounded-md ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-[#000000] text-sm font-bold mt-2 leading-snug">{ev.title}</p>
                        </div>
                      </div>
                      
                      <p className="text-slate-600 text-xs italic bg-slate-55 p-2.5 rounded-lg border border-slate-100">"{ev.note}"</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Empty State Details Card */
            <div className="bg-[#ffffff] border border-[#000000] rounded-[24px] p-6 text-center flex flex-col items-center justify-center py-12 gap-3 shadow-xl w-full">
              <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-slate-500" />
              </div>
              <h3 className="text-[#000000] font-extrabold text-sm tracking-tight mt-1">📅 Select a Date</h3>
              <p className="text-slate-650 text-xs leading-relaxed max-w-[220px] mx-auto">
                Choose a day from the calendar to view event details and gifting opportunities.
              </p>
            </div>
          )}

          {/* Upcoming Event Highlight Countdown Card */}
          {upcomingEvent && (
            <div className="bg-[#ffffff] border border-[#000000] rounded-[20px] p-5 shadow-lg relative overflow-hidden w-full">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/10 rounded-full blur-xl pointer-events-none" />
              <span className="text-[9px] font-black uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-md">
                Upcoming Gifting Milestone
              </span>
              <h4 className="text-[#000000] font-extrabold text-base mt-3.5 leading-tight">{upcomingEvent.title}</h4>
              <div className="flex items-center justify-between mt-4">
                <span className="text-slate-600 text-xs font-bold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-600" />
                  {MONTHS[new Date(upcomingEvent.date).getMonth()]} {new Date(upcomingEvent.date).getDate()}
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-1 rounded-lg animate-pulse">
                  {getDateDiffString(upcomingEvent.date)}
                </span>
              </div>
            </div>
          )}

          {/* Monthly Events Timeline Panel */}
          <div className="bg-[#ffffff] border border-[#000000] rounded-[24px] p-5 flex flex-col gap-4 shadow-xl w-full">
            <div>
              <h3 className="text-[#000000] font-extrabold text-sm tracking-tight">Timeline View</h3>
              <p className="text-slate-600 text-xs mt-0.5">All scheduled corporate occasions this month</p>
            </div>
            
            <div className="flex flex-col gap-3.5 max-h-80 overflow-y-auto pr-1">
              {filteredEventsForMonth.length === 0 ? (
                <div className="text-center py-6 text-slate-650 text-xs border border-dashed border-slate-300 rounded-xl">
                  No occasions found matching filters.
                </div>
              ) : (
                <div className="relative border-l border-slate-200 pl-4 ml-2.5 flex flex-col gap-4">
                  {filteredEventsForMonth.map(ev => {
                    const cfg = EVENT_TYPES[ev.type];
                    const Icon = cfg.icon;
                    const dayNum = parseInt(ev.date.split('-')[2]);
                    return (
                      <div 
                        key={ev.id} 
                        className="relative group cursor-pointer"
                        onClick={() => {
                          setSelectedDay(dayNum);
                          const el = document.getElementById('selected-details-anchor');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        {/* Timeline Connector Dot */}
                        <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border border-white transition-all duration-300 bg-slate-300 group-hover:bg-brand-500" />
                        
                        <div className="bg-[#ffffff] border border-slate-200 rounded-xl p-3 hover:border-brand-500/50 hover:bg-slate-50 transition-all duration-300">
                          <div className="flex items-center gap-2 justify-between">
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-600 font-mono">
                              {MONTHS[month]} {dayNum}
                            </span>
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border rounded-md ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-[#000000] text-xs font-bold mt-1.5 group-hover:text-brand-600 transition-colors truncate">{ev.title}</p>
                          <p className="text-slate-650 text-[10px] mt-1 truncate">{ev.note || 'No notes'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Custom Event Modal */}
      <Modal 
        isOpen={addEventModal} 
        onClose={() => setAddEventModal(false)} 
        title="Add Corporate Occasion" 
        size="sm"
        footer={
          <div className="flex gap-3 justify-end h-11">
            <button 
              onClick={() => setAddEventModal(false)} 
              className="px-4 h-11 text-xs font-bold text-slate-400 hover:text-[#ffffff] border border-white/5 bg-slate-950/60 hover:bg-slate-950 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleAddEvent}
              className="px-5 h-11 bg-brand-600 hover:bg-brand-500 text-[#ffffff] text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Event</span>
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Event Title *</label>
            <input 
              value={newEvent.title} 
              onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))} 
              placeholder="e.g. Annual Team Offsite" 
              className="w-full bg-slate-950/60 border border-white/5 focus:border-brand-500/50 rounded-xl px-3.5 py-2 text-[#ffffff] text-sm focus:outline-none focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Date *</label>
            <input 
              type="date" 
              value={newEvent.date} 
              onChange={e => setNewEvent(p => ({ ...p, date: e.target.value }))} 
              className="w-full bg-slate-950/60 border border-white/5 focus:border-brand-500/50 rounded-xl px-3.5 py-2 text-[#ffffff] text-sm focus:outline-none focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Event Category</label>
            <select 
              value={newEvent.type} 
              onChange={e => setNewEvent(p => ({ ...p, type: e.target.value }))} 
              className="w-full bg-slate-950/60 border border-white/5 focus:border-brand-500/50 rounded-xl px-3.5 py-2 text-[#ffffff] text-sm focus:outline-none focus:shadow-[0_0_15px_rgba(168,85,247,0.15)]"
            >
              {Object.entries(EVENT_TYPES).map(([k, v]) => <option key={k} value={k} className="bg-slate-900">{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Description & Notes</label>
            <textarea 
              value={newEvent.note} 
              onChange={e => setNewEvent(p => ({ ...p, note: e.target.value }))} 
              placeholder="e.g. Gift bags needed for 15 executives..." 
              rows={3} 
              className="w-full bg-slate-950/60 border border-white/5 focus:border-brand-500/50 rounded-xl px-3.5 py-2 text-[#ffffff] text-sm focus:outline-none focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300 resize-none" 
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
