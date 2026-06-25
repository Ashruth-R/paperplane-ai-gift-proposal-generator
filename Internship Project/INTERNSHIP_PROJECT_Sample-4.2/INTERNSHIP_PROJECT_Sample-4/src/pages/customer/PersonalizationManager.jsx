import { useState, useRef } from 'react';
import { Wand2, Upload, Palette, Type, Eye, Save, RotateCcw, Download, CheckCircle, Sparkles, AlignCenter, AlignLeft, AlignRight, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const MOCK_PRODUCTS = [
  { id: 'notebook', label: 'Premium Notebook', emoji: '📓', bg: 'from-amber-800/60 to-amber-700/20', color: '#d97706' },
  { id: 'mug', label: 'Ceramic Mug', emoji: '☕', bg: 'from-cyan-800/60 to-cyan-700/20', color: '#0891b2' },
  { id: 'tote', label: 'Canvas Tote Bag', emoji: '👜', bg: 'from-teal-800/60 to-teal-700/20', color: '#0d9488' },
  { id: 'charger', label: 'Wireless Charger', emoji: '⚡', bg: 'from-violet-800/60 to-violet-700/20', color: '#7c3aed' },
];

const FONT_STYLES = ['Inter', 'Playfair Display', 'Roboto Mono', 'Georgia'];
const POSITIONS = ['Top', 'Center', 'Bottom'];

export default function PersonalizationManager() {
  const { showToast, addDesign, addNotification, activeUser } = useApp();
  
  // Existing states
  const [selectedProduct, setSelectedProduct] = useState(MOCK_PRODUCTS[0]);
  const [logoUploaded, setLogoUploaded] = useState(false);
  const [logoName, setLogoName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#4f46e5');
  const [accentColor, setAccentColor] = useState('#10b981');
  const [customText, setCustomText] = useState('Your Brand Name');
  const [fontSize, setFontSize] = useState(18);
  const [fontStyle, setFontStyle] = useState('Inter');
  const [textAlign, setTextAlign] = useState('Center');
  const [textPosition, setTextPosition] = useState('Bottom');
  const [showLogoOnProduct, setShowLogoOnProduct] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Custom Studio Expanded States
  const [secondaryColor, setSecondaryColor] = useState('#f59e0b');
  const [logoSize, setLogoSize] = useState(60); 
  const [logoRotation, setLogoRotation] = useState(0); 
  const [logoPosition, setLogoPosition] = useState('Center'); 
  const [fontWeight, setFontWeight] = useState('Bold'); 
  const [placementArea, setPlacementArea] = useState('Front Cover'); 
  const [brandingPosition, setBrandingPosition] = useState('Center Centered'); 
  const [previewBackground, setPreviewBackground] = useState('premium-dark'); 
  const [zoomLevel, setZoomLevel] = useState(100); 
  const [showFullPreview, setShowFullPreview] = useState(false); 

  const fileRef = useRef(null);

  const handleLogoUpload = (e) => {
    const f = e.target.files?.[0];
    if (f) { 
      setLogoName(f.name); 
      setLogoUploaded(true); 
      setShowLogoOnProduct(true); 
      showToast('Logo uploaded and applied to mockup!', 'success'); 
    }
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { 
      const designId = `DSN-${Math.floor(100 + Math.random() * 900)}`;
      const companyName = activeUser?.company || 'TechNova Solutions';
      const userName = activeUser?.name || 'Priya Sharma';

      let imgUrl = 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80'; // default is tote
      if (selectedProduct.id === 'notebook') {
        imgUrl = 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=400&q=80';
      } else if (selectedProduct.id === 'mug') {
        imgUrl = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80';
      } else if (selectedProduct.id === 'charger') {
        imgUrl = 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=400&q=80';
      }

      let brandingType = 'Digital Print';
      if (selectedProduct.id === 'notebook') brandingType = 'Logo Embossing';
      else if (selectedProduct.id === 'mug') brandingType = 'Laser Engraving';
      else if (selectedProduct.id === 'tote') brandingType = 'Screen Printing';
      else if (selectedProduct.id === 'charger') brandingType = 'Laser Engraving';

      const newDesign = {
        id: designId,
        customerName: companyName,
        productName: selectedProduct.label,
        submissionDate: new Date().toISOString(),
        mockupImageUrl: imgUrl,
        status: 'Pending Review',
        adminFeedback: '',
        bg: selectedProduct.bg,
        emoji: selectedProduct.emoji,
        type: brandingType,
        customText,
        logoUploaded,
        logoName,
        primaryColor,
        accentColor,
        secondaryColor,
        fontStyle,
        fontSize,
        fontWeight,
        textPosition,
        textAlign,
        logoPosition,
        logoSize,
        logoRotation,
        previewBackground
      };

      addDesign(newDesign);

      addNotification({
        role: 'customer',
        type: 'message',
        message: `Success: Your personalized design for ${selectedProduct.label} has been submitted for approval (ID: ${designId}).`,
        link: '/customer/design-approvals'
      });

      addNotification({
        role: 'admin',
        type: 'message',
        message: `New Design: ${companyName} has submitted a new personalization mockup for ${selectedProduct.label} (ID: ${designId}).`,
        link: '/admin/design-approvals'
      });

      setSaving(false); 
      setSaved(true); 
      showToast(`Mockup design ${designId} saved and submitted for approval!`, 'success'); 
    }, 1500);
  };

  const handleReset = () => {
    setLogoUploaded(false); 
    setLogoName(''); 
    setPrimaryColor('#4f46e5'); 
    setAccentColor('#10b981');
    setCustomText('Your Brand Name'); 
    setFontSize(18); 
    setFontStyle('Inter'); 
    setTextAlign('Center');
    setTextPosition('Bottom'); 
    setShowLogoOnProduct(false); 
    setSaved(false);
    
    // Reset Custom Studio States
    setSecondaryColor('#f59e0b'); 
    setLogoSize(60); 
    setLogoRotation(0); 
    setLogoPosition('Center');
    setFontWeight('Bold'); 
    setPlacementArea('Front Cover'); 
    setBrandingPosition('Center Centered');
    setPreviewBackground('premium-dark'); 
    setZoomLevel(100);
    showToast('Studio parameters reset successfully.', 'info');
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Dynamic Keyframe & Preset Styles */}
      <style>{`
        @keyframes float-mockup {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(0.5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .animate-float-mockup {
          animation: float-mockup 6s ease-in-out infinite;
        }
        .bg-premium-dark {
          background: #0f172a;
        }
        .bg-studio-light {
          background: #f1f5f9;
        }
        .bg-corporate-desk {
          background: #1e293b;
        }
        .bg-minimal-white {
          background: #ffffff;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out forwards;
        }
      `}</style>

      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Product Personalization Manager</h1>
        <p className="text-slate-400 text-sm mt-1">Design your branded corporate gift with real-time vector previews and studio settings</p>
      </div>

      {/* Product Selection Tabs Redesign */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-1">
        {MOCK_PRODUCTS.map(p => {
          const isSelected = selectedProduct.id === p.id;
          return (
            <button 
              key={p.id} 
              onClick={() => { setSelectedProduct(p); setSaved(false); }} 
              className={`relative flex flex-col items-center justify-center p-5 rounded-[20px] border transition-all duration-300 ${
                isSelected 
                  ? 'bg-[#ffffff] border-2 border-brand-600 shadow-[0_4px_12px_rgba(168,85,247,0.15)] scale-[1.02] text-brand-700' 
                  : 'bg-[#ffffff] border-slate-300 text-slate-700 hover:border-brand-500/50 hover:-translate-y-1 hover:shadow-md'
              }`}
            >
              {isSelected && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
              )}
              <span className="text-4xl mb-3 drop-shadow-md select-none">{p.emoji}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-center">{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Studio Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto w-full">
        
        {/* Left Side: Live Showcase Studio (lg:col-span-6) */}
        <div className="lg:col-span-6 flex flex-col gap-6 w-full">
          
          {/* Live Preview Toolbar Controls */}
          <div className="flex items-center justify-between bg-[#ffffff] border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-brand-600" />
              <h2 className="text-slate-800 font-bold text-xs uppercase tracking-wider">Studio Live Preview</h2>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Zoom Out */}
              <button 
                type="button"
                onClick={() => setZoomLevel(z => Math.max(60, z - 10))}
                className="p-1.5 rounded-lg bg-[#ffffff] border border-slate-300 text-slate-700 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                title="Zoom Out"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" /></svg>
              </button>
              <span className="text-[10px] font-mono font-bold text-slate-700 min-w-[32px] text-center">{zoomLevel}%</span>
              {/* Zoom In */}
              <button 
                type="button"
                onClick={() => setZoomLevel(z => Math.min(140, z + 10))}
                className="p-1.5 rounded-lg bg-[#ffffff] border border-slate-300 text-slate-700 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                title="Zoom In"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12M6 12h12" /></svg>
              </button>
              <div className="h-4 w-[1px] bg-slate-300 mx-1" />
              {/* Reset View */}
              <button 
                type="button"
                onClick={() => setZoomLevel(100)}
                className="p-1.5 rounded-lg bg-[#ffffff] border border-slate-300 text-slate-700 hover:text-brand-600 hover:bg-slate-100 transition-colors text-[10px] font-bold px-2.5"
                title="Reset View"
              >
                Reset
              </button>
              {/* Fullscreen Preview */}
              <button 
                type="button"
                onClick={() => setShowFullPreview(true)}
                className="p-1.5 rounded-lg bg-[#ffffff] border border-slate-300 text-slate-700 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                title="Full Preview"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" /></svg>
              </button>
            </div>
          </div>

          {/* Hero Live Preview Showcase Area */}
          <div className="relative w-full rounded-[24px] overflow-hidden border border-white/5 shadow-2xl">
            <div 
              className={`relative h-[360px] w-full flex flex-col items-center justify-center overflow-hidden transition-all duration-300 bg-${previewBackground}`}
              style={{ '--primary': primaryColor, '--accent': accentColor }}
            >
              {/* Center product showcase canvas */}
              <div 
                style={{ transform: `scale(${zoomLevel / 100})` }} 
                className="relative z-10 flex flex-col items-center justify-center gap-5 transition-all duration-300 animate-float-mockup"
              >

                {/* Main Product Emoji */}
                <span className="text-8xl drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)] select-none">
                  {selectedProduct.emoji}
                </span>

                {/* Logo custom branding component */}
                {showLogoOnProduct && (
                  <div 
                    style={{ 
                      width: `${logoSize}px`, 
                      height: `${logoSize}px`,
                      transform: `rotate(${logoRotation}deg)`,
                      backgroundColor: primaryColor,
                      borderColor: `${accentColor}40`,
                      transition: 'all 0.2s ease-out'
                    }}
                    className={`rounded-xl flex items-center justify-center border bg-white/10 backdrop-blur-md shadow-xl p-2.5 ${
                      logoPosition === 'Top' ? 'order-first mb-2' : logoPosition === 'Center' ? '' : 'order-last mt-2'
                    }`}
                  >
                    <span className="text-white text-[9px] font-black tracking-tight text-center leading-none select-none uppercase">
                      {logoName ? logoName.replace(/\.[^/.]+$/, '').slice(0, 8) : 'LOGO'}
                    </span>
                  </div>
                )}

                {/* Custom typography representation */}
                {customText && (
                  <div 
                    className={`w-full ${textPosition === 'Top' ? 'order-first' : textPosition === 'Center' ? '' : 'order-last'}`}
                    style={{ textAlign: textAlign.toLowerCase() }}
                  >
                    <p 
                      style={{ 
                        fontSize: `${fontSize}px`, 
                        color: accentColor, 
                        fontFamily: fontStyle, 
                        fontWeight: fontWeight === 'Bold' ? 'bold' : fontWeight === 'Medium' ? '500' : 'normal'
                      }} 
                      className="drop-shadow-lg px-2 select-none whitespace-nowrap transition-all duration-200"
                    >
                      {customText}
                    </p>
                  </div>
                )}
              </div>

              {saved && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  <CheckCircle className="w-3.5 h-3.5" /> Saved
                </div>
              )}
            </div>
          </div>

          {/* Background Presets Panel */}
          <div className="bg-[#ffffff] border border-slate-200 rounded-[24px] p-6 shadow-sm space-y-3.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Studio Background Presets</span>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'premium-dark', name: 'Premium Dark' },
                { id: 'studio-light', name: 'Studio Light' },
                { id: 'corporate-desk', name: 'Corporate Desk' },
                { id: 'minimal-white', name: 'Minimal White' },
              ].map(bg => (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => setPreviewBackground(bg.id)}
                  className={`h-9 rounded-lg border text-[10px] font-bold transition-all ${
                    previewBackground === bg.id 
                      ? 'bg-brand-50 border-brand-600 text-brand-700 shadow-sm' 
                      : 'bg-[#ffffff] border-slate-300 text-slate-700 hover:border-brand-500/50 hover:bg-brand-50/20'
                  }`}
                >
                  {bg.name}
                </button>
              ))}
            </div>
          </div>

          {/* Action Button Footer Grid */}
          <div className="flex flex-row gap-3.5 h-12 w-full mt-2">
            {/* Reset Button */}
            <button 
              type="button"
              onClick={handleReset}
              className="flex-1 h-12 rounded-xl text-xs font-bold text-slate-700 hover:text-brand-600 hover:bg-slate-100 border border-slate-300 transition-all duration-300 flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Studio</span>
            </button>

            {/* Export PNG Button */}
            <button 
              type="button"
              onClick={() => showToast('Design preview exported to downloads!', 'success')}
              className="flex-1 h-12 rounded-xl text-xs font-bold text-slate-700 hover:text-brand-600 hover:bg-slate-100 border border-slate-300 transition-all duration-300 flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export PNG</span>
            </button>

            {/* Save Design Button */}
            <button 
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="flex-1 h-12 rounded-xl text-xs font-extrabold text-white bg-brand-600 hover:bg-brand-500 transition-all duration-300 flex items-center justify-center gap-1.5 shadow-lg hover:shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-[1px] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Design</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right Side: Configuration Studio Controls (lg:col-span-6) */}
        <div className="lg:col-span-6 flex flex-col gap-6 w-full">
          
          {/* Live Statistics Assembly Checklist */}
          <div className="bg-[#ffffff] border border-slate-200 rounded-[24px] p-6 shadow-sm space-y-3.5">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-brand-600" />
              <span>Studio Checklist Status</span>
            </h4>
            <div className="grid grid-cols-2 gap-3.5 text-xs">
              {[
                { label: 'Logo Vector Uploaded', checked: logoUploaded },
                { label: 'Brand Palette Configured', checked: primaryColor && accentColor },
                { label: 'Typography Customised', checked: customText.trim().length > 0 },
                { label: 'Mockup Render Complete', checked: true },
              ].map(chk => (
                <div key={chk.label} className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-350 ${
                    chk.checked 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-600 font-bold' 
                      : 'bg-slate-50 border-slate-300 text-slate-400'
                  }`}>
                    {chk.checked ? '✓' : '•'}
                  </div>
                  <span className={chk.checked ? 'text-slate-800 font-semibold' : 'text-slate-500'}>{chk.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Logo Upload Section Card */}
          <div className="bg-[#ffffff] border border-slate-200 rounded-[24px] p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <Upload className="w-4 h-4 text-brand-600" />
              <h3 className="text-slate-800 font-bold text-sm">Upload Corporate Logo</h3>
            </div>
            
            <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={handleLogoUpload} />
            <div 
              onClick={() => fileRef.current?.click()} 
              className={`group cursor-pointer flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-[18px] transition-all duration-300 ${
                logoUploaded 
                  ? 'border-emerald-50 bg-emerald-50/50 shadow-sm' 
                  : 'border-slate-300 bg-slate-50 hover:border-brand-500 hover:bg-brand-50/30'
              }`}
            >
              {logoUploaded ? (
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-200">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-emerald-700 text-sm font-bold">Logo Uploaded Successfully</p>
                    <p className="text-slate-600 text-xs mt-1 truncate max-w-[240px] font-mono">{logoName}</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); handleReset(); }}
                    className="text-xs text-slate-600 hover:text-slate-850 mt-1 border border-slate-300 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200"
                  >
                    Replace Logo
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center gap-2.5">
                  <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center group-hover:border-brand-500/30 transition-all">
                    <Upload className="w-5 h-5 text-slate-650" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Upload Brand Vector Logo</h4>
                    <p className="text-xs text-slate-600 mt-1">Drag & Drop or <span className="text-brand-600 underline font-semibold">Click to Browse</span></p>
                  </div>
                  <span className="text-[10px] text-slate-650 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                    SVG, PNG, JPG up to 5 MB
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Brand Colors Configurator Card */}
          <div className="bg-[#ffffff] border border-slate-200 rounded-[24px] p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <Palette className="w-4 h-4 text-brand-600" />
              <h3 className="text-slate-800 font-bold text-sm">Brand Colors & Palette</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Primary Color', value: primaryColor, set: setPrimaryColor },
                { label: 'Accent Color', value: accentColor, set: setAccentColor },
                { label: 'Secondary Color', value: secondaryColor, set: setSecondaryColor }
              ].map((c, idx) => (
                <div key={c.label} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col gap-2 relative">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    {c.label} {idx === 2 && <span className="text-[9px] text-brand-600/80 italic font-medium">(Visual)</span>}
                  </span>
                  <div className="flex items-center gap-2 w-full mt-1">
                    <div 
                      className="w-8 h-8 rounded-lg border border-slate-300 flex-shrink-0 cursor-pointer shadow-md"
                      style={{ backgroundColor: c.value }}
                      onClick={() => document.getElementById(`color-picker-${c.label}`).click()}
                    />
                    <input 
                      type="color" 
                      id={`color-picker-${c.label}`} 
                      value={c.value} 
                      onChange={e => c.set(e.target.value)} 
                      className="w-0 h-0 opacity-0 absolute pointer-events-none" 
                    />
                    <div className="flex-1 min-w-0">
                      <input 
                        type="text" 
                        value={c.value} 
                        onChange={e => c.set(e.target.value)} 
                        className="bg-transparent text-slate-700 font-mono text-[10px] font-bold w-full uppercase outline-none focus:text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Brand Palette Color Blocks Preview */}
            <div className="space-y-2 mt-4.5 bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Palette Contrast Preview</span>
              <div className="flex h-6 rounded-lg overflow-hidden border border-slate-300">
                <div className="flex-1" style={{ backgroundColor: primaryColor }} title="Primary" />
                <div className="flex-1 animate-pulse" style={{ backgroundColor: accentColor }} title="Accent" />
                <div className="flex-1" style={{ backgroundColor: secondaryColor }} title="Secondary" />
              </div>
            </div>
          </div>

          {/* Typography Selector Card */}
          <div className="bg-[#ffffff] border border-slate-200 rounded-[24px] p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <Type className="w-4 h-4 text-brand-600" />
              <h3 className="text-slate-800 font-bold text-sm">Brand Text & Typography</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Custom Brand Text</label>
                  <input 
                    value={customText} 
                    onChange={e => setCustomText(e.target.value)} 
                    placeholder="Your Brand Name" 
                    className="w-full h-11 bg-slate-50 border border-slate-300 rounded-xl px-3 text-slate-800 text-sm focus:outline-none focus:border-brand-500 transition-colors" 
                  />
                </div>
                <div className="relative">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Font Style</label>
                  <select 
                    value={fontStyle} 
                    onChange={e => setFontStyle(e.target.value)} 
                    className="w-full h-11 bg-slate-50 border border-slate-300 rounded-xl px-2.5 text-slate-800 text-sm focus:outline-none focus:border-brand-500 appearance-none"
                  >
                    {FONT_STYLES.map(f => <option key={f} value={f} style={{ backgroundColor: '#ffffff', color: '#1e293b' }} className="bg-white text-slate-800">{f}</option>)}
                  </select>
                  <div className="absolute right-3 top-[38px] pointer-events-none text-slate-500">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Font Size</label>
                    <span className="text-xs text-brand-600 font-extrabold">{fontSize}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="32" 
                    value={fontSize} 
                    onChange={e => setFontSize(+e.target.value)} 
                    className="w-full accent-brand-500 bg-slate-200 h-1.5 rounded-lg cursor-pointer" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Font Weight</label>
                  <div className="flex gap-1 bg-slate-50 p-1 border border-slate-300 rounded-xl h-11 items-center">
                    {['Normal', 'Medium', 'Bold'].map(w => (
                      <button 
                        key={w} 
                        type="button"
                        onClick={() => setFontWeight(w)} 
                        className={`flex-1 h-8 rounded-lg text-[10px] font-bold transition-all ${
                          fontWeight === w 
                            ? 'bg-brand-600 text-white shadow-md' 
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Typography Preview Area */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col justify-center items-center gap-1.5 text-center min-h-[72px]">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Live Typeface Preview</span>
                <p 
                  style={{ 
                    fontFamily: fontStyle, 
                    fontSize: `${fontSize}px`, 
                    fontWeight: fontWeight === 'Bold' ? 'bold' : fontWeight === 'Medium' ? '500' : 'normal',
                    color: accentColor 
                  }} 
                  className="transition-all duration-200"
                >
                  {customText || 'Your Brand Name'}
                </p>
              </div>
            </div>
          </div>

          {/* Logo & Position Customization Card */}
          <div className="bg-[#ffffff] border border-slate-200 rounded-[24px] p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <Wand2 className="w-4 h-4 text-brand-600" />
              <h3 className="text-slate-800 font-bold text-sm">Personalization Controls</h3>
            </div>

            <div className="space-y-4">
              {/* Logo Settings */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest block">Logo Settings</span>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Logo Size</label>
                      <span className="text-xs text-brand-600 font-extrabold">{logoSize}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="30" 
                      max="120" 
                      value={logoSize} 
                      onChange={e => setLogoSize(+e.target.value)} 
                      className="w-full accent-brand-500 bg-slate-200 h-1.5 rounded-lg cursor-pointer" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Logo Rotation</label>
                      <span className="text-xs text-brand-600 font-extrabold">{logoRotation}°</span>
                    </div>
                    <input 
                      type="range" 
                      min="-180" 
                      max="180" 
                      value={logoRotation} 
                      onChange={e => setLogoRotation(+e.target.value)} 
                      className="w-full accent-brand-500 bg-slate-200 h-1.5 rounded-lg cursor-pointer" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Logo Placement Position</label>
                  <div className="flex gap-1 bg-slate-50 p-1 border border-slate-300 rounded-xl h-11 items-center">
                    {['Top', 'Center', 'Bottom'].map(pos => (
                      <button 
                        key={pos} 
                        type="button"
                        onClick={() => { setLogoPosition(pos); setShowLogoOnProduct(true); }} 
                        className={`flex-1 h-8 rounded-lg text-[10px] font-bold transition-all ${
                          logoPosition === pos 
                            ? 'bg-brand-600 text-white shadow-md' 
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Text Settings */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest block">Text Layout Settings</span>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Text Position</label>
                    <div className="flex gap-1 bg-slate-50 p-1 border border-slate-300 rounded-xl h-11 items-center">
                      {POSITIONS.map(pos => (
                        <button 
                          key={pos} 
                          type="button"
                          onClick={() => setTextPosition(pos)} 
                          className={`flex-1 h-8 rounded-lg text-[10px] font-bold transition-all ${
                            textPosition === pos 
                              ? 'bg-brand-600 text-white shadow-md' 
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Text Alignment</label>
                    <div className="flex gap-1 bg-slate-50 p-1 border border-slate-300 rounded-xl h-11 items-center">
                      {['Left', 'Center', 'Right'].map(a => {
                        const isSel = textAlign === a;
                        return (
                          <button 
                            key={a} 
                            type="button"
                            onClick={() => setTextAlign(a)} 
                            className={`flex-1 h-8 rounded-lg flex items-center justify-center transition-all ${
                              isSel 
                                ? 'bg-brand-600 text-white shadow-md' 
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                            }`}
                            title={`Align ${a}`}
                          >
                            {a === 'Left' ? <AlignLeft className="w-3.5 h-3.5" /> : a === 'Right' ? <AlignRight className="w-3.5 h-3.5" /> : <AlignCenter className="w-3.5 h-3.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Settings */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest block">Product Settings</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Placement Area</label>
                    <select 
                      value={placementArea} 
                      onChange={e => setPlacementArea(e.target.value)} 
                      className="w-full h-11 bg-slate-55 border border-slate-300 rounded-xl px-2.5 text-slate-800 text-xs focus:outline-none focus:border-brand-500 appearance-none"
                    >
                      {['Front Cover', 'Back Cover', 'Inner Sleeve', 'Gift Box Lid'].map(p => (
                        <option key={p} value={p} style={{ backgroundColor: '#ffffff', color: '#1e293b' }}>{p}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-[38px] pointer-events-none text-slate-500">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Branding Position</label>
                    <select 
                      value={brandingPosition} 
                      onChange={e => setBrandingPosition(e.target.value)} 
                      className="w-full h-11 bg-slate-55 border border-slate-300 rounded-xl px-2.5 text-slate-800 text-xs focus:outline-none focus:border-brand-500 appearance-none"
                    >
                      {['Center Centered', 'Bottom Right Corner', 'Top Center', 'Left Chest'].map(p => (
                        <option key={p} value={p} style={{ backgroundColor: '#ffffff', color: '#1e293b' }}>{p}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-[38px] pointer-events-none text-slate-500">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Style Suggestion Overlay Card */}
          <div className="bg-brand-50/50 border border-brand-100 rounded-[24px] p-6 flex items-start gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <p className="text-brand-700 font-extrabold text-sm">AI Style suggestion</p>
              <p className="text-slate-600 text-xs mt-1.5 leading-relaxed">
                Based on your selections, a minimalist logo + monochrome palette works best for executive corporate gifting. Consider embossing on the front cover of the {selectedProduct.label}.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      {showFullPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-white/10 rounded-[32px] overflow-hidden max-w-2xl w-full shadow-2xl relative">
            <button 
              onClick={() => setShowFullPreview(false)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-950/80 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              ✕
            </button>
            
            <div 
              className={`h-[420px] w-full flex flex-col items-center justify-center overflow-hidden bg-${previewBackground}`}
              style={{ '--primary': primaryColor, '--accent': accentColor }}
            >
              <div className="relative z-10 flex flex-col items-center justify-center gap-4 animate-float-mockup scale-125">
                <span className="text-9xl drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] select-none">
                  {selectedProduct.emoji}
                </span>

                {showLogoOnProduct && (
                  <div 
                    style={{ 
                      width: `${logoSize * 1.25}px`, 
                      height: `${logoSize * 1.25}px`,
                      transform: `rotate(${logoRotation}deg)`,
                      backgroundColor: primaryColor,
                      borderColor: `${accentColor}40`,
                    }}
                    className="rounded-xl flex items-center justify-center border bg-white/10 backdrop-blur-md shadow-xl p-2.5"
                  >
                    <span className="text-white text-[10px] font-black tracking-tight text-center leading-none select-none uppercase">
                      {logoName ? logoName.replace(/\.[^/.]+$/, '').slice(0, 8) : 'LOGO'}
                    </span>
                  </div>
                )}

                {customText && (
                  <div className={`w-full ${textPosition === 'Top' ? 'order-first' : textPosition === 'Center' ? '' : 'order-last'}`} style={{ textAlign: textAlign.toLowerCase() }}>
                    <p style={{ fontFamily: fontStyle, fontSize: `${fontSize * 1.2}px`, color: accentColor, fontWeight: fontWeight === 'Bold' ? 'bold' : fontWeight === 'Medium' ? '500' : 'normal' }} className="drop-shadow-lg px-2 select-none whitespace-nowrap">
                      {customText}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 bg-slate-950 flex justify-between items-center border-t border-white/5">
              <span className="text-xs font-bold text-slate-350">{selectedProduct.label} Mockup View</span>
              <button 
                onClick={() => setShowFullPreview(false)}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
