import React, { useState, useMemo } from 'react';
import { FilterState } from './types';
import { 
  CURVED_PANEL_DATA, CURVED_SPANS,
  FLAT_PANEL_DATA, FLAT_SPANS,
  PENTA_PANEL_DATA,
  CURVED_ROCK_PANEL_DATA, CURVED_ROCK_SPANS,
  FLAT_ROCK_PANEL_DATA, FLAT_ROCK_SPANS
} from './services/data';
import { DataTable } from './components/DataTable';
import { LoadChart } from './components/LoadChart';
import { AIChat } from './components/AIChat';
import { 
  FileSpreadsheet, Ruler, MessageCircle, Info, LayoutTemplate, BoxSelect, 
  Github, Grid3x3, CircleDot, Square, ArrowUpFromLine, ArrowDownToLine, 
  ExternalLink, Share2, Printer, Download, Save, RefreshCw, Check
} from 'lucide-react';

const App: React.FC = () => {
  const [panelType, setPanelType] = useState<'curved' | 'flat' | 'penta' | 'rock' | 'flat_rock'>('curved');
  const [filters, setFilters] = useState<FilterState>({
    thickness: 'all',
    steelExt: 'all',
    steelInt: 'all',
  });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  const { currentData, currentSpans, title, configInfo } = useMemo(() => {
    const configs = {
      curved: { data: CURVED_PANEL_DATA, spans: CURVED_SPANS, title: "Curvi EPS", info: "EPS Curvo" },
      flat: { data: FLAT_PANEL_DATA, spans: FLAT_SPANS, title: "Piani EPS", info: "EPS Piano" },
      penta: { data: PENTA_PANEL_DATA, spans: CURVED_SPANS, title: "Penta Flagon", info: "Penta Flagon SW" },
      rock: { data: CURVED_ROCK_PANEL_DATA, spans: CURVED_ROCK_SPANS, title: "Curvo Rock", info: "Lana di Roccia Curvo" },
      flat_rock: { data: FLAT_ROCK_PANEL_DATA, spans: FLAT_ROCK_SPANS, title: "Piano Rock", info: "Lana di Roccia Piano" }
    };
    const c = configs[panelType];
    return { currentData: c.data, currentSpans: c.spans, title: c.title, configInfo: c.info };
  }, [panelType]);

  const filterOptions = useMemo(() => {
    const getUnique = (key: keyof typeof currentData[0]) => 
      Array.from(new Set(currentData.map(d => d[key] as number))).sort((a: number, b: number) => a - b);
    return {
      thicknesses: getUnique('thickness'),
      steelExts: getUnique('steelExt'),
      steelInts: getUnique('steelInt')
    };
  }, [currentData]);

  const filteredData = useMemo(() => {
    return currentData.filter((panel) => {
      const matchThickness = filters.thickness === 'all' || panel.thickness === filters.thickness;
      const matchSteelExt = filters.steelExt === 'all' || panel.steelExt === filters.steelExt;
      const matchSteelInt = filters.steelInt === 'all' || panel.steelInt === filters.steelInt;
      return matchThickness && matchSteelExt && matchSteelInt;
    });
  }, [filters, currentData]);

  const handleTypeChange = (type: typeof panelType) => {
    setPanelType(type);
    setFilters({ thickness: 'all', steelExt: 'all', steelInt: 'all' });
  };

  const handlePrint = () => window.print();
  const handleReload = () => window.location.reload();
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'SW Calculator', url: window.location.href });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copiato negli appunti!");
    }
  };

  const handleDownloadCSV = () => {
    const headers = ["Spessore", "Est", "Int", "Peso", "Trasm", ...currentSpans.map(s => `Luce ${s}`)];
    const rows = filteredData.map(row => [
      row.thickness, row.steelExt, row.steelInt, row.weight, row.transmittance || '-',
      ...currentSpans.map(span => row.loads[span] ?? '')
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `portate_${panelType}.csv`);
    link.click();
  };

  const handleSave = () => {
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500 selection:text-white flex flex-col pb-36 sm:pb-32 print:pb-0 overflow-x-hidden">
      <style>{`
        @media print { .no-print { display: none !important; } body { background: white; color: black; } }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Header Mobile Opt */}
      <nav className="bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-30 no-print">
        <div className="max-w-full px-4 h-16 sm:h-20 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-900/20">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-bold text-white leading-tight">Portate SW</h1>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter sm:block hidden">EPS & Rock Panels</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`flex items-center justify-center w-10 h-10 sm:w-auto sm:px-4 sm:py-2 rounded-xl transition-all shadow-md ${
                isChatOpen ? 'bg-blue-600 text-white shadow-blue-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title="AI Assistant"
            >
              <MessageCircle className="w-5 h-5 sm:mr-2" />
              <span className="hidden sm:inline text-sm font-semibold">AI Assistant</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="w-full px-4 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6 flex-grow">
        
        {/* Horizontal Nav for Panel Types */}
        <div className="no-print">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 px-0.5 snap-x">
            {[
              { id: 'curved', icon: LayoutTemplate, label: 'Curvo EPS' },
              { id: 'flat', icon: BoxSelect, label: 'Piano EPS' },
              { id: 'penta', icon: Grid3x3, label: 'Penta' },
              { id: 'rock', icon: CircleDot, label: 'Curvo Rock' },
              { id: 'flat_rock', icon: Square, label: 'Piano Rock' }
            ].map(type => (
              <button
                key={type.id}
                onClick={() => handleTypeChange(type.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap snap-start border ${
                  panelType === type.id 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <type.icon className="w-4 h-4" />
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters - Stacked on Mobile, Row on Desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 no-print">
          {[
            { id: 'thickness', icon: Ruler, label: 'Spessore', options: filterOptions.thicknesses, suffix: 'mm' },
            { id: 'steelExt', icon: ArrowUpFromLine, label: 'Esterno', options: filterOptions.steelExts, suffix: 'mm' },
            { id: 'steelInt', icon: ArrowDownToLine, label: 'Interno', options: filterOptions.steelInts, suffix: 'mm' }
          ].map(f => (
            <div key={f.id} className="relative">
              <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                <f.icon className="h-4 w-4 text-slate-500" />
              </div>
              <select
                value={filters[f.id as keyof FilterState]}
                onChange={(e) => setFilters(prev => ({ ...prev, [f.id]: e.target.value === 'all' ? 'all' : Number(e.target.value) }))}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-900 border border-slate-800 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer hover:bg-slate-850"
              >
                <option value="all">{f.label}: Tutti</option>
                {f.options.map(opt => <option key={opt} value={opt}>{opt} {f.suffix}</option>)}
              </select>
            </div>
          ))}
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                {title}
              </h2>
              <span className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">KG/MQ</span>
            </div>
            
            {filteredData.length > 0 ? (
              <DataTable data={filteredData} spans={currentSpans} />
            ) : (
              <div className="h-48 flex flex-col items-center justify-center bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-800 text-slate-500">
                <Info className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm font-medium">Nessuna variante trovata</p>
              </div>
            )}
          </div>

          <div className="xl:col-span-1 space-y-6 no-print">
            <div className="hidden sm:block">
              <LoadChart data={filteredData.slice(0, 5)} spans={currentSpans} />
            </div>
            
            <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-[11px] leading-relaxed text-slate-400">
                  <p className="font-bold text-slate-200 mb-1">DISCLAIMER</p>
                  Valori calcolati per appoggio semplice (schema a campata singola). 
                  Per configurazioni a più appoggi o carichi speciali contattare l'ufficio tecnico.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MOBILE OPTIMIZED TOOLBAR */}
      <div className="fixed bottom-6 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-40 no-print">
        <div className="flex items-center justify-between sm:justify-center gap-1 sm:gap-4 p-2 bg-slate-900/90 backdrop-blur-2xl border border-slate-700/50 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
          
          <button onClick={handleShare} className="flex-1 sm:flex-none flex flex-col items-center gap-1 p-2 sm:p-3 rounded-xl hover:bg-slate-800 transition-all text-slate-400 active:bg-blue-600/20 active:text-blue-400">
            <Share2 className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-tighter">Share</span>
          </button>

          <button onClick={handlePrint} className="flex-1 sm:flex-none flex flex-col items-center gap-1 p-2 sm:p-3 rounded-xl hover:bg-slate-800 transition-all text-slate-400 active:bg-slate-700 active:text-white">
            <Printer className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-tighter">PDF</span>
          </button>

          <div className="w-px h-10 bg-slate-800 mx-1"></div>

          <button onClick={handleDownloadCSV} className="flex-1 sm:flex-none flex flex-col items-center gap-1 p-2 sm:p-3 rounded-xl hover:bg-slate-800 transition-all text-slate-400 active:bg-emerald-600/20 active:text-emerald-400">
            <Download className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-tighter">Excel</span>
          </button>

          <button onClick={handleSave} className="flex-1 sm:flex-none flex flex-col items-center gap-1 p-2 sm:p-3 rounded-xl hover:bg-slate-800 transition-all text-slate-400 active:bg-amber-600/20 active:text-amber-400">
            {saveStatus === 'saved' ? <Check className="w-5 h-5 text-emerald-500" /> : <Save className="w-5 h-5" />}
            <span className="text-[9px] font-bold uppercase tracking-tighter">{saveStatus === 'saved' ? 'Fatto' : 'Save'}</span>
          </button>

          <div className="w-px h-10 bg-slate-800 mx-1"></div>

          <button onClick={handleReload} className="flex-1 sm:flex-none flex flex-col items-center gap-1 p-2 sm:p-3 rounded-xl hover:bg-slate-800 transition-all text-slate-400 active:bg-purple-600/20 active:text-purple-400">
            <RefreshCw className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-tighter">Reset</span>
          </button>
        </div>
      </div>

      <footer className="py-8 sm:py-12 border-t border-slate-900 bg-slate-950/50 no-print flex flex-col items-center gap-4 px-6">
        <p className="text-[11px] sm:text-xs text-slate-600 font-medium">© {new Date().getFullYear()} SW Portate Pro • Sistema Digitale di Calcolo</p>
        <a href="https://app.netlify.com/projects/sandwich-panel-load-capacities/deploys" target="_blank" className="hover:opacity-100 opacity-60 transition-opacity">
          <img src="https://api.netlify.com/api/v1/badges/7751a6dc-97d0-4a2d-a1aa-1f9cb96cfb1d/deploy-status" alt="Netlify" className="h-4 sm:h-5" />
        </a>
      </footer>

      <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} contextData={filteredData} />
    </div>
  );
};

export default App;